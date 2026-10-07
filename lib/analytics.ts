import { siteConfig } from "@/config/site";

/**
 * Public events (NFR-006) and page views, counted by our own first-party counter (owner ruling 2026-10-06, A4:
 * "Let's build our own"): /api/stats adds them to daily totals in our database (lib/site-stats.ts). No cookies, no
 * visitor identifiers, no third party. Event names are a fixed list and events never carry properties, so nothing a
 * visitor types or selects can reach the counts (NFR-005, D-046 as amended by DIV-04).
 */
export type FunnelEvent = "Start Form: Started" | "Start Form: Submitted" | "Service: Viewed" | "Booking: Clicked";

/** Pages that never send analytics (guardrail 6, D-057): My TAB, TAB Practice, the contact form and the content editor. */
export const NO_ANALYTICS = ["/my-tab", "/practice", "/contact", "/keystatic"];
/** Pages that never load an ad pixel: the above, plus Start Where You Are. */
export const NO_PIXEL = [...NO_ANALYTICS, "/start"];
export const under = (paths: string[], path: string) => paths.some((p) => path === p || path.startsWith(`${p}/`));
export const analyticsAllowed = (path: string) => !under(NO_ANALYTICS, path);
export const pixelAllowed = (path: string) => !under(NO_PIXEL, path);
/** A service page (not the services list) counts one "Service: Viewed"; the page view itself says which. */
export const isServicePage = (path: string) => /^\/services\/[^/]+\/?$/.test(path);

/**
 * Sends one report to /api/stats. `keepalive` lets it finish when the visitor is leaving the page (a Book click), and
 * a plain fetch carries the Origin header the route checks. Never throws; counting must not affect the page.
 */
export function report(body: { k: "pageview" | "event"; p: string; e?: FunnelEvent; r?: string }) {
  if (typeof window === "undefined" || !siteConfig.analytics.firstParty || !analyticsAllowed(body.p)) return;
  try {
    void fetch("/api/stats", { method: "POST", body: JSON.stringify(body), keepalive: true, headers: { "content-type": "text/plain" } }).catch(() => undefined);
  } catch {
    // ignore
  }
}

export function trackEvent(name: FunnelEvent) {
  if (typeof window === "undefined") return;
  report({ k: "event", p: window.location.pathname, e: name });
}
