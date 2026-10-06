import Link from "next/link";
import { footerNav } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { services } from "@/content/services";
import { Logo } from "./Logo";
import { SmartLink } from "./SmartLink";
import { accountLink } from "@/lib/settings";
import { formatAddress, groupedHours, practitionerLink, telHref } from "@/lib/links";

export async function SiteFooter() {
  const { contact, social, booking, brand } = siteConfig;
  const socials = Object.entries(social).filter(([, url]) => !!url) as [string, string][];
  const account = await accountLink();
  const practitioner = practitionerLink();
  return (
    <footer className="on-dark mt-24 bg-graphite text-white">
      <div className="container-page grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo variant="horizontal" tone="white" className="h-16 w-auto" />
          <p className="mt-6 max-w-xs text-sm text-white/80">{brand.tagline}</p>
          <address className="mt-6 space-y-1 text-sm not-italic text-white/80">
            <p>{contact.address.street ? formatAddress(contact.address) : `Serving ${siteConfig.location.label}`}</p>
            {contact.phone && <p><a className="underline hover:text-white" href={telHref(contact.phone)}>{contact.phone}</a></p>}
            <p><a className="underline hover:text-white" href={`mailto:${contact.email}`}>{contact.email}</a></p>
          </address>
          <dl className="mt-6 space-y-1 text-sm text-white/80">
            {groupedHours(contact.hours).map((h) => (
              <div key={h.days} className="flex gap-2"><dt>{h.days}:</dt><dd>{h.text}</dd></div>
            ))}
          </dl>
          {socials.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-4 text-sm">
              {socials.map(([name, url]) => (
                <li key={name}><a href={url} rel="noopener noreferrer" className="capitalize underline hover:text-white">{name}</a></li>
              ))}
            </ul>
          )}
        </div>
        <FooterCol title="Explore" links={footerNav.explore} />
        <FooterCol title="Services" links={services.map((s) => ({ label: s.name, href: `/services/${s.path}` }))} />
        <div className="space-y-10">
          <FooterCol title="Get started" links={footerNav.getStarted} extra={[
            account && <SmartLink key="account" href={account.href} className="text-white/85 hover:text-white">{account.label}</SmartLink>,
            practitioner && <Link key="practitioner" href={practitioner.href} className="text-white/85 hover:text-white">{practitioner.label}</Link>,
          ]} />
          <FooterCol title="TAB" links={[...footerNav.tab, ...(booking.giftCardsUrl ? [{ label: "Gift cards", href: booking.giftCardsUrl }] : [])]} />
        </div>
      </div>
      <div className="border-t border-white/15">
        <div className="container-page flex flex-col gap-4 py-6 text-sm text-white/70 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {brand.name}. {brand.philosophy}</p>
          <ul className="flex flex-wrap gap-5">
            {footerNav.legal.map((l) => (<li key={l.href}><Link href={l.href} className="hover:text-white">{l.label}</Link></li>))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links, extra = [] }: { title: string; links: { label: string; href: string }[]; extra?: React.ReactNode[] }) {
  return (
    <div>
      <h2 className="text-label text-white/60" style={{ fontFamily: "var(--font-sans)" }}>{title}</h2>
      <ul className="mt-4 space-y-3 text-[0.9375rem]">
        {links.map((l) => (<li key={l.href}><Link href={l.href} className="text-white/85 hover:text-white">{l.label}</Link></li>))}
        {extra.filter(Boolean).map((node, i) => <li key={i}>{node}</li>)}
      </ul>
    </div>
  );
}
