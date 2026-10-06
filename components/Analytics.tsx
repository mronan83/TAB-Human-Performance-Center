"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import { analyticsAllowed, isServicePage, pixelAllowed, report, trackEvent } from "@/lib/analytics";

/**
 * D-046 as amended by the owner on 2026-09-28 (DIV-04, proposed D-057) and 2026-10-06 (A4): our own first-party
 * counts on public pages, including /start, where the Start funnel is counted with property-less events
 * (lib/analytics.ts); never in My TAB, practice tools, or the contact form. Counts go to /api/stats as daily totals; no
 * cookies, no visitor identifiers, no third-party script. The Meta pixel runs only once paid ads start, and never on any
 * of those pages or /start. Exclusion is enforced at every step: here, in report(), and again by the API route, so a
 * page reached by client-side navigation is never counted either. The rules are checked in e2e/guardrails.spec.ts.
 *
 * Public events (C18, NFR-006): "Service: Viewed" on each service page, and "Booking: Clicked" on any link marked
 * `data-event` (every Book call to action, components/Cta.tsx). Both property-less.
 */
type Fbq = ((...args: unknown[]) => void) & { disablePushState?: boolean };

export function Analytics() {
  const pathname = usePathname();
  const { firstParty, metaPixelId } = siteConfig.analytics;
  const firstView = useRef(true);
  const noAnalytics = !analyticsAllowed(pathname);
  const noPixel = !pixelAllowed(pathname);
  const previousPath = useRef<string | null>(null);

  // The pixel snippet records the first page view itself; later route changes are recorded here.
  useEffect(() => {
    const fbq = (window as unknown as { fbq?: Fbq }).fbq;
    if (metaPixelId && previousPath.current !== null && !noPixel) fbq?.("track", "PageView");
    previousPath.current = pathname;
  }, [metaPixelId, noPixel, pathname]);

  // One page view per route. The referring site is sent with the first view only (later views come from our own pages).
  useEffect(() => {
    if (!firstParty || noAnalytics) return;
    report({ k: "pageview", p: pathname, r: firstView.current ? document.referrer : undefined });
    firstView.current = false;
    if (isServicePage(pathname)) trackEvent("Service: Viewed");
  }, [firstParty, noAnalytics, pathname]);

  // One listener for every tracked link, so calls to action stay server components.
  useEffect(() => {
    if (!firstParty || noAnalytics) return;
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.("[data-event]");
      if (el?.getAttribute("data-event") === "Booking: Clicked") trackEvent("Booking: Clicked");
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, [firstParty, noAnalytics]);

  return (
    <>
      {metaPixelId && !noPixel && (
        <Script id="meta-pixel" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq.disablePushState=true;fbq('init','${metaPixelId}');fbq('track','PageView');`}</Script>
      )}
    </>
  );
}
