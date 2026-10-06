import { headers } from "next/headers";
import { portalOpen, siteFeatures } from "@/lib/settings";
import { getViewer } from "@/lib/portal";
import { PortalShell } from "@/components/portal/PortalShell";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const dynamic = "force-dynamic";
export const metadata = { title: "My TAB", robots: { index: false, follow: false } };

export default async function MyTabLayout({ children }: { children: React.ReactNode }) {
  if (!(await portalOpen())) {
    return (<><SiteHeader account={null} features={await siteFeatures()} /><main id="main">{children}</main><SiteFooter /></>);
  }
  const viewer = await getViewer();
  const onSignIn = (await headers()).get("x-tab-path") === "/my-tab/login";
  if (!viewer || !viewer.clientId || onSignIn) return <main id="main" className="min-h-dvh bg-bone">{children}</main>;
  return <PortalShell viewer={viewer} area="client">{children}</PortalShell>;
}
