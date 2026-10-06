import { headers } from "next/headers";
import { requireStaffViewer } from "@/lib/portal";
import { PortalShell } from "@/components/portal/PortalShell";

export const dynamic = "force-dynamic";
export const metadata = { title: "TAB Practice", robots: { index: false, follow: false } };

/** Staff sign-in and two-step verification render on their own; every other page needs verified staff. */
const OPEN = ["/practice/login", "/practice/verify"];

export default async function PracticeLayout({ children }: { children: React.ReactNode }) {
  const path = (await headers()).get("x-tab-path") ?? "";
  if (OPEN.some((p) => path === p || path.startsWith(`${p}/`))) return <main id="main" className="min-h-dvh bg-bone">{children}</main>;
  const viewer = await requireStaffViewer();
  return <PortalShell viewer={viewer} area="practice">{children}</PortalShell>;
}
