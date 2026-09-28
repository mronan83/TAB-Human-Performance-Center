"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";

/**
 * D-046: Plausible on public pages; Meta pixel only once paid ads start; never in My TAB, practice tools,
 * or health-related forms. A tracker loaded on a public page stays loaded through client-side navigation,
 * so exclusion is enforced inside the trackers as well: Plausible's `data-exclude`, and pixel page views
 * sent per route by this component instead of the pixel's automatic history tracking.
 */
const EXCLUDED = ["/my-tab", "/practice", "/start", "/contact"];
const isExcluded = (path: string) => EXCLUDED.some((p) => path === p || path.startsWith(`${p}/`));
const PLAUSIBLE_EXCLUDE = EXCLUDED.flatMap((p) => [p, `${p}/**`]).join(", ");

type Fbq = ((...args: unknown[]) => void) & { disablePushState?: boolean };

export function Analytics() {
  const pathname = usePathname();
  const { plausibleDomain, metaPixelId } = siteConfig.analytics;
  const excluded = isExcluded(pathname);
  const previousPath = useRef<string | null>(null);

  // The pixel snippet records the first page view itself; later route changes are recorded here.
  useEffect(() => {
    const fbq = (window as unknown as { fbq?: Fbq }).fbq;
    if (metaPixelId && previousPath.current !== null && !excluded) fbq?.("track", "PageView");
    previousPath.current = pathname;
  }, [metaPixelId, excluded, pathname]);

  if (excluded) return null;
  return (
    <>
      {plausibleDomain && (
        <Script
          defer
          data-domain={plausibleDomain}
          data-exclude={PLAUSIBLE_EXCLUDE}
          src="https://plausible.io/js/script.exclusions.js"
          strategy="afterInteractive"
        />
      )}
      {metaPixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq.disablePushState=true;fbq('init','${metaPixelId}');fbq('track','PageView');`}</Script>
      )}
    </>
  );
}
