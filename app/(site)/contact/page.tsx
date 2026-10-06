import type { Metadata } from "next";
import { formatAddress, hoursText, telHref } from "@/lib/links";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import { PageHero } from "@/components/PageHero";
import { InquiryForm } from "@/components/InquiryForm";

export const metadata: Metadata = pageMetadata({ title: "Contact", description: "Questions about booking, services or gift cards? Contact TAB Human Performance Center in Brighton and Howell, MI.", path: "/contact" });

export default function ContactPage() {
  const { contact } = siteConfig;
  const addr = formatAddress(contact.address);
  return (
    <>
      <PageHero eyebrow="Contact" title="We’re here to help." />
      <section className="section">
        <div className="container-page grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div className="space-y-8">
            <div><h2 className="text-h4">Email</h2><a className="mt-1 block text-primary underline" href={`mailto:${contact.email}`}>{contact.email}</a></div>
            {contact.phone && <div><h2 className="text-h4">Phone</h2><a className="mt-1 block text-primary underline" href={telHref(contact.phone)}>{contact.phone}</a></div>}
            {contact.address.street && <div><h2 className="text-h4">Visit</h2><p className="mt-1">{addr}</p>{contact.mapUrl && <a className="text-primary underline" href={contact.mapUrl}>Get directions</a>}</div>}
            <div>
              <h2 className="text-h4">Hours</h2>
              <dl className="mt-2 space-y-1">
                {contact.hours.map((h) => (
                  <div key={h.days} className="flex justify-between gap-6 border-b border-border py-2">
                    <dt>{h.days}</dt><dd className="text-text-secondary">{hoursText(h)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <InquiryForm kind="contact" />
        </div>
      </section>
    </>
  );
}
