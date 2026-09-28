import { siteConfig } from "@/config/site";
import type { ServiceSlug } from "@/content/services";

/** Booking goes to Timely when configured (D-003); otherwise to the internal /book page. */
export function bookingHref(slug?: ServiceSlug): { href: string; external: boolean } {
  const perService = slug ? siteConfig.booking.serviceBookingUrls[slug] : null;
  const url = perService ?? siteConfig.booking.timelyBookingUrl;
  return url ? { href: url, external: true } : { href: "/book", external: false };
}

/**
 * "Client Login" goes to Timely (WEB-020, Step 19.14). Until the dedicated Client Login link is configured it opens the
 * Timely booking page, where clients manage bookings too. It never falls back to /contact: a login button that opens a
 * contact form reads as broken (owner feedback 2026-09-28).
 */
export function clientLoginHref(): { href: string; external: boolean } {
  const url = siteConfig.booking.timelyClientLoginUrl ?? siteConfig.booking.timelyBookingUrl;
  return url ? { href: url, external: true } : { href: "/book", external: false };
}

/** The header and footer account link: "My TAB" once the portal is live, else "Client Login" into Timely (WEB-020). */
export function accountLink(): { href: string; external: boolean; label: string } {
  return siteConfig.portal.enabled ? { href: "/my-tab", external: false, label: "My TAB" } : { ...clientLoginHref(), label: "Client Login" };
}

/** The footer entry to TAB Practice for practitioners; none while the portal is off. */
export function practitionerLink(): { href: string; label: string } | null {
  return siteConfig.portal.enabled && siteConfig.portal.showPracticeWorkspace ? { href: "/practice", label: "Practitioner login" } : null;
}

/** Opening hours as shown on the site; unset (PLACEHOLDER) hours read "By appointment". */
export function hoursText(h: { open: string; close: string; closed: boolean }): string {
  return h.closed ? "Closed" : h.open === "PLACEHOLDER" ? "By appointment" : `${h.open} – ${h.close}`;
}

export function transitionNoticeActive(now = new Date()): boolean {
  const n = siteConfig.brand.transitionNotice;
  return n.enabled && now <= new Date(n.hideAfter + "T23:59:59");
}
