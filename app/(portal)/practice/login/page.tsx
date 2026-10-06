import { redirect } from "next/navigation";
import { getViewer, isDemoSignIn } from "@/lib/portal";
import { LoginForm } from "@/components/portal/interactive";
import { PasswordSignInForm } from "@/components/portal/StaffAuth";
import { SignInFrame } from "@/components/portal/SignInFrame";

export const metadata = { title: "TAB Practice sign-in", robots: { index: false, follow: false } };

const ERRORS: Record<string, string> = {
  link: "That sign-in link has expired or was already used. Ask for a new one below.",
  staff: "That account isn’t a TAB staff account. Clients sign in to My TAB.",
  expired: "For security, TAB Practice asks you to sign in again every 30 days. Please sign in below.",
};

/**
 * Staff sign-in (proposed D-068, replacing C23's link-first sign-in): email and password, then a passkey or the
 * authenticator code on /practice/verify. The emailed link stays for a forgotten password or a first sign-in.
 */
export default async function PracticeLoginPage({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  if (isDemoSignIn()) redirect("/my-tab/login"); // previews and tests: the demo chooser
  const viewer = await getViewer();
  if (viewer && viewer.role !== "client") redirect(viewer.staffVerified === false ? "/practice/verify" : "/practice");
  const { e } = await searchParams;
  return (
    <SignInFrame>
      <h1 className="text-h2 mt-8 text-center lg:mt-0 lg:text-left">TAB Practice sign-in</h1>
      <p className="mb-8 mt-2 text-center text-text-secondary lg:text-left">Sign in with your email and password. Then confirm it’s you with your passkey or authenticator app.</p>
      {e && ERRORS[e] && <p role="alert" className="mb-4 rounded-xl bg-accent-soft p-3 text-sm">{ERRORS[e]}</p>}
      <PasswordSignInForm />
      <details className="mt-8 rounded-[20px] border border-border bg-white p-5">
        <summary className="cursor-pointer font-semibold">Forgot your password, or haven’t set one yet?</summary>
        <p className="mb-4 mt-3 text-sm text-text-secondary">We’ll email you a one-time sign-in link instead. After signing in, set a new password under Sign-in &amp; security.</p>
        <LoginForm area="practice" />
      </details>
    </SignInFrame>
  );
}
