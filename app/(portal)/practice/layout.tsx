export const dynamic = "force-dynamic";
export const metadata = { title: "TAB Practice", robots: { index: false, follow: false } };

/**
 * TAB Practice. Staff sign-in and two-step verification live in (signin), every other page in (staff), each group with
 * its own layout. They are separate on purpose: Next.js keeps a shared layout as it is when you move between its pages
 * in the app, so one layout choosing by address showed the portal without its menu after signing in until a reload
 * (owner report 2026-10-10). Moving between the groups always draws the right frame.
 */
export default function PracticeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
