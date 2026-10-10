import Link from "next/link";
import { requireStaff } from "@/lib/portal";
import { fmtDate, serviceName } from "@/lib/portal/format";
import { PageTitle, Panel, Badge, EmptyState } from "@/components/portal/ui";
import type { ProgramTemplate } from "@/lib/portal/types";

/** Program library (C7, design §3.1): one card per program, with its published version and any draft in progress. */
export default async function ProgramLibrary({ searchParams }: { searchParams: Promise<{ done?: string }> }) {
  const { done } = await searchParams;
  const { viewer, repo } = await requireStaff();
  const families = new Map<string, ProgramTemplate[]>();
  for (const t of await repo.listProgramTemplates()) families.set(t.familyId, [...(families.get(t.familyId) ?? []), t]);
  const programs = [...families.values()].map((versions) => {
    const sorted = versions.sort((a, b) => b.version - a.version);
    const published = sorted.find((v) => v.status === "published");
    const draft = sorted.find((v) => v.status === "draft");
    return { main: published ?? sorted[0], published, draft };
  }).sort((a, b) => a.main.title.localeCompare(b.main.title));
  const canPublish = viewer.role === "owner" || !!viewer.canPublish;
  return (
    <>
      <PageTitle eyebrow="TAB Practice" title="Program library" lead="Reusable programs you can assign to clients or package as products. Any practitioner can write drafts; publishing makes a version available to assign."
        action={<Link href="/practice/programs/new" className="btn btn-primary btn-sm">New program</Link>} />
      {done === "discard" && <p role="status" className="mb-6 rounded-xl bg-success-soft p-4 font-semibold text-success">Draft discarded.</p>}
      <p className="mb-6 text-sm text-text-secondary">{canPublish ? "You can publish and retire programs. Drafts submitted for review are marked below." : "Submit a draft for review when it's ready; a practitioner with the publishing permission publishes it."}</p>
      {programs.length === 0 ? <EmptyState title="No programs yet." body="Start one with New program." /> : (
        <div className="grid gap-6 md:grid-cols-2">
          {programs.map(({ main, published, draft }) => (
            <Panel key={main.familyId} title={main.title} action={
              <span className="flex flex-wrap justify-end gap-2">
                {published ? <Badge tone="success">Published v{published.version}</Badge> : main.status === "retired" ? <Badge>Retired</Badge> : null}
                {draft && <Badge tone={draft.submittedAt ? "accent" : "neutral"}>{draft.submittedAt ? `Draft v${draft.version} submitted` : `Draft v${draft.version}`}</Badge>}
              </span>}>
              <p className="text-sm text-text-secondary">{serviceName(main.service)}{main.durationWeeks ? ` · ${main.durationWeeks} weeks` : ""} · {main.modules.reduce((n, m) => n + m.activities.length, 0)} activities</p>
              {main.summary && <p className="mt-3">{main.summary}</p>}
              {draft?.submittedAt && <p className="mt-3 text-sm">Submitted for review {fmtDate(draft.submittedAt, { month: "short", day: "numeric" })}.</p>}
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/practice/programs/${main.id}`} className="btn btn-outline btn-sm">Open {main.title}</Link>
                {draft && draft.id !== main.id && <Link href={`/practice/programs/${draft.id}`} className="btn btn-outline btn-sm">Open draft v{draft.version}<span className="sr-only"> of {main.title}</span></Link>}
              </div>
            </Panel>
          ))}
        </div>
      )}
    </>
  );
}
