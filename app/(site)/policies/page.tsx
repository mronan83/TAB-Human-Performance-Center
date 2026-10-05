import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { legal } from "@/content/pages";
import { PageHero } from "@/components/PageHero";
import { DraftFlag } from "@/components/DraftFlag";
import { services } from "@/content/services";

const doc = legal.policies;
export const metadata: Metadata = pageMetadata({ title: doc.title, description: "Client policies for TAB Human Performance Center, including booking, cancellations and the scope of our services.", path: "/policies" });

export default function Page() {
  return (
    <>
      <PageHero title={doc.title} />
      <section className="section">
        <div className="container-prose">
          <h2 id="cancellation" className="text-h2 scroll-mt-28">{doc.sections.cancellation}</h2>
          <DraftFlag show={doc.draft} label="Pending review" />
          {doc.body.map((p) => (<p key={p} className="text-body-lg mt-4 text-text-secondary">{p}</p>))}
          {/* Service disclaimers: each service's scope note, as shown on its page (S15 §15.8). */}
          <h2 id="scope" className="text-h2 mt-16 scroll-mt-28">{doc.sections.scope}</h2>
          {services.map((s) => (
            <div key={s.slug} className="mt-6">
              <h3 className="text-h4">{s.name}</h3>
              <p className="mt-2 text-text-secondary">{s.scopeNote}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
