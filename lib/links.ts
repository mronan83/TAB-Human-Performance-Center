import { siteConfig } from "@/config/site";
import type { ServiceSlug } from "@/content/services";

/** Booking goes to Timely when configured (D-003); otherwise to the internal /book page. */
export function bookingHref(slug?: ServiceSlug): { href: string; external: boolean } {
  const perService = slug ? siteConfig.booking.serviceBookingUrls[slug] : null;
  const url = perService ?? siteConfig.booking.timelyBookingUrl;
  return url ? { href: url, external: true } : { href: "/book", external: false };
}

export function clientLoginHref(): { href: string; external: boolean } {
  const url = siteConfig.booking.timelyClientLoginUrl;
  return url ? { href: url, external: true } : { href: "/contact", external: false };
}

export function transitionNoticeActive(now = new Date()): boolean {
  const n = siteConfig.brand.transitionNotice;
  return n.enabled && now <= new Date(n.hideAfter + "T23:59:59");
}
