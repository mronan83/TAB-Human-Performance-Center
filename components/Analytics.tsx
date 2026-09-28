"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";

/** D-046: Plausible on public pages; Meta pixel only when configured; never in My TAB, practice tools, or health-related forms. */
const EXCLUDED = ["/my-tab", "/practice", "/start", "/contact"];

export function Analytics() {
  const pathname = usePathname();
  const { plausibleDomain, metaPixelId } = siteConfig.analytics;
  const excluded = EXCLUDED.some((p) => pathname.startsWith(p));
  if (excluded) return null;
  return (
    <>
      {plausibleDomain && <Script defer data-domain={plausibleDomain} src="https://plausible.io/js/script.js" strategy="afterInteractive" />}
      {metaPixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaPixelId}');fbq('track','PageView');`}</Script>
      )}
    </>
  );
}
