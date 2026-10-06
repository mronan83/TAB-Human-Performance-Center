import { siteConfig } from "@/config/site";
import type { ServiceSlug } from "@/content/services";

/** Booking goes to Timely when configured (D-003); otherwise to the internal /book page. */
export function bookingHref(slug?: ServiceSlug): { href: string; external: boolean } {
  const perService = slug ? siteConfig.booking.serviceBookingUrls[slug] : null;
  const url = perService ?? siteConfig.booking.timelyBookingUrl;
  return url ? { href: url, external: true } : { href: "/book", external: false };
}

/**
 * Timely's client login (Step 19.14), used inside the interim /my-tab page and the portal's billing and appointment pages. Until the dedicated Client Login link is configured it opens the
 * Timely booking page, where clients manage bookings too. It never falls back to /contact: a login button that opens a
 * contact form reads as broken (owner feedback 2026-09-28).
 */
export function clientLoginHref(): { href: string; external: boolean } {
  const url = siteConfig.booking.timelyClientLoginUrl ?? siteConfig.booking.timelyBookingUrl;
  return url ? { href: url, external: true } : { href: "/book", external: false };
}

/** The footer entry to TAB Practice: real staff sign-in where it exists (C23), else the demo while the portal is on. */
export function practitionerLink(): { href: string; label: string } | null {
  if (!siteConfig.portal.showPracticeWorkspace) return null;
  if (siteConfig.portal.realStaffSignIn) return { href: "/practice/login", label: "Practitioner login" };
  return siteConfig.portal.enabled ? { href: "/practice", label: "Practitioner login" } : null;
}

type Hours = { days: string; open: string; close: string; closed: boolean };

/** "16:00" → "4 PM", "09:30" → "9:30 AM". */
const clock = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}${m ? `:${String(m).padStart(2, "0")}` : ""} ${h < 12 ? "AM" : "PM"}`;
};

/** Opening hours as shown on the site; unset (PLACEHOLDER) hours read "By appointment". */
export function hoursText(h: Omit<Hours, "days">): string {
  return h.closed ? "Closed" : h.open === "PLACEHOLDER" || !h.open ? "By appointment" : `${clock(h.open)} – ${clock(h.close)}`;
}

/** Consecutive days with the same hours, shown as one line ("Monday – Tuesday", "Saturday – Sunday"). */
export function groupedHours(hours: readonly Hours[]): { days: string; text: string }[] {
  const out: { first: string; last: string; text: string }[] = [];
  for (const h of hours) {
    const text = hoursText(h), prev = out.at(-1);
    if (prev && prev.text === text) prev.last = h.days;
    else out.push({ first: h.days, last: h.days, text });
  }
  return out.map((g) => ({ days: g.first === g.last ? g.first : `${g.first} – ${g.last}`, text: g.text }));
}

/** A dialable link for a US number however it's written ("(810) 844-1283" → "tel:+18108441283"). */
export function telHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `tel:+${digits.length === 10 ? `1${digits}` : digits}`;
}

export function transitionNoticeActive(now = new Date()): boolean {
  const n = siteConfig.brand.transitionNotice;
  return n.enabled && now <= new Date(n.hideAfter + "T23:59:59");
}

/** "7487 Grand River Ave, Brighton, MI 48114" (US style: no comma before the ZIP); empty while unset. */
export function formatAddress(a: { street: string | null; city: string | null; region: string; postalCode: string | null }): string {
  return [a.street, a.city, [a.region, a.postalCode].filter(Boolean).join(" ")].filter(Boolean).join(", ");
}
