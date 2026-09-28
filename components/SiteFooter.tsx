import Link from "next/link";
import { footerNav } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { services } from "@/content/services";
import { Logo } from "./Logo";

export function SiteFooter() {
  const { contact, social, booking, brand } = siteConfig;
  const addressParts = [contact.address.street, contact.address.city, contact.address.region, contact.address.postalCode].filter(Boolean);
  const socials = Object.entries(social).filter(([, url]) => !!url) as [string, string][];
  return (
    <footer className="on-dark mt-24 bg-charcoal text-white">
      <div className="container-page grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="inline-block rounded-[20px] bg-cream p-4"><Logo className="h-12 w-auto" /></div>
          <p className="mt-6 max-w-xs text-sm text-white/80">{brand.tagline}</p>
          <address className="mt-6 space-y-1 text-sm not-italic text-white/80">
            {addressParts.length > 1 && <p>{addressParts.join(", ")}</p>}
            {contact.phone && <p><a className="underline hover:text-white" href={`tel:${contact.phone}`}>{contact.phone}</a></p>}
            <p><a className="underline hover:text-white" href={`mailto:${contact.email}`}>{contact.email}</a></p>
          </address>
          {socials.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-4 text-sm">
              {socials.map(([name, url]) => (
                <li key={name}><a href={url} rel="noopener noreferrer" className="capitalize underline hover:text-white">{name}</a></li>
              ))}
            </ul>
          )}
        </div>
        <FooterCol title="Explore" links={footerNav.explore} />
        <FooterCol title="Services" links={services.map((s) => ({ label: s.name, href: `/services/${s.slug}` }))} />
        <div className="space-y-10">
          <FooterCol title="Get started" links={footerNav.getStarted} />
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

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h2 className="text-label text-white/60" style={{ fontFamily: "var(--font-sans)" }}>{title}</h2>
      <ul className="mt-4 space-y-3 text-[0.9375rem]">
        {links.map((l) => (<li key={l.href}><Link href={l.href} className="text-white/85 hover:text-white">{l.label}</Link></li>))}
      </ul>
    </div>
  );
}
