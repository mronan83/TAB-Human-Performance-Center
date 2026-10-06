import { PageHero } from "@/components/PageHero";
import { DraftFlag } from "@/components/DraftFlag";
import type { LegalDoc } from "@/content/legal";

/**
 * Privacy policy and terms (A7): headed sections, plain-language paragraphs and lists. While the document is a draft,
 * previews (NEXT_PUBLIC_SHOW_DRAFTS) also show the review notes for the owner and attorney; they never ship as text.
 */
export function LegalDocument({ doc }: { doc: LegalDoc }) {
  const showNotes = doc.draft && process.env.NEXT_PUBLIC_SHOW_DRAFTS === "true" && doc.reviewNotes.length > 0;
  return (
    <>
      <PageHero title={doc.title} lead={doc.updated ? `Last updated ${doc.updated}` : undefined} />
      <section className="section">
        <div className="container-prose">
          <DraftFlag show={doc.draft} label="Pending review" />
          {showNotes && (
            <aside aria-label="Review notes" className="mt-4 rounded-[20px] border border-border bg-warning-soft p-6">
              <p className="text-label text-text-primary">Review notes (not part of the document)</p>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-text-primary">
                {doc.reviewNotes.map((n) => <li key={n}>{n}</li>)}
              </ol>
            </aside>
          )}
          {doc.intro.map((p) => <p key={p} className="text-body-lg mt-6 text-text-secondary">{p}</p>)}
          {doc.sections.map((s) => (
            <div key={s.heading} className="mt-12">
              <h2 className="text-h3">{s.heading}</h2>
              {s.body.map((b, i) =>
                typeof b === "string" ? (
                  <p key={i} className="mt-4 text-text-secondary">{b}</p>
                ) : (
                  <ul key={i} className="mt-4 list-disc space-y-2 pl-6 text-text-secondary">
                    {b.list.map((li) => <li key={li}>{li}</li>)}
                  </ul>
                ),
              )}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
