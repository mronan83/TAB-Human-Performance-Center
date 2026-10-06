import { requireStaff } from "@/lib/portal";
import { PortalShell } from "@/components/portal/PortalShell";

export const dynamic = "force-dynamic";
export const metadata = { title: "TAB Practice", robots: { index: false, follow: false } };

export default async function PracticeLayout({ children }: { children: React.ReactNode }) {
  const { viewer } = await requireStaff();
  return <PortalShell viewer={viewer} area="practice">{children}</PortalShell>;
}
