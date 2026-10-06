import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { legal } from "@/content/pages";
import { PageHero } from "@/components/PageHero";
import { services } from "@/content/services";

const doc = legal.policies;
export const metadata: Metadata = pageMetadata({ title: doc.title, description: "Client policies for TAB Human Performance Center: cancelling or rescheduling, arriving for your session, gratuity and the scope of our services.", path: "/policies" });

export default function Page() {
  return (
    <>
      <PageHero title={doc.title} />
      <section className="section">
        <div className="container-prose">
          {doc.intro.map((p) => (<p key={p} className="text-body-lg text-text-secondary">{p}</p>))}
          {doc.sections.map((sec) => (
            <div key={sec.id}>
              <h2 id={sec.id} className="text-h2 mt-12 scroll-mt-28">{sec.heading}</h2>
              {sec.body.map((b, i) =>
                typeof b === "string" ? (
                  <p key={i} className="mt-4 text-text-secondary">{b}</p>
                ) : (
                  <ul key={i} className="mt-4 list-disc space-y-2 pl-6 text-text-secondary">{b.list.map((li) => <li key={li}>{li}</li>)}</ul>
                ),
              )}
            </div>
          ))}
          {/* Service disclaimers: each service's scope note, as shown on its page (S15 §15.8). */}
          <h2 id="scope" className="text-h2 mt-16 scroll-mt-28">{doc.scopeHeading}</h2>
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
