import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/seo";
import { legal } from "@/content/pages";
import { PageHero } from "@/components/PageHero";
import { DraftFlag } from "@/components/DraftFlag";

const doc = legal.accessibility;
export const metadata: Metadata = pageMetadata({ title: doc.title, description: "How TAB Human Performance Center makes its website and services accessible, and how to ask for support or report a barrier.", path: "/accessibility" });

export default function Page() {
  return (
    <>
      <PageHero title={doc.title} />
      <section className="section">
        <div className="container-prose">
          <DraftFlag show={doc.draft} label="Pending review" />
          {doc.body.map((p) => (<p key={p} className="text-body-lg mt-4 text-text-secondary">{p}</p>))}
          <p className="text-body-lg mt-4">
            Email <a className="font-semibold text-primary underline underline-offset-4" href={`mailto:${siteConfig.contact.email}`}>{siteConfig.contact.email}</a>
            {siteConfig.contact.phone && <> or call <a className="font-semibold text-primary underline underline-offset-4" href={`tel:${siteConfig.contact.phone}`}>{siteConfig.contact.phone}</a></>}.
          </p>
        </div>
      </section>
    </>
  );
}
