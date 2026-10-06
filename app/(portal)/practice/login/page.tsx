import { redirect } from "next/navigation";
import { getViewer, isDemoSignIn } from "@/lib/portal";
import { LoginForm } from "@/components/portal/interactive";
import { SignInFrame } from "@/components/portal/SignInFrame";

export const metadata = { title: "TAB Practice sign-in", robots: { index: false, follow: false } };

const ERRORS: Record<string, string> = {
  link: "That sign-in link has expired or was already used. Ask for a new one below.",
  staff: "That account isn’t a TAB staff account. Clients sign in to My TAB.",
};

/** Staff sign-in (C23): an emailed link, then the authenticator code on /practice/verify. */
export default async function PracticeLoginPage({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  if (isDemoSignIn()) redirect("/my-tab/login"); // previews and tests: the demo chooser
  const viewer = await getViewer();
  if (viewer && viewer.role !== "client") redirect(viewer.staffVerified === false ? "/practice/verify" : "/practice");
  const { e } = await searchParams;
  return (
    <SignInFrame>
      <h1 className="text-h2 mt-8 text-center lg:mt-0 lg:text-left">TAB Practice sign-in</h1>
      <p className="mb-8 mt-2 text-center text-text-secondary lg:text-left">We’ll email you a secure sign-in link. Then you’ll enter the 6-digit code from your authenticator app.</p>
      {e && ERRORS[e] && <p role="alert" className="mb-4 rounded-xl bg-accent-soft p-3 text-sm">{ERRORS[e]}</p>}
      <LoginForm area="practice" />
    </SignInFrame>
  );
}
