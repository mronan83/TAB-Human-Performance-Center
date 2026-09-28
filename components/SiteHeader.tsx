"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { primaryNav } from "@/config/navigation";
import { HomeLogoLink } from "./Logo";
import { Cta } from "./Cta";
import { SmartLink } from "./SmartLink";
import { siteConfig } from "@/config/site";
import { clientLoginHref } from "@/lib/links";
import clsx from "clsx";

/**
 * Header: primary nav + persistent actions Start Where You Are, Book, My TAB (Step 16.2).
 * Until the portal is live, the account action is "Client Login" straight into Timely (Step 19.14, WEB-020).
 */
const account = siteConfig.portal.enabled
  ? { href: "/my-tab", external: false, label: "My TAB" }
  : { ...clientLoginHref(), label: "Client Login" };

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => { setOpen(false); setOpenMenu(null); }, [pathname]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpenMenu(null); setOpen(false); } };
    const onClick = (e: MouseEvent) => { if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenMenu(null); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("click", onClick); };
  }, []);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-cream/95 backdrop-blur">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2">
        Skip to content
      </a>
      <div className="container-page flex h-20 items-center justify-between gap-6">
        <HomeLogoLink />

        <nav ref={navRef} aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {primaryNav.map((item) =>
              item.children ? (
                <li key={item.href} className="relative">
                  <button
                    type="button"
                    aria-expanded={openMenu === item.href}
                    aria-controls={`menu-${item.label}`}
                    onClick={() => setOpenMenu(openMenu === item.href ? null : item.href)}
                    className={clsx("rounded-full px-4 py-2 text-[0.9375rem] font-medium hover:text-primary", isActive(item.href) && "text-primary")}
                  >
                    {item.label}
                    <span aria-hidden className="ml-1 inline-block text-xs">▾</span>
                  </button>
                  {openMenu === item.href && (
                    <ul id={`menu-${item.label}`} className="absolute left-0 top-full mt-2 w-72 rounded-[20px] border border-border bg-white p-2 shadow-[var(--shadow-md)]">
                      {item.children.map((c) => (
                        <li key={c.href}>
                          <Link href={c.href} className="block rounded-xl px-4 py-3 text-[0.9375rem] hover:bg-sand" aria-current={pathname === c.href ? "page" : undefined}>
                            {c.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ) : (
                <li key={item.href}>
                  <Link href={item.href} className={clsx("rounded-full px-4 py-2 text-[0.9375rem] font-medium hover:text-primary", isActive(item.href) && "text-primary")} aria-current={isActive(item.href) ? "page" : undefined}>
                    {item.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <SmartLink href={account.href} external={account.external} className="px-3 py-2 text-[0.9375rem] font-medium hover:text-primary">{account.label}</SmartLink>
          <Cta kind="book" label="Book" variant="outline" size="sm" />
          <Cta kind="start" label="Start Where You Are" size="sm" />
        </div>

        <button type="button" className="btn btn-outline btn-sm lg:hidden" aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen(!open)}>
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Primary" className="border-t border-border bg-cream lg:hidden">
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
            <li className="py-2"><SmartLink href={account.href} external={account.external} className="block py-2 text-lg font-semibold">{account.label}</SmartLink></li>
            <li className="flex flex-col gap-3 pt-4">
              <Cta kind="start" label="Start Where You Are" />
              <Cta kind="book" label="Book" variant="outline" />
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
