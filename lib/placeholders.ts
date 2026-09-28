import { siteConfig } from "@/config/site";
import { about, legal, faqs } from "@/content/pages";
import { services } from "@/content/services";

export type ChecklistItem = { area: string; item: string; where: string; done: boolean };

/** Computes launch-readiness from config and content so the owner can see what is still temporary. */
export function launchChecklist(): ChecklistItem[] {
  const c = siteConfig;
  const hoursSet = c.contact.hours.every((h) => h.closed || (h.open && h.open !== "PLACEHOLDER"));
  const items: ChecklistItem[] = [
    { area: "Contact", item: "Phone number", where: "config/site.ts → contact.phone", done: !!c.contact.phone },
    { area: "Contact", item: "Street address, city, postal code", where: "config/site.ts → contact.address", done: !!(c.contact.address.street && c.contact.address.city && c.contact.address.postalCode) },
    { area: "Contact", item: "Business hours", where: "config/site.ts → contact.hours", done: hoursSet },
    { area: "Contact", item: "Map link", where: "config/site.ts → contact.mapUrl", done: !!c.contact.mapUrl },
    { area: "Booking", item: "Timely booking link", where: "config/site.ts → booking.timelyBookingUrl", done: !!c.booking.timelyBookingUrl },
    { area: "Booking", item: "Timely Client Login link", where: "config/site.ts → booking.timelyClientLoginUrl", done: !!c.booking.timelyClientLoginUrl },
    { area: "Booking", item: "Gift cards link (optional)", where: "config/site.ts → booking.giftCardsUrl", done: !!c.booking.giftCardsUrl },
    { area: "Brand", item: "Vector logo files from designer (replace PNGs)", where: "public/brand/", done: false },
    { area: "Brand", item: "Social accounts renamed; URLs updated", where: "config/site.ts → social", done: !c.social.instagram?.includes("tab.massage") },
    { area: "Forms", item: "Resend API key and verified sending domain", where: "Vercel env → RESEND_API_KEY", done: !!process.env.RESEND_API_KEY },
    { area: "Analytics", item: "Plausible domain", where: "config/site.ts → analytics.plausibleDomain", done: !!c.analytics.plausibleDomain },
    { area: "Content", item: "Our Story written with owner", where: "content/pages.ts → about.story", done: !about.story.draft },
    { area: "Content", item: "Team bios, credentials, photos", where: "content/pages.ts → about.team", done: !about.team.draft },
    { area: "Content", item: "Service FAQ answers reviewed", where: "content/services.ts → faqs", done: services.every((s) => s.faqs.every((f) => !f.draft)) },
    { area: "Content", item: "General FAQ reviewed", where: "content/pages.ts → faqs", done: faqs.every((f) => !f.draft) },
    { area: "Content", item: "Authentic photography", where: "public/images/ + pages", done: false },
    { area: "Legal", item: "Privacy policy (legal review)", where: "content/pages.ts → legal.privacy", done: !legal.privacy.draft },
    { area: "Legal", item: "Terms of use", where: "content/pages.ts → legal.terms", done: !legal.terms.draft },
    { area: "Legal", item: "Client policies (cancellation, scope)", where: "content/pages.ts → legal.policies", done: !legal.policies.draft },
    { area: "Brand", item: "Trademark clearance for TAB Wellness Collective (Step 19 gate)", where: "Decision register R-020", done: false },
    { area: "Portal", item: "My TAB set to production mode (after D-042 infrastructure and legal review)", where: "config/site.ts → portal", done: c.portal.enabled && c.portal.dataSource === "supabase" },
  ];
  return items;
}
