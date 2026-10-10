import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaffViewer } from "@/lib/portal";
import { statusOf, LANES, PRIORITIES, STATUSES } from "@/lib/website-requests";
import { getRequest } from "@/lib/website-requests-store";
import { Badge, PageTitle, Panel } from "@/components/portal/ui";
import { RequestNoteForm, RequestStatusForm } from "@/components/portal/WebsiteForms";

export const metadata = { title: "Website request" };

const when = (iso: string) => new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/Detroit" });

/** One request: what was asked, where it stands, and the conversation with Claude (proposed D-071). */
export default async function WebsiteRequestPage({ params, searchParams }: { params: Promise<{ number: string }>; searchParams: Promise<{ filed?: string }> }) {
  const viewer = await requireStaffViewer();
  const n = Number((await params).number);
  if (!Number.isInteger(n) || n < 1) notFound();
  const found = await getRequest(n);
  if (!found) notFound();
  const { request: r, notes } = found;
  const st = statusOf(r.status);
  const step = STATUSES.findIndex((s) => s.value === r.status);
  const steps = STATUSES.filter((s) => s.value !== "declined");
  const filed = (await searchParams).filed === "1";
  return (
    <>
      <p className="mb-4 text-sm"><Link href="/practice/website" className="text-primary underline">Website changes</Link></p>
      <PageTitle eyebrow={`Request #${r.number} · ${LANES.find((l) => l.value === r.lane)!.label}`} title={r.title} action={<span className="whitespace-nowrap"><Badge tone={st.tone}>{st.label}</Badge></span>} />
      {filed && <p role="status" className="mb-6 rounded-xl bg-note-soft p-4 text-sm"><strong>Request #{r.number} sent.</strong> To have Claude pick it up now, start a session and say “pick up website request #{r.number}”. Otherwise the daily check will.</p>}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-6">
          <Panel title="The request">
            <p className="whitespace-pre-line">{r.details}</p>
            {r.reason && <><h3 className="mt-6 font-semibold">Why</h3><p className="mt-1 whitespace-pre-line text-text-secondary">{r.reason}</p></>}
          </Panel>
          <Panel title="Notes">
            {notes.length ? (
              <ol className="mb-6 space-y-4">
                {notes.map((note) => (
                  <li key={note.id} className={note.byClaude ? "rounded-xl bg-linen p-4" : "rounded-xl border border-border p-4"}>
                    <p className="text-sm"><span className="font-semibold">{note.authorName}</span> <span className="text-text-secondary">· {when(note.createdAt)}</span></p>
                    <p className="mt-2 whitespace-pre-line">{note.body}</p>
                  </li>
                ))}
              </ol>
            ) : <p className="mb-6 text-text-secondary">No notes yet. Claude’s questions, options and updates appear here.</p>}
            <RequestNoteForm requestId={r.id} number={r.number} />
          </Panel>
        </div>
        <div className="min-w-0 space-y-6">
          <Panel title="Where it stands">
            <p className="text-sm text-text-secondary">{st.means}</p>
            {r.status !== "declined" && (
              <ol className="mt-4 space-y-2 text-sm" aria-label="Steps">
                {steps.map((s, i) => (
                  <li key={s.value} className="flex items-center gap-2" aria-current={s.value === r.status ? "step" : undefined}>
                    <span aria-hidden className={i < step ? "h-2.5 w-2.5 rounded-full bg-olive" : i === step ? "h-3 w-3 rounded-full border-2 border-olive bg-white" : "h-2.5 w-2.5 rounded-full border border-border-strong"} />
                    <span className={i === step ? "font-semibold" : i < step ? "" : "text-text-secondary"}>{s.label}</span>
                  </li>
                ))}
              </ol>
            )}
            {(r.previewUrl || r.changeUrl) && (
              <div className="mt-5 flex flex-wrap gap-3">
                {r.previewUrl && <a href={r.previewUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">Open the preview<span className="sr-only"> (new tab)</span></a>}
                {r.changeUrl && <a href={r.changeUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">The change<span className="sr-only"> (new tab)</span></a>}
              </div>
            )}
            {viewer.role === "owner" && <div className="mt-6 border-t border-border pt-5"><RequestStatusForm requestId={r.id} number={r.number} status={r.status} /></div>}
          </Panel>
          <Panel title="Details">
            <dl className="space-y-3 text-sm">
              <div><dt className="text-text-secondary">Pages</dt><dd>{r.pages.join(", ")}</dd></div>
              <div><dt className="text-text-secondary">Kind of change</dt><dd>{r.kind}</dd></div>
              <div><dt className="text-text-secondary">How soon</dt><dd>{PRIORITIES.find((p) => p.value === r.priority)!.label}{r.deadline ? `, by ${new Date(`${r.deadline}T12:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric" })}` : ""}</dd></div>
              <div><dt className="text-text-secondary">Asked by</dt><dd>{r.requestedByName}, {when(r.createdAt)}</dd></div>
              {r.closedAt && <div><dt className="text-text-secondary">Closed</dt><dd>{when(r.closedAt)}</dd></div>}
            </dl>
          </Panel>
        </div>
      </div>
    </>
  );
}
