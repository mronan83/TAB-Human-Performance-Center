import { siteConfig } from "@/config/site";
import { bookingHref } from "@/lib/links";
import type { ServiceSlug } from "@/content/services";

/**
 * Owner settings (C23, proposed D-067): stored in `app_settings` (supabase/migrations/20261009000000_owner_settings.sql),
 * changed in TAB Practice → Settings. Anyone may read them; only the owner, two-step-verified, may change them; every
 * change is audited.
 *
 * Reads are cached for 30 seconds and tagged, so a save shows on the site at once (revalidateTag) and a database
 * outage falls back to the defaults below instead of breaking pages. Where staff sign-in is the demo (previews, tests),
 * settings live in memory like the rest of the demo, so the page can be tried without touching the live site.
 */

export type PortalMode = "off" | "live";
/** Optional site pages (C23b). Events stays off in code until there's events content (see the part-2 migration). */
export type Features = { resources: boolean; team: boolean; events: boolean };
export const SERVICE_SLUGS = ["massage-bodywork", "personal-strength-training", "womens-wellness-coaching", "integrated-nutrition", "holistic-life-coaching"] as const satisfies readonly ServiceSlug[];
export type Settings = {
  /** Whether the client portal is open. "live" takes effect only in a build whose portal data is real (guardrail 4). */
  portalMode: PortalMode;
  /** The "TAB Massage & Fitness is becoming…" banner (Step 19); it also ends on its own after `hideAfter`. */
  transitionBanner: boolean;
  /** Whether Start Where You Are takes new submissions online. */
  startFormOpen: boolean;
  /** A Timely link per service for its Book buttons (C23b); null uses the main booking page. https only. */
  bookingLinks: Record<ServiceSlug, string | null>;
  features: Features;
};
export type SettingsRecord = Settings & { updatedAt: string | null };

export const DEFAULT_SETTINGS: Settings = {
  portalMode: "off",
  transitionBanner: true,
  startFormOpen: true,
  bookingLinks: Object.fromEntries(SERVICE_SLUGS.map((k) => [k, siteConfig.booking.serviceBookingUrls[k] ?? null])) as Record<ServiceSlug, string | null>,
  features: { resources: siteConfig.features.resources, team: siteConfig.features.team, events: siteConfig.features.events },
};
export const SETTINGS_TAG = "settings";

/** The shape the database enforces (app_settings_value_shape), checked again before saving. */
export const isBookingLink = (v: string) => v.length <= 500 && /^https:\/\/\S+$/.test(v);
const FEATURE_KEYS = ["resources", "team", "events"] as const;
type Row = { key: string; value: unknown; updated_at: string };
const fresh = (): SettingsRecord => ({ ...structuredClone(DEFAULT_SETTINGS), updatedAt: null });

/** Demo settings: one in-memory copy per server instance, like the demo portal data. */
let demo: SettingsRecord = fresh();
const usesDemo = () => !siteConfig.portal.realStaffSignIn;

function fromRows(rows: Row[]): SettingsRecord {
  const out = fresh();
  for (const r of rows) {
    if (r.key === "portal_mode" && (r.value === "off" || r.value === "live")) out.portalMode = r.value;
    if (r.key === "transition_banner" && typeof r.value === "boolean") out.transitionBanner = r.value;
    if (r.key === "start_form_open" && typeof r.value === "boolean") out.startFormOpen = r.value;
    const slug = r.key.startsWith("booking_") ? (r.key.slice(8) as ServiceSlug) : null;
    if (slug && slug in out.bookingLinks && (r.value === null || (typeof r.value === "string" && isBookingLink(r.value)))) out.bookingLinks[slug] = r.value;
    const feature = r.key.startsWith("feature_") ? (r.key.slice(8) as keyof Features) : null;
    if (feature && FEATURE_KEYS.includes(feature) && typeof r.value === "boolean") out.features[feature] = r.value;
    if (!out.updatedAt || r.updated_at > out.updatedAt) out.updatedAt = r.updated_at;
  }
  return out;
}

/** Current settings for any page or route. Never throws. */
export async function getSettings(): Promise<SettingsRecord> {
  if (usesDemo()) return demo;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return fresh();
  try {
    const res = await fetch(`${url}/rest/v1/app_settings?select=key,value,updated_at`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      next: { revalidate: 30, tags: [SETTINGS_TAG] },
    });
    if (!res.ok) throw new Error(`${res.status}`);
    return fromRows((await res.json()) as Row[]);
  } catch (e) {
    console.error("[settings] read failed; using defaults", e);
    return fresh();
  }
}

/**
 * Saves settings as the signed-in owner. The database checks the role and two-step verification again
 * (current_app_role()), so a caller that skipped requireOwner() still can't change anything.
 */
export async function saveSettings(next: Settings): Promise<void> {
  if (usesDemo()) {
    demo = { ...structuredClone(next), updatedAt: new Date().toISOString() };
    return;
  }
  const { createSupabaseServerClient } = await import("@/lib/supabase/server");
  const sb = await createSupabaseServerClient();
  const rows = [
    { key: "portal_mode", value: next.portalMode },
    { key: "transition_banner", value: next.transitionBanner },
    { key: "start_form_open", value: next.startFormOpen },
    ...SERVICE_SLUGS.map((k) => ({ key: `booking_${k}`, value: next.bookingLinks[k] })),
    ...FEATURE_KEYS.map((k) => ({ key: `feature_${k}`, value: next.features[k] })),
  ];
  const { data, error } = await sb.from("app_settings").upsert(rows, { onConflict: "key" }).select("key");
  if (error) throw new Error(error.message);
  if ((data ?? []).length !== rows.length) throw new Error("Only the owner, signed in with two-step verification, can change settings.");
}

/** Whether the client portal is open to clients right now: the owner's setting, within what this build allows. */
export async function portalOpen(): Promise<boolean> {
  if (!siteConfig.portal.enabled) return false;
  if (siteConfig.portal.dataSource !== "supabase") return true; // the demo: previews and tests only
  return (await getSettings()).portalMode === "live";
}

export type AccountLink = { href: string; label: string };

/**
 * The header and footer account link (WEB-020): "My TAB" once the client portal is open (the owner's Settings switch,
 * within what the build allows), and nothing before that. Owner ruling 2026-10-06: "The client login CTA button needs
 * to be hidden until the client portal is live. The book now CTA button fulfills the link to the booking site."
 */
export async function accountLink(): Promise<AccountLink | null> {
  return (await portalOpen()) ? { href: "/my-tab", label: "My TAB" } : null;
}

/** Where a service's Book buttons go: the owner's link for that service if set, else the configured booking page. */
export async function serviceBookingHref(slug: ServiceSlug): Promise<{ href: string; external: boolean }> {
  const link = (await getSettings()).bookingLinks[slug];
  return link ? { href: link, external: true } : bookingHref(slug);
}

/**
 * The optional pages that are on right now. Events also needs the code flag (`siteConfig.features.events`), which stays
 * off until there's events content, so the owner's switch can't publish an empty page.
 */
export async function siteFeatures(): Promise<Features> {
  const { features } = await getSettings();
  return { resources: features.resources, team: features.team, events: siteConfig.features.events && features.events };
}
