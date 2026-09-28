import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { PageHero } from "@/components/PageHero";
import { InquiryForm } from "@/components/InquiryForm";

export const metadata: Metadata = { title: "Contact", description: "Contact TAB Wellness Collective." };

export default function ContactPage() {
  const { contact } = siteConfig;
  const addr = [contact.address.street, contact.address.city, contact.address.region, contact.address.postalCode].filter(Boolean).join(", ");
  return (
    <>
      <PageHero eyebrow="Contact" title="We’re here to help." />
      <section className="section">
        <div className="container-page grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div className="space-y-8">
            <div><h2 className="text-h4">Email</h2><a className="mt-1 block text-primary underline" href={`mailto:${contact.email}`}>{contact.email}</a></div>
            {contact.phone && <div><h2 className="text-h4">Phone</h2><a className="mt-1 block text-primary underline" href={`tel:${contact.phone}`}>{contact.phone}</a></div>}
            {contact.address.street && <div><h2 className="text-h4">Visit</h2><p className="mt-1">{addr}</p>{contact.mapUrl && <a className="text-primary underline" href={contact.mapUrl}>Get directions</a>}</div>}
            <div>
              <h2 className="text-h4">Hours</h2>
              <dl className="mt-2 space-y-1">
                {contact.hours.map((h) => (
                  <div key={h.days} className="flex justify-between gap-6 border-b border-border py-2">
                    <dt>{h.days}</dt><dd className="text-text-secondary">{h.closed ? "Closed" : h.open === "PLACEHOLDER" ? "By appointment" : `${h.open} – ${h.close}`}</dd>
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
