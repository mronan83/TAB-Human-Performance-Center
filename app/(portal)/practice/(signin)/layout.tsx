export const dynamic = "force-dynamic";

/** Staff sign-in and two-step verification: a page of their own, outside the portal shell. */
export default function PracticeSignInLayout({ children }: { children: React.ReactNode }) {
  return <main id="main" className="min-h-dvh bg-bone">{children}</main>;
}
