import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getViewer, isMock } from "@/lib/portal";
import { Logo } from "@/components/Logo";
import { LoginForm } from "@/components/portal/interactive";
import { setDemoRoleAction } from "@/app/(portal)/actions";
import { siteConfig } from "@/config/site";
import { home } from "@/content/pages";

/**
 * Sign-in in the brand's own frame (C22): the homepage mountain and purpose line beside the form on wide screens,
 * the stacked lockup above it on small ones. The photograph is decorative; the scrim keeps white text at AA.
 */
function SignInFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(480px,560px)]">
      <div className="on-dark relative isolate hidden overflow-hidden bg-graphite text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Image src={home.hero.image.src} alt="" fill priority sizes="60vw" className="-z-20 object-cover object-[70%_50%]" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,var(--color-graphite)_-10%,transparent_35%,transparent_45%,var(--color-graphite)_100%)] opacity-90" />
        <Link href="/" aria-label="TAB Human Performance Center home" className="self-start">
          <Logo variant="horizontal-compact" tone="white" className="h-11 w-auto" decorative />
        </Link>
        <div className="max-w-md">
          <p className="text-display-lg font-[family-name:var(--font-serif)] !font-medium !tracking-normal">{siteConfig.brand.tagline}</p>
          <p className="text-label mt-5 text-white/90">{siteConfig.brand.philosophy}</p>
        </div>
      </div>
      <div className="flex items-center justify-center bg-bone px-5 py-12">
        <div className="w-full max-w-md">
          <Link href="/" aria-label="TAB Human Performance Center home" className="block lg:hidden">
            <Logo variant="stacked-compact" className="mx-auto h-36 w-auto" decorative />
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}

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
      </div>
      <NewToTab />
    </SignInFrame>
  );
}

function NewToTab() {
  return <p className="mt-8 border-t border-border pt-6 text-center text-sm text-text-secondary lg:text-left">New to TAB? <Link href="/start" className="font-semibold text-primary underline">Start where you are</Link></p>;
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  if (isMock()) return <DemoLogin />;
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
