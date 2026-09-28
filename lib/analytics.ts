/**
 * Public funnel events (NFR-006) sent to Plausible, which is cookieless and stores no personal data.
 * Event names are a fixed list and events never carry properties, so nothing a visitor types or selects
 * can reach analytics (NFR-005, D-046 as amended by DIV-04). A no-op when Plausible isn't configured.
 */
export type FunnelEvent = "Start Form: Started" | "Start Form: Submitted";

export function trackEvent(name: FunnelEvent) {
  if (typeof window === "undefined") return;
  (window as unknown as { plausible?: (event: string) => void }).plausible?.(name);
}
