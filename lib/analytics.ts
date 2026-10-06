/**
 * Public events (NFR-006) sent to Plausible, which is cookieless and stores no personal data. Event names are a fixed
 * list and events never carry properties, so nothing a visitor types or selects can reach analytics (NFR-005, D-046 as
 * amended by DIV-04). A no-op when Plausible isn't configured. Each name needs a matching goal in Plausible (A4).
 */
export type FunnelEvent = "Start Form: Started" | "Start Form: Submitted" | "Service: Viewed" | "Booking: Clicked";

export function trackEvent(name: FunnelEvent) {
  if (typeof window === "undefined") return;
  (window as unknown as { plausible?: (event: string) => void }).plausible?.(name);
}

/** Pages that never load analytics (guardrail 6, D-057): My TAB, TAB Practice and the contact form. */
export const NO_ANALYTICS = ["/my-tab", "/practice", "/contact"];
/** Pages that never load an ad pixel: the above, plus Start Where You Are. */
export const NO_PIXEL = [...NO_ANALYTICS, "/start"];
export const under = (paths: string[], path: string) => paths.some((p) => path === p || path.startsWith(`${p}/`));
export const analyticsAllowed = (path: string) => !under(NO_ANALYTICS, path);
export const pixelAllowed = (path: string) => !under(NO_PIXEL, path);
/** Plausible's own exclusion list, so the script ignores these paths even after client-side navigation. */
export const PLAUSIBLE_EXCLUDE = NO_ANALYTICS.flatMap((p) => [p, `${p}/**`]).join(", ");
/** A service page (not the services list) counts one "Service: Viewed"; the page view itself says which. */
export const isServicePage = (path: string) => /^\/services\/[^/]+\/?$/.test(path);
