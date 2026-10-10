"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

/**
 * `short` is the label in the phone tab bar, where six items share the width. `reload` opens the address as a full page
 * load: the content editor (C38) has its own content-security policy, which in-app navigation would not apply.
 */
export type PortalNavItem = { href: string; label: string; short?: string; icon: keyof typeof ICONS; reload?: boolean };

/** A nav link: in-app navigation, or a plain link for an item that needs a full page load. */
export function NavLink({ item, ...props }: { item: PortalNavItem } & Omit<React.ComponentProps<"a">, "href">) {
  return item.reload ? <a href={item.href} {...props} /> : <Link href={item.href} {...props} />;
}

const ICONS = {
  home: "M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  plan: "M9 5h10M9 12h10M9 19h10M4 5h.01M4 12h.01M4 19h.01",
  programs: "M4 6h16v12H4zM4 10h16",
  progress: "M4 19V9M10 19V5M16 19v-7M22 19H2",
  calendar: "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4",
  resources: "M5 4h9l5 5v11H5zM14 4v5h5",
  forms: "M6 3h12v18H6zM9 8h6M9 12h6M9 16h4",
  billing: "M3 6h18v12H3zM3 10h18",
  profile: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0",
  clients: "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21a7 7 0 0 1 14 0M17 11a3 3 0 1 0 0-6M22 21a6 6 0 0 0-4-5.6",
  inbox: "M3 13l3-8h12l3 8v6H3zM3 13h5l1 3h6l1-3h5",
  team: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z",
  settings: "M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0M14 4v4M8 10v4M16 16v4",
  stats: "M4 20V10M10 20V4M16 20v-7M22 20H2",
  lock: "M6 11h12v10H6zM8 11V7a4 4 0 0 1 8 0v4M12 15v2",
  more: "M5 12h.01M12 12h.01M19 12h.01",
  website: "M3 5h18v14H3zM3 9h18M7 7h.01M10 7h.01M8 13l-2 2 2 2M16 13l2 2-2 2M13 12l-2 6",
  edit: "M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4",
} as const;

export function Icon({ name, className }: { name: keyof typeof ICONS; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={ICONS[name]} />
    </svg>
  );
}

export function PortalNav({ items, variant }: { items: PortalNavItem[]; variant: "sidebar" | "bottom" }) {
  const pathname = usePathname();
  const active = (href: string) => (href === "/my-tab" || href === "/practice" ? pathname === href : pathname.startsWith(href));
  if (variant === "sidebar") {
    return (
      <nav aria-label="Portal" className="px-3">
        <ul className="space-y-1">
          {items.map((i) => (
            <li key={i.href}>
              <NavLink item={i} aria-current={active(i.href) ? "page" : undefined}
                className={clsx("flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.9375rem] font-medium transition-colors", active(i.href) ? "bg-linen text-primary" : "text-text-secondary hover:bg-bone hover:text-text-primary")}>
                <Icon name={i.icon} className="h-5 w-5" />{i.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    );
  }
  return (
    <nav aria-label="Portal" className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
      <ul className="flex justify-around">
        {items.map((i) => (
          <li key={i.href} className="min-w-0 flex-1">
            <NavLink item={i} aria-current={active(i.href) ? "page" : undefined} className={clsx("flex flex-col items-center gap-1 px-0.5 py-2.5 text-center text-[0.6875rem] font-semibold leading-tight", active(i.href) ? "text-primary" : "text-text-secondary")}>
              <Icon name={i.icon} className="h-6 w-6" /><span className="max-w-full truncate">{i.short ?? i.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
