import { siteConfig } from "@/config/site";
import { about, legal, faqs } from "@/content/pages";
import { services } from "@/content/services";

/** `optional` items never block launch; every other open item fails the launch gate below. */
export type ChecklistItem = { area: string; item: string; where: string; done: boolean; optional?: boolean };

/** Computes launch-readiness from config and content so the owner can see what is still temporary. */
export function launchChecklist(): ChecklistItem[] {
  const c = siteConfig;
  const hoursSet = c.contact.hours.every((h) => h.closed || (h.open && h.open !== "PLACEHOLDER"));
  const items: ChecklistItem[] = [
    { area: "Contact", item: "Phone number", where: "config/site.ts → contact.phone", done: !!c.contact.phone },
    { area: "Contact", item: "Street address, city, postal code", where: "config/site.ts → contact.address", done: !!(c.contact.address.street && c.contact.address.city && c.contact.address.postalCode) },
    { area: "Contact", item: "Business hours", where: "config/site.ts → contact.hours", done: hoursSet },
    { area: "Contact", item: "Map link", where: "config/site.ts → contact.mapUrl", done: !!c.contact.mapUrl, optional: true },
    { area: "Booking", item: "Timely booking link", where: "config/site.ts → booking.timelyBookingUrl", done: !!c.booking.timelyBookingUrl },
    { area: "Booking", item: "Timely Client Login link", where: "config/site.ts → booking.timelyClientLoginUrl", done: !!c.booking.timelyClientLoginUrl },
    { area: "Booking", item: "Gift cards link (optional)", where: "config/site.ts → booking.giftCardsUrl", done: !!c.booking.giftCardsUrl, optional: true },
    { area: "Brand", item: "Vector logo files from designer (replace PNGs)", where: "public/brand/", done: true },
    { area: "Brand", item: "Designer: horizontal lockups with WELLNESS COLLECTIVE legible at header size (now ~3px tall)", where: "public/brand/logo-horizontal*.svg", done: false },
    { area: "Brand", item: "Designer: vector service icons (currently PNG)", where: "public/brand/icons/", done: false, optional: true },
    { area: "Brand", item: "Designer: clean up traced edges before print, vinyl or signage", where: "docs/source/batch-4/vector-logo-package", done: false, optional: true },
    { area: "Brand", item: "Social accounts renamed; URLs updated", where: "config/site.ts → social", done: !c.social.instagram?.includes("tab.massage"), optional: true },
    { area: "Forms", item: "Resend API key and verified sending domain", where: "Vercel env → RESEND_API_KEY", done: !!process.env.RESEND_API_KEY },
    // SEC-013: the forms email a copy to whatever address is entered (DIV-05), so the human check is required at launch.
    { area: "Forms", item: "Cloudflare Turnstile keys for the forms' human check (free account)", where: "Vercel env → NEXT_PUBLIC_TURNSTILE_SITE_KEY, TURNSTILE_SECRET_KEY", done: !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !!process.env.TURNSTILE_SECRET_KEY },
    { area: "Forms", item: "Shared rate limit for /api/inquiry at the edge (Vercel Firewall rule)", where: "Vercel project → Firewall (SEC-013)", done: false, optional: true },
    { area: "Analytics", item: "Plausible domain, plus goals for the Start Form: Started / Submitted events", where: "config/site.ts → analytics.plausibleDomain", done: !!c.analytics.plausibleDomain, optional: true },
    { area: "Content", item: "Our Story written with owner", where: "content/pages.ts → about.story", done: !about.story.draft },
    { area: "Content", item: "Team bios, credentials, photos", where: "content/pages.ts → about.team", done: !about.team.draft },
    { area: "Content", item: "Service FAQ answers reviewed", where: "content/services.ts → faqs", done: services.every((s) => s.faqs.every((f) => !f.draft)) },
    { area: "Content", item: "General FAQ reviewed", where: "content/pages.ts → faqs", done: faqs.every((f) => !f.draft) },
    { area: "Content", item: "Authentic photography", where: "public/images/ + pages", done: false },
    { area: "Legal", item: "Privacy policy (legal review)", where: "content/pages.ts → legal.privacy", done: !legal.privacy.draft },
    { area: "Legal", item: "Terms of use", where: "content/pages.ts → legal.terms", done: !legal.terms.draft },
    { area: "Legal", item: "Client policies (cancellation, scope)", where: "content/pages.ts → legal.policies", done: !legal.policies.draft },
    { area: "Brand", item: "Trademark clearance for TAB Wellness Collective (Step 19 gate)", where: "Decision register R-020", done: false, optional: true },
    { area: "Portal", item: "My TAB set to production mode (after D-042 infrastructure and legal review)", where: "config/site.ts → portal", done: c.portal.enabled && c.portal.dataSource === "supabase", optional: true },
  ];
  return items;
}

/**
 * Launch gate: switching on search indexing (NEXT_PUBLIC_ALLOW_INDEXING=true) is the launch switch, so the
 * production build fails while any required item is open. This keeps placeholder copy, draft legal pages
 * and missing contact details off the live site.
 */
export function assertLaunchReady(): void {
  const open = launchChecklist().filter((i) => !i.done && !i.optional);
  if (open.length === 0) return;
  throw new Error(
    `Launch gate: ${open.length} required item(s) still open. Finish them or leave NEXT_PUBLIC_ALLOW_INDEXING unset.\n` +
      open.map((i) => `  - ${i.area}: ${i.item} (${i.where})`).join("\n"),
  );
}
