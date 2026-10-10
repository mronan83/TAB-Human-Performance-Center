import { requireStaffViewer } from "@/lib/portal";
import { PortalShell } from "@/components/portal/PortalShell";

export const dynamic = "force-dynamic";

/** Every TAB Practice page but sign-in: verified staff only, inside the portal shell (menu, header, spacing). */
export default async function PracticeStaffLayout({ children }: { children: React.ReactNode }) {
  const viewer = await requireStaffViewer();
  return <PortalShell viewer={viewer} area="practice">{children}</PortalShell>;
}
