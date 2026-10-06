"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import { PLAUSIBLE_EXCLUDE, analyticsAllowed, isServicePage, pixelAllowed, trackEvent } from "@/lib/analytics";

/**
 * D-046 as amended by the owner on 2026-09-28 (DIV-04, proposed D-057): Plausible on public pages, including
 * /start, where it counts the Start funnel with property-less events (lib/analytics.ts); never in My TAB,
 * practice tools, or the contact form. The Meta pixel runs only once paid ads start, and never on any of
 * those pages or /start. A tracker loaded on a public page stays loaded through client-side navigation, so
 * exclusion is enforced inside the trackers as well: Plausible's `data-exclude`, and pixel page views sent
 * per route by this component instead of the pixel's automatic history tracking. The path rules live in
 * lib/analytics.ts, where e2e/analytics.spec.ts checks them (NFR-005).
 *
 * Public events (C18, NFR-006): "Service: Viewed" on each service page, and "Booking: Clicked" on any link marked
 * `data-event` (every Book call to action, components/Cta.tsx). Both property-less.
 */

type Fbq = ((...args: unknown[]) => void) & { disablePushState?: boolean };

export function Analytics() {
  const pathname = usePathname();
  const { plausibleDomain, metaPixelId } = siteConfig.analytics;
  const noAnalytics = !analyticsAllowed(pathname);
  const noPixel = !pixelAllowed(pathname);
  const previousPath = useRef<string | null>(null);

  // The pixel snippet records the first page view itself; later route changes are recorded here.
  useEffect(() => {
    const fbq = (window as unknown as { fbq?: Fbq }).fbq;
    if (metaPixelId && previousPath.current !== null && !noPixel) fbq?.("track", "PageView");
    previousPath.current = pathname;
  }, [metaPixelId, noPixel, pathname]);

  useEffect(() => {
    if (plausibleDomain && !noAnalytics && isServicePage(pathname)) trackEvent("Service: Viewed");
  }, [plausibleDomain, noAnalytics, pathname]);

  // One listener for every tracked link, so calls to action stay server components.
  useEffect(() => {
    if (!plausibleDomain || noAnalytics) return;
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.("[data-event]");
      if (el?.getAttribute("data-event") === "Booking: Clicked") trackEvent("Booking: Clicked");
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, [plausibleDomain, noAnalytics]);

  if (noAnalytics) return null;
  return (
    <>
      {plausibleDomain && (
        <>
          {/* Queues events fired before the script loads (Plausible's documented stub). */}
          <Script id="plausible-queue" strategy="afterInteractive">
            {`window.plausible=window.plausible||function(){(window.plausible.q=window.plausible.q||[]).push(arguments)}`}
          </Script>
          <Script
            defer
            data-domain={plausibleDomain}
            data-exclude={PLAUSIBLE_EXCLUDE}
            src="https://plausible.io/js/script.exclusions.js"
            strategy="afterInteractive"
          />
        </>
      )}
      {metaPixelId && !noPixel && (
        <Script id="meta-pixel" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq.disablePushState=true;fbq('init','${metaPixelId}');fbq('track','PageView');`}</Script>
      )}
    </>
  );
}
