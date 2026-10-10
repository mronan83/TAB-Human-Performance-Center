import { portalOpen, siteFeatures } from "@/lib/settings";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const dynamic = "force-dynamic";
export const metadata = { title: "My TAB", robots: { index: false, follow: false } };

/**
 * My TAB. While the portal is closed, its one page sits in the website's header and footer. Once open, sign-in lives in
 * (signin) and the client's pages in (client), each with its own layout, so moving from sign-in into the portal always
 * draws the portal shell (a shared layout is kept as it is between its pages; owner report 2026-10-10).
 */
export default async function MyTabLayout({ children }: { children: React.ReactNode }) {
  if (!(await portalOpen())) {
    return (<><SiteHeader account={null} features={await siteFeatures()} /><main id="main">{children}</main><SiteFooter /></>);
  }
  return children;
}
