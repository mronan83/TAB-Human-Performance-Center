import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/PageHero";
import { InquiryForm } from "@/components/InquiryForm";
import { Cta } from "@/components/Cta";
import { start } from "@/content/pages";

export const metadata: Metadata = pageMetadata({ title: "Start Where You Are", description: start.metaDescription, path: "/start" });

export default function StartPage() {
  return (
    <>
      <PageHero eyebrow={start.eyebrow} title={start.headline} lead={start.intro} />
      <section className="section">
        <div className="container-prose space-y-6">
          <p className="flex flex-wrap items-center gap-3 text-text-secondary">
            {start.bookDirect.prompt}
            <Cta kind="book" label={start.bookDirect.label} variant="outline" size="sm" />
          </p>
          <InquiryForm kind="start" />
        </div>
      </section>
    </>
  );
}
