import { requireStaff } from "@/lib/portal";
import { serviceName } from "@/lib/portal/format";
import { PageTitle, Panel, Badge } from "@/components/portal/ui";

/** Program templates (D-044). Editing arrives with the program architecture decision (D-010); templates are managed in the database for now. */
export default async function ProgramLibrary() {
  const { repo } = await requireStaff();
  const templates = await repo.listProgramTemplates();
  return (
    <>
      <PageTitle eyebrow="Practice workspace" title="Program library" lead="Reusable templates you can assign to clients or package as products." />
      <div className="grid gap-6 md:grid-cols-2">
        {templates.map((t) => (
          <Panel key={t.id} title={t.title} action={<Badge tone={t.status === "published" ? "success" : "neutral"}>{t.status}</Badge>}>
            <p className="text-sm text-text-secondary">{serviceName(t.service)} · {t.durationWeeks} weeks · {t.modules.reduce((n, m) => n + m.activities.length, 0)} activities</p>
            <p className="mt-3">{t.summary}</p>
            <ol className="mt-4 space-y-1 text-sm text-text-secondary">{t.modules.map((m) => <li key={m.id}>{m.title}</li>)}</ol>
          </Panel>
        ))}
      </div>
    </>
  );
}
