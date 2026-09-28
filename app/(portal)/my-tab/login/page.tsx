import Link from "next/link";
import { redirect } from "next/navigation";
import { getViewer, isMock } from "@/lib/portal";
import { Logo } from "@/components/Logo";
import { LoginForm } from "@/components/portal/interactive";
import { setDemoRoleAction } from "@/app/(portal)/actions";

/** Demo sign-in: no password, fictional data. Picks the demo client or the demo practitioner (TAB Practice). */
function DemoLogin() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-5 py-12">
      <div className="w-full max-w-md rounded-[20px] border border-border bg-white p-8 shadow-[var(--shadow-md)]">
        <Link href="/" aria-label="TAB Wellness Collective home"><Logo variant="stacked" className="mx-auto h-40 w-auto" decorative /></Link>
        <h1 className="text-h2 mt-8 text-center">Sign in</h1>
        <p className="mb-6 mt-2 text-center text-text-secondary">Demo mode: fictional data, no password. Choose a view.</p>
        <div className="space-y-3">
          <form action={setDemoRoleAction.bind(null, "client")}>
            <button className="btn btn-primary w-full">Client: My TAB</button>
          </form>
          <form action={setDemoRoleAction.bind(null, "owner")}>
            <button className="btn btn-outline w-full">Practitioner: TAB Practice</button>
          </form>
        </div>
        <p className="mt-6 text-center text-sm text-text-secondary">New to TAB? <Link href="/start" className="text-primary underline">Start where you are</Link></p>
      </div>
    </div>
  );
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  if (isMock()) return <DemoLogin />;
  const viewer = await getViewer();
  if (viewer?.clientId) redirect("/my-tab");
  const { e } = await searchParams;
  return (
    <div className="flex min-h-dvh items-center justify-center px-5 py-12">
      <div className="w-full max-w-md rounded-[20px] border border-border bg-white p-8 shadow-[var(--shadow-md)]">
        <Link href="/" aria-label="TAB Wellness Collective home"><Logo variant="stacked" className="mx-auto h-40 w-auto" decorative /></Link>
        <h1 className="text-h2 mt-8 text-center">Sign in to My TAB</h1>
        <p className="mb-6 mt-2 text-center text-text-secondary">We’ll email you a secure sign-in link. No password needed.</p>
        {e === "unlinked" && <p role="alert" className="mb-4 rounded-xl bg-accent-soft p-3 text-sm">Your account isn’t linked to a client record yet. Contact us and we’ll set it up.</p>}
        {e === "mfa" && <p role="alert" className="mb-4 rounded-xl bg-accent-soft p-3 text-sm">TAB Practice needs two-step verification, and it isn’t set up for your account yet.</p>}
        <LoginForm />
        <p className="mt-6 text-center text-sm text-text-secondary">New to TAB? <Link href="/start" className="text-primary underline">Start where you are</Link></p>
      </div>
    </div>
  );
}
