import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { indexingAllowed, siteConfig, siteUrl } from "@/config/site";
import { assertLaunchReady } from "@/lib/placeholders";

// The indexing switch is the launch switch: refuse to build a launch while required items are open.
if (indexingAllowed) assertLaunchReady();

// Self-hosted (app/fonts, SIL Open Font License): the Google Fonts latin files, so builds never fetch from Google.
// next/font/google broke CI on 2026-09-28 when Google served font URLs it couldn't parse. Both are variable fonts.
const cormorant = localFont({
  src: [
    { path: "./fonts/cormorant-garamond-latin.woff2", weight: "500 600", style: "normal" },
    { path: "./fonts/cormorant-garamond-italic-latin.woff2", weight: "500 600", style: "italic" },
  ],
  variable: "--font-cormorant",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});
const manrope = localFont({
  src: [{ path: "./fonts/manrope-latin.woff2", weight: "400 700", style: "normal" }],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${siteConfig.brand.name} | Massage, Strength & Coaching`, template: `%s | ${siteConfig.brand.name}` },
  description:
    "TAB Wellness Collective brings massage, personal strength training, women’s wellness coaching, and holistic life coaching together in one personalized, whole-person approach.",
  applicationName: siteConfig.brand.name,
  openGraph: {
    siteName: siteConfig.brand.name,
    type: "website",
    locale: "en_US",
    images: [{ url: "/brand/og-default.png", width: 1200, height: 630, alt: siteConfig.brand.name }],
  },
  // Icon set rendered from the vector symbol (WEB-019); the web manifest is app/manifest.ts.
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  ...(indexingAllowed ? {} : { robots: { index: false, follow: false } }),
};

export const viewport: Viewport = { themeColor: "#5A6046" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${manrope.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
