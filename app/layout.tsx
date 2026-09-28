import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import { indexingAllowed, siteConfig, siteUrl } from "@/config/site";
import { assertLaunchReady } from "@/lib/placeholders";

// The indexing switch is the launch switch: refuse to build a launch while required items are open.
if (indexingAllowed) assertLaunchReady();

const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600"], style: ["normal", "italic"], variable: "--font-cormorant", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-manrope", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${siteConfig.brand.name} | Massage, Strength & Coaching`, template: `%s | ${siteConfig.brand.name}` },
  description:
    "TAB Wellness Collective brings massage, personal strength training, women’s wellness coaching, and holistic life coaching together in one personalized, whole-person approach.",
  applicationName: siteConfig.brand.name,
  openGraph: { siteName: siteConfig.brand.name, type: "website", locale: "en_US", images: ["/brand/logo-primary-stacked.png"] },
  icons: { icon: [{ url: "/favicon.ico" }, { url: "/favicon-32.png", type: "image/png" }], apple: "/apple-touch-icon.png" },
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
