import { services } from "@/content/services";
import { siteUrl } from "@/config/site";
import { analyticsAllowed, type FunnelEvent } from "@/lib/analytics";
import { RESOURCE_EVENT_PREFIX } from "@/lib/resource-constants";

/**
 * First-party website counts (owner ruling 2026-10-06, A4). The browser reports a page view or a fixed event to
 * /api/stats; this turns the report into at most two daily totals (supabase/migrations/*_site_stats.sql). Nothing
 * that identifies a visitor is kept: no cookie, IP address, user agent, query string or referrer path. Pure, so the
 * rules are tested in e2e/guardrails.spec.ts.
 */

export const EVENTS: readonly FunnelEvent[] = ["Start Form: Started", "Start Form: Submitted", "Service: Viewed", "Booking: Clicked"];

/** Public pages counted under their own path; anything else (an old link, a 404) counts as /other. */
export const COUNTED_PATHS = new Set([
  "/", "/services", "/tab-method", "/about", "/about/our-story", "/about/team", "/faq", "/start", "/book",
  "/resources", "/events", "/privacy", "/terms", "/accessibility", "/policies",
  ...services.map((s) => `/services/${s.path}`),
]);

/** A page's name for the owner's report ("Massage & Bodywork", not "/services/massage-bodywork"). */
export function pageName(path: string): string {
  const s = services.find((x) => path === `/services/${x.path}`);
  if (s) return s.name;
  const names: Record<string, string> = {
    "/": "Home", "/services": "Services", "/tab-method": "The TAB Method", "/about": "About", "/about/our-story": "Our Story",
    "/about/team": "Our Team", "/faq": "FAQ", "/start": "Start Where You Are", "/book": "Book", "/resources": "Resources",
    "/events": "Events & Workshops", "/privacy": "Privacy policy", "/terms": "Terms of use", "/accessibility": "Accessibility",
    "/policies": "Client policies", "/other": "Other pages",
  };
  return names[path] ?? path;
}

export type StatReport = { k?: unknown; p?: unknown; e?: unknown; r?: unknown };
export type StatRow = { kind: "pageview" | "event" | "referrer"; key: string };

const OUR_HOSTS = new Set([new URL(siteUrl).hostname, new URL(siteUrl).hostname.replace(/^www\./, ""), "tabmassage.com", "www.tabmassage.com"]);

/** Path only, without query, fragment or trailing slash; null for anything that isn't a plain site path. */
export function normalizePath(p: unknown): string | null {
  if (typeof p !== "string" || !p.startsWith("/") || p.length > 300) return null;
  const path = p.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
  return /^\/[\w\-/]*$/.test(path) ? path : null;
}

/** The external site that sent a visitor, as a bare hostname; null for direct visits and our own domains. */
export function referrerHost(r: unknown): string | null {
  if (typeof r !== "string" || !r) return null;
  try {
    const u = new URL(r);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    const host = u.hostname.toLowerCase();
    if (OUR_HOSTS.has(host) || host.endsWith(".vercel.app") || host === "localhost" || host.length > 100) return null;
    return host.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/** The totals one report adds to. Empty for excluded pages (My TAB, TAB Practice, /contact) and anything malformed. */
export function statRows(report: StatReport): StatRow[] {
  const path = normalizePath(report.p);
  if (!path || !analyticsAllowed(path)) return [];
  if (report.k === "pageview") {
    const rows: StatRow[] = [{ kind: "pageview", key: COUNTED_PATHS.has(path) ? path : "/other" }];
    const host = referrerHost(report.r);
    if (host) rows.push({ kind: "referrer", key: host });
    return rows;
  }
  if (report.k === "event" && typeof report.e === "string" && (EVENTS as readonly string[]).includes(report.e)) {
    return [{ kind: "event", key: report.e }];
  }
  return [];
}

/** Crawlers and link previews aren't visitors. */
export const isBot = (ua: string | null) => !ua || /bot|crawl|spider|slurp|preview|headless|lighthouse|monitor|curl|wget|python|http-client/i.test(ua);

export type SiteStats = {
  /** True on previews and tests, where the numbers are a fixed sample, not real visits. */
  demo: boolean;
  days: { day: string; views: number }[];
  totals: { views: number } & Record<FunnelEvent, number>;
  pages: { key: string; count: number }[];
  referrers: { key: string; count: number }[];
  /** Resources opened (links followed, documents downloaded), by address: counted by the server (lib/resource-stats.ts). */
  resources: { key: string; count: number }[];
};


/** The last `n` days, oldest first, as YYYY-MM-DD in the studio's time zone. */
export function lastDays(n: number, today = new Date()): string[] {
  const local = new Date(today.toLocaleString("en-US", { timeZone: "America/Detroit" }));
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(local);
    d.setDate(local.getDate() - (n - 1 - i));
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
}

function summarize(rows: { day: string; kind: string; key: string; count: number }[], days: string[], demo: boolean): SiteStats {
  const byDay = new Map(days.map((d) => [d, 0]));
  const pages = new Map<string, number>(), refs = new Map<string, number>(), opened = new Map<string, number>();
  const totals = { views: 0, ...Object.fromEntries(EVENTS.map((e) => [e, 0])) } as SiteStats["totals"];
  for (const r of rows) {
    if (!byDay.has(r.day)) continue;
    if (r.kind === "pageview") {
      byDay.set(r.day, (byDay.get(r.day) ?? 0) + r.count);
      pages.set(r.key, (pages.get(r.key) ?? 0) + r.count);
      totals.views += r.count;
    } else if (r.kind === "referrer") refs.set(r.key, (refs.get(r.key) ?? 0) + r.count);
    else if ((EVENTS as readonly string[]).includes(r.key)) totals[r.key as FunnelEvent] += r.count;
    else if (r.key.startsWith(RESOURCE_EVENT_PREFIX)) {
      const slug = r.key.slice(RESOURCE_EVENT_PREFIX.length);
      opened.set(slug, (opened.get(slug) ?? 0) + r.count);
    }
  }
  const top = (m: Map<string, number>) => [...m].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count || a.key.localeCompare(b.key)).slice(0, 10);
  return { demo, days: days.map((day) => ({ day, views: byDay.get(day) ?? 0 })), totals, pages: top(pages), referrers: top(refs), resources: top(opened) };
}

/** A fixed, believable sample for previews, so the page can be reviewed without real visits. */
function demoRows(days: string[]) {
  const rows: { day: string; kind: string; key: string; count: number }[] = [];
  const paths = ["/", "/services/massage-bodywork", "/start", "/services/functional-strength", "/about", "/book", "/services/womens-wellness"];
  days.forEach((day, i) => {
    const base = 18 + ((i * 7) % 11) + (new Date(day).getUTCDay() === 1 ? 9 : 0);
    paths.forEach((p, j) => rows.push({ day, kind: "pageview", key: p, count: Math.max(1, Math.round(base / (j + 1.4))) }));
    rows.push({ day, kind: "event", key: "Start Form: Started", count: 1 + (i % 3) }, { day, kind: "event", key: "Start Form: Submitted", count: i % 2 });
    rows.push({ day, kind: "event", key: "Booking: Clicked", count: 2 + (i % 4) }, { day, kind: "event", key: "Service: Viewed", count: 9 + (i % 5) });
    rows.push({ day, kind: "referrer", key: "google.com", count: 4 + (i % 3) }, { day, kind: "referrer", key: "facebook.com", count: i % 3 });
    rows.push({ day, kind: "event", key: `${RESOURCE_EVENT_PREFIX}sample-guide`, count: i % 4 });
  });
  return rows;
}

/** The owner's view of the last `n` days (row-level security: only the verified owner can read the totals). */
export async function getSiteStats(n = 30): Promise<SiteStats> {
  const days = lastDays(n);
  const { siteConfig } = await import("@/config/site");
  if (!siteConfig.portal.realStaffSignIn) return summarize(demoRows(days), days, true);
  const { createSupabaseServerClient } = await import("@/lib/supabase/server");
  const sb = await createSupabaseServerClient();
  const { data, error } = await sb.from("site_stats").select("day, kind, key, count").gte("day", days[0]).limit(20_000);
  if (error) throw new Error(error.message);
  return summarize(data ?? [], days, false);
}


