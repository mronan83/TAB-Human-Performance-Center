import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { faqs } from "@/content/pages";
import { services } from "@/content/services";
import { PageHero } from "@/components/PageHero";
import { FaqList } from "@/components/FaqList";
import { faqJsonLd } from "@/lib/jsonld";

export const metadata: Metadata = pageMetadata({ title: "FAQ", description: "Answers to common questions about TAB Human Performance Center.", path: "/faq" });

export default function FaqPage() {
  const jsonLd = faqJsonLd(faqs); // reviewed answers only (NFR-003)
  return (
    <>
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      <PageHero eyebrow="FAQ" title="Questions, answered." />
      <section className="section">
        <div className="container-prose">
          <FaqList items={faqs} />
          <h2 className="text-h2 mt-16">Service questions</h2>
          <ul className="mt-6 space-y-3">
            {services.map((s) => (<li key={s.slug}><Link className="font-semibold text-primary underline underline-offset-4" href={`/services/${s.slug}#faq`}>{s.name} FAQ</Link></li>))}
          </ul>
        </div>
      </section>
    </>
  );
}
