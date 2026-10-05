import Link from "next/link";
import { Logo } from "@/components/Logo";
import { PortalNav, type PortalNavItem } from "./PortalNav";
import { DemoBanner } from "./DemoBanner";
import { isMock } from "@/lib/portal";
import type { Viewer } from "@/lib/portal/types";
import { signOutAction } from "@/app/(portal)/actions";

export const clientNav: PortalNavItem[] = [
  { href: "/my-tab", label: "Home", icon: "home" },
  { href: "/my-tab/plan", label: "My plan", icon: "plan" },
  { href: "/my-tab/programs", label: "Programs", icon: "programs" },
  { href: "/my-tab/progress", label: "Progress", icon: "progress" },
  { href: "/my-tab/appointments", label: "Appointments", icon: "calendar" },
  { href: "/my-tab/resources", label: "Resources", icon: "resources" },
  { href: "/my-tab/forms", label: "Forms", icon: "forms" },
  { href: "/my-tab/billing", label: "Billing", icon: "billing" },
  { href: "/my-tab/profile", label: "Profile", icon: "profile" },
];

export const practiceNav: PortalNavItem[] = [
  { href: "/practice", label: "Clients", icon: "clients" },
  { href: "/practice/inquiries", label: "Submissions", icon: "inbox" },
  { href: "/practice/programs", label: "Program library", icon: "programs" },
];

export function PortalShell({ viewer, area, children }: { viewer: Viewer; area: "client" | "practice"; children: React.ReactNode }) {
  // Team (C7b): the owner grants the publishing permission and credentials.
  const nav = area === "client" ? clientNav : viewer.role === "owner" ? [...practiceNav, { href: "/practice/team", label: "Team", icon: "team" } as PortalNavItem] : practiceNav;
  return (
    <div className="min-h-dvh bg-bone">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2">
        Skip to content
      </a>
      {isMock() && <DemoBanner role={viewer.role} />}
      <div className="lg:grid lg:grid-cols-[260px_1fr]">
        <aside className="hidden border-r border-border bg-white lg:flex lg:min-h-[calc(100dvh-40px)] lg:flex-col">
          <div className="px-6 pb-4 pt-6">
            <Link href="/" aria-label="TAB Human Performance Center home"><Logo className="h-11 w-auto" decorative /></Link>
            <p className="text-label mt-6 text-secondary">{area === "client" ? "My TAB" : "TAB Practice"}</p>
          </div>
          <PortalNav items={nav} variant="sidebar" />
          <div className="mt-auto border-t border-border p-6 text-sm">
            <p className="font-semibold">{viewer.name}</p>
            <p className="capitalize text-text-secondary">{viewer.role === "owner" ? "Owner" : viewer.role}</p>
            <form action={signOutAction}><button className="mt-3 text-primary underline">Sign out</button></form>
          </div>
        </aside>
        <div className="min-w-0">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-bone/95 px-5 backdrop-blur lg:hidden">
            <Link href="/" aria-label="TAB Human Performance Center home"><Logo className="h-9 w-auto" decorative /></Link>
            <span className="text-label text-secondary">{area === "client" ? "My TAB" : "TAB Practice"}</span>
          </header>
          <main id="main" className="mx-auto max-w-[1100px] px-5 pb-28 pt-8 lg:px-10 lg:pb-16 lg:pt-10">{children}</main>
        </div>
      </div>
      <PortalNav items={area === "client" ? nav.filter((n) => ["Home", "My plan", "Programs", "Progress", "Profile"].includes(n.label)) : nav} variant="bottom" />
    </div>
  );
}
