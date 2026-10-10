import { portalOpen } from "@/lib/settings";
import { getViewer } from "@/lib/portal";
import { PortalShell } from "@/components/portal/PortalShell";

export const dynamic = "force-dynamic";

/** The client's pages: inside the portal shell once signed in (each page sends anyone else to sign in). */
export default async function MyTabClientLayout({ children }: { children: React.ReactNode }) {
  if (!(await portalOpen())) return children;
  const viewer = await getViewer();
  if (!viewer || !viewer.clientId) return <main id="main" className="min-h-dvh bg-bone">{children}</main>;
  return <PortalShell viewer={viewer} area="client">{children}</PortalShell>;
}
