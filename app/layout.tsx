import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { indexingAllowed, siteConfig, siteUrl } from "@/config/site";
import { assertLaunchReady } from "@/lib/placeholders";

// The indexing switch is the launch switch: refuse to build a launch while required items are open.
if (indexingAllowed) assertLaunchReady();

// Self-hosted (app/fonts, SIL Open Font License): the Google Fonts latin files, so builds never fetch from Google.
// next/font/google broke CI on 2026-09-28 when Google served font URLs it couldn't parse. Montserrat is a variable font.
const montserrat = localFont({
  src: [{ path: "./fonts/montserrat-latin.woff2", weight: "400 800", style: "normal" }],
  variable: "--font-montserrat",
  display: "swap",
  adjustFontFallback: "Arial",
});
// Editorial accent face (Step 18.4): subheads, pull quotes, selected campaign lines.
const spectral = localFont({
  src: [
    { path: "./fonts/spectral-400-latin.woff2", weight: "400", style: "normal" },
    { path: "./fonts/spectral-500-latin.woff2", weight: "500", style: "normal" },
    { path: "./fonts/spectral-italic-latin.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-spectral",
  display: "swap",
  adjustFontFallback: "Times New Roman",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${siteConfig.brand.name} | Massage, Strength & Coaching`, template: `%s | ${siteConfig.brand.name}` },
  description:
    "TAB Human Performance Center helps you build the strength, resilience, adaptability and self-trust to meet real life, with massage, strength training and coaching in one integrated approach.",
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

export const viewport: Viewport = { themeColor: "#4A5A44" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${spectral.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
