import { portalOpen } from "@/lib/settings";

export const dynamic = "force-dynamic";

/** My TAB sign-in: a page of its own, outside the portal shell (the website's frame while the portal is closed). */
export default async function MyTabSignInLayout({ children }: { children: React.ReactNode }) {
  if (!(await portalOpen())) return children;
  return <main id="main" className="min-h-dvh bg-bone">{children}</main>;
}
