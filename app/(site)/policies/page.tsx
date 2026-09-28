import type { Metadata } from "next";
import { legal } from "@/content/pages";
import { PageHero } from "@/components/PageHero";
import { DraftFlag } from "@/components/DraftFlag";

const doc = legal.policies;
export const metadata: Metadata = { title: doc.title };

export default function Page() {
  return (
    <>
      <PageHero title={doc.title} />
      <section className="section">
        <div className="container-prose">
          <DraftFlag show={doc.draft} label="Pending review" />
          {doc.body.map((p) => (<p key={p} className="text-body-lg mt-4 text-text-secondary">{p}</p>))}
        </div>
      </section>
    </>
  );
}
