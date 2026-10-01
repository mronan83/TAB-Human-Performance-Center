import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/portal";
import { fmtDate, serviceName } from "@/lib/portal/format";
import { activityKinds } from "@/lib/portal/programs";
import { PageTitle, Panel, Badge } from "@/components/portal/ui";
import { ProgramEditor, ProgramActionButton } from "@/components/portal/ProgramEditor";

const DONE: Record<string, string> = {
  saved: "Draft saved.", submit: "Submitted for review.", publish: "Published. This version can now be assigned to clients.",
  retire: "Retired. It can't be assigned any more; clients who have it keep it.", new_version: "New draft version started from the latest version.",
};
const kindLabel = (k: string) => activityKinds.find((x) => x.value === k)?.label ?? k;

/** One version of a program: the editor while it's a draft, read-only once published (C7, design §3.1). */
export default async function ProgramVersionPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ done?: string }> }) {
  const { id } = await params;
  const { done } = await searchParams;
  const { viewer, repo } = await requireStaff();
  const program = await repo.getProgramTemplate(id);
  if (!program) notFound();
  const versions = (await repo.listProgramTemplates()).filter((t) => t.familyId === program.familyId).sort((a, b) => b.version - a.version);
  const canPublish = viewer.role === "owner" || !!viewer.canPublish;
  const status = program.status === "draft" ? (program.submittedAt ? "Draft, submitted for review" : "Draft") : program.status === "published" ? "Published" : "Retired";
  return (
    <>
      <PageTitle eyebrow={`Program library · ${serviceName(program.service)} · version ${program.version}`} title={program.title}
        action={<Link href="/practice/programs" className="btn btn-outline btn-sm">Back to library</Link>} />
      {done && DONE[done] && <p role="status" className="mb-6 rounded-xl bg-[#E4EBDD] p-4 font-semibold text-success">{DONE[done]}</p>}
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Panel title={program.status === "draft" ? "Edit draft" : "Content"}>
          {program.status === "draft" ? <ProgramEditor key={program.id} program={program} /> : (
            <>
              {program.summary && <p className="mb-4">{program.summary}</p>}
              <div className="space-y-4">
                {program.modules.map((m) => (
                  <section key={m.id} className="rounded-xl border border-border p-4">
                    <h3 className="font-semibold">Week {m.week}: {m.title}</h3>
                    {m.body && <p className="mt-1 text-sm text-text-secondary">{m.body}</p>}
                    <ul className="mt-3 space-y-2">
                      {m.activities.map((a) => (
                        <li key={a.id} className="rounded-lg bg-cream p-3">
                          <p><span className="font-semibold">{kindLabel(a.kind)}:</span> {a.title}</p>
                          {a.instructions && <p className="text-sm text-text-secondary">{a.instructions}</p>}
                          {a.prescription && Object.keys(a.prescription).length > 0 && <p className="text-sm">{Object.entries(a.prescription).map(([key, v]) => `${key} ${v}`).join(" · ")}</p>}
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
                {program.modules.length === 0 && <p className="text-text-secondary">No weeks yet.</p>}
              </div>
            </>
          )}
        </Panel>
        <div className="space-y-6">
          <Panel title="Status">
            <p className="mb-4"><Badge tone={program.status === "published" ? "success" : program.submittedAt ? "accent" : "neutral"}>{status}</Badge></p>
            {program.status === "draft" && (
              <>
                <p className="mb-4 text-sm text-text-secondary">Save your changes before submitting or publishing.{canPublish ? "" : " Publishing needs the publishing permission; submit the draft and a publisher will review it."}</p>
                <div className="flex flex-wrap gap-2">
                  {canPublish && <ProgramActionButton programId={program.id} action="publish" primary confirmText={versions.some((v) => v.status === "published") ? "Publish this version? The current published version is retired; clients who have it keep it." : undefined} />}
                  {!program.submittedAt && <ProgramActionButton programId={program.id} action="submit" primary={!canPublish} />}
                  <ProgramActionButton programId={program.id} action="discard" confirmText="Discard this draft? This can't be undone." />
                </div>
              </>
            )}
            {program.status === "published" && (
              <>
                <p className="mb-4 text-sm text-text-secondary">Published versions don&rsquo;t change. To edit, start a new version; clients keep the version they were assigned.</p>
                <div className="flex flex-wrap gap-2">
                  <ProgramActionButton programId={program.id} action="new_version" primary />
                  {canPublish && <ProgramActionButton programId={program.id} action="retire" confirmText="Retire this program? It can't be assigned any more; clients who have it keep it." />}
                </div>
              </>
            )}
            {program.status === "retired" && (
              <>
                <p className="mb-4 text-sm text-text-secondary">This version can&rsquo;t be assigned any more. Clients who have it keep it.</p>
                {!versions.some((v) => v.status === "draft") && <ProgramActionButton programId={program.id} action="new_version" />}
              </>
            )}
          </Panel>
          <Panel title="Versions">
            <ul className="space-y-2 text-sm">
              {versions.map((v) => (
                <li key={v.id} className="flex flex-wrap items-center justify-between gap-2">
                  {v.id === program.id ? <span className="font-semibold">Version {v.version} (this page)</span> : <Link href={`/practice/programs/${v.id}`} className="font-semibold text-primary underline">Version {v.version}</Link>}
                  <span className="flex items-center gap-2">
                    {v.publishedAt && <span className="text-text-secondary">{fmtDate(v.publishedAt, { month: "short", day: "numeric", year: "numeric" })}</span>}
                    <Badge tone={v.status === "published" ? "success" : "neutral"}>{v.status}</Badge>
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}
