import { track, type BeforeSendEvent } from "@vercel/analytics";

/**
 * Public events (NFR-006), counted by Vercel Web Analytics (owner ruling 2026-10-06, A4): cookieless, no personal data,
 * served from our own domain. Event names are a fixed list and events never carry properties, so nothing a visitor
 * types or selects can reach analytics (NFR-005, D-046 as amended by DIV-04).
 */
export type FunnelEvent = "Start Form: Started" | "Start Form: Submitted" | "Service: Viewed" | "Booking: Clicked";

export function trackEvent(name: FunnelEvent) {
  if (typeof window === "undefined") return;
  track(name);
}

/** Pages that never send analytics (guardrail 6, D-057): My TAB, TAB Practice and the contact form. */
export const NO_ANALYTICS = ["/my-tab", "/practice", "/contact"];
/** Pages that never load an ad pixel: the above, plus Start Where You Are. */
export const NO_PIXEL = [...NO_ANALYTICS, "/start"];
export const under = (paths: string[], path: string) => paths.some((p) => path === p || path.startsWith(`${p}/`));
export const analyticsAllowed = (path: string) => !under(NO_ANALYTICS, path);
export const pixelAllowed = (path: string) => !under(NO_PIXEL, path);
/**
 * Drops every page view or event from an excluded page. The analytics script stays loaded through client-side
 * navigation (say, from the homepage into My TAB), so the exclusion has to live in the tracker, not just the layout.
 */
export function dropExcluded<E extends BeforeSendEvent>(event: E): E | null {
  try {
    return analyticsAllowed(new URL(event.url).pathname) ? event : null;
  } catch {
    return null;
  }
}
/** A service page (not the services list) counts one "Service: Viewed"; the page view itself says which. */
export const isServicePage = (path: string) => /^\/services\/[^/]+\/?$/.test(path);
