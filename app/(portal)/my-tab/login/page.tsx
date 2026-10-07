import Link from "next/link";
import { redirect } from "next/navigation";
import { getViewer, isDemoSignIn } from "@/lib/portal";
import { LoginForm } from "@/components/portal/interactive";
import { setDemoRoleAction } from "@/app/(portal)/actions";
import { SignInFrame } from "@/components/portal/SignInFrame";

/** Demo sign-in: no password, fictional data. Picks the demo client or the demo practitioner (TAB Practice). */
function DemoLogin() {
  return (
    <SignInFrame>
      <h1 className="text-h2 mt-8 text-center lg:mt-0 lg:text-left">Sign in</h1>
      <p className="mb-8 mt-2 text-center text-text-secondary lg:text-left">Demo mode: fictional data, no password. Choose a view.</p>
      <div className="space-y-3">
        <form action={setDemoRoleAction.bind(null, "client")}>
          <button className="btn btn-primary w-full">Client: My TAB</button>
        </form>
        <form action={setDemoRoleAction.bind(null, "owner")}>
          <button className="btn btn-outline w-full">Practitioner: TAB Practice</button>
        </form>
        <form action={setDemoRoleAction.bind(null, "admin")}>
          <button className="btn btn-outline w-full">Website admin: TAB Practice</button>
        </form>
      </div>
      <NewToTab />
    </SignInFrame>
  );
}

function NewToTab() {
  return <p className="mt-8 border-t border-border pt-6 text-center text-sm text-text-secondary lg:text-left">New to TAB? <Link href="/start" className="font-semibold text-primary underline">Start where you are</Link></p>;
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  if (isDemoSignIn()) return <DemoLogin />;
  const viewer = await getViewer();
  if (viewer?.clientId) redirect("/my-tab");
  const { e } = await searchParams;
  return (
    <SignInFrame>
      <h1 className="text-h2 mt-8 text-center lg:mt-0 lg:text-left">Sign in to My TAB</h1>
      <p className="mb-8 mt-2 text-center text-text-secondary lg:text-left">We’ll email you a secure sign-in link. No password needed.</p>
      {e === "unlinked" && <p role="alert" className="mb-4 rounded-xl bg-accent-soft p-3 text-sm">Your account isn’t linked to a client record yet. Contact us and we’ll set it up.</p>}
      {e === "mfa" && <p role="alert" className="mb-4 rounded-xl bg-accent-soft p-3 text-sm">TAB Practice needs two-step verification, and it isn’t set up for your account yet.</p>}
      <LoginForm />
      <NewToTab />
    </SignInFrame>
  );
}
