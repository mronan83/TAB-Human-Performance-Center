"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type FocusEvent } from "react";
import { primaryNav } from "@/config/navigation";
import { HomeLogoLink } from "./Logo";
import { Cta } from "./Cta";
import { SmartLink } from "./SmartLink";
import type { AccountLink } from "@/lib/settings";
import clsx from "clsx";

/**
 * Header: primary nav + persistent actions Start Where You Are, Book, My TAB (Step 16.2, WEB-001).
 * The account action ("My TAB") appears only once the client portal is open; until then Book covers Timely (WEB-020,
 * owner ruling 2026-10-06). Server layouts pass it in, since whether the portal is open is the owner's live setting.
 * Fit: the full row (logo, nav, actions) needs about 68rem of the 72rem inside the 75rem container, leaving ~3rem of
 * headroom for wider font rendering (Safari, Windows). The switch point and row width are in rem, so visitors who set
 * larger default text get the Menu button instead of a crowded header, and header items never wrap. Adding a nav item
 * eats that headroom: e2e/header.spec.ts fails if the row gets too tight.
 * Keyboard (NFR-001): Escape closes an open menu and returns focus to the button that opened it; a menu closes
 * when focus moves out of it. Closed menus stay in the DOM as `hidden` so `aria-controls` always resolves.
 */
export function SiteHeader({ account = null }: { account?: AccountLink | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const triggers = useRef<Record<string, HTMLButtonElement | null>>({});
  const state = useRef({ open, openMenu });
  state.current = { open, openMenu };

  useEffect(() => { setOpen(false); setOpenMenu(null); }, [pathname]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const { open: mobileOpen, openMenu: menu } = state.current;
      if (menu) triggers.current[menu]?.focus();
      else if (mobileOpen) menuButton.current?.focus();
      setOpenMenu(null);
      setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) { setOpenMenu(null); setOpen(false); }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("click", onClick); };
  }, []);

  /** Close a menu once focus has left it (tabbing past the last item, or into the page). */
  const closeWhenFocusLeaves = (close: () => void) => (e: FocusEvent<HTMLElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) close();
  };

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header ref={headerRef} onBlur={closeWhenFocusLeaves(() => setOpen(false))} className="sticky top-0 z-40 border-b border-border bg-bone/95 backdrop-blur">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2">
        Skip to content
      </a>
      <div className="container-page flex h-20 max-w-[75rem] items-center justify-between gap-4">
        <HomeLogoLink />

        <nav aria-label="Primary" className="hidden min-[80rem]:block">
          <ul className="flex items-center gap-1">
            {primaryNav.map((item) =>
              item.children ? (
                <li key={item.href} className="relative" onBlur={closeWhenFocusLeaves(() => setOpenMenu((m) => (m === item.href ? null : m)))}>
                  <button
                    type="button"
                    ref={(el) => { triggers.current[item.href] = el; }}
                    aria-expanded={openMenu === item.href}
                    aria-controls={`menu-${item.label}`}
                    onClick={() => setOpenMenu(openMenu === item.href ? null : item.href)}
                    className={clsx("whitespace-nowrap rounded-full px-2.5 py-2 text-[0.9375rem] font-medium hover:text-primary", isActive(item.href) && "text-primary")}
                  >
                    {item.label}
                    <span aria-hidden className="ml-1 inline-block text-xs">▾</span>
                  </button>
                  <ul id={`menu-${item.label}`} hidden={openMenu !== item.href} className="absolute left-0 top-full mt-2 w-72 rounded-[20px] border border-border bg-white p-2 shadow-[var(--shadow-md)]">
                    {item.children.map((c) => (
                      <li key={c.label}>
                        <Link href={c.href} className="block rounded-xl px-4 py-3 text-[0.9375rem] hover:bg-linen" aria-current={pathname === c.href ? "page" : undefined}>
                          {c.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ) : (
                <li key={item.href}>
                  <Link href={item.href} className={clsx("whitespace-nowrap rounded-full px-2.5 py-2 text-[0.9375rem] font-medium hover:text-primary", isActive(item.href) && "text-primary")} aria-current={isActive(item.href) ? "page" : undefined}>
                    {item.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>

        <div className="hidden items-center gap-2 min-[80rem]:flex">
          {account && <SmartLink href={account.href} className="whitespace-nowrap px-2.5 py-2 text-[0.9375rem] font-medium hover:text-primary">{account.label}</SmartLink>}
          <Cta kind="book" label="Book" variant="outline" size="sm" className="whitespace-nowrap" />
          <Cta kind="start" label="Start Where You Are" size="sm" className="whitespace-nowrap" />
        </div>

        <button ref={menuButton} type="button" className="btn btn-outline btn-sm min-[80rem]:hidden" aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen(!open)}>
          {open ? "Close" : "Menu"}
        </button>
      </div>

      <nav id="mobile-nav" hidden={!open} aria-label="Primary" className="border-t border-border bg-bone min-[80rem]:hidden">
          <ul className="container-page flex flex-col py-4">
            {primaryNav.map((item) => (
              <li key={item.href} className="border-b border-border/60 py-2">
                <Link href={item.href} className="block py-2 text-lg font-semibold">{item.label}</Link>
                {item.children && (
                  <ul className="pb-2 pl-4">
                    {item.children.filter((c) => c.href !== item.href).map((c) => (
                      <li key={c.href}><Link href={c.href} className="block py-2">{c.label}</Link></li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
            {account && <li className="py-2"><SmartLink href={account.href} className="block py-2 text-lg font-semibold">{account.label}</SmartLink></li>}
            <li className="flex flex-col gap-3 pt-4">
              <Cta kind="start" label="Start Where You Are" />
              <Cta kind="book" label="Book" variant="outline" />
            </li>
          </ul>
        </nav>
    </header>
  );
}
