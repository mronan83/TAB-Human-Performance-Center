import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/PageHero";
import { InquiryForm } from "@/components/InquiryForm";
import { Cta } from "@/components/Cta";
import { start } from "@/content/pages";
import { getSettings } from "@/lib/settings";
import { siteConfig } from "@/config/site";
import { telHref } from "@/lib/links";

export const metadata: Metadata = pageMetadata({ title: "Start Where You Are", description: start.metaDescription, path: "/start" });

export default async function StartPage() {
  const { startFormOpen } = await getSettings();
  const { contact } = siteConfig;
  return (
    <>
      <PageHero eyebrow={start.eyebrow} title={start.headline} lead={start.intro} />
      <section className="section">
        <div className="container-prose space-y-6">
          <p className="flex flex-wrap items-center gap-3 text-text-secondary">
            {start.bookDirect.prompt}
            <Cta kind="book" label={start.bookDirect.label} variant="outline" size="sm" />
          </p>
          {startFormOpen ? (
            <InquiryForm kind="start" />
          ) : (
            // The owner paused online Start submissions in Settings (C23): point people to a conversation instead.
            <div className="card p-8">
              <h2 className="text-h3">Let’s talk instead</h2>
              <p className="mt-3 text-text-secondary">
                We’re not taking new Start Where You Are submissions online right now. Email us at{" "}
                <a className="font-semibold text-primary underline" href={`mailto:${contact.email}`}>{contact.email}</a>
                {contact.phone && <> or call <a className="font-semibold text-primary underline" href={telHref(contact.phone)}>{contact.phone}</a></>}, and we’ll help you find the right place to start.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
