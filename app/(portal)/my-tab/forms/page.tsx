import Link from "next/link";
import { requireClient } from "@/lib/portal";
import { fmtDate } from "@/lib/portal/format";
import { PageTitle, Badge, EmptyState } from "@/components/portal/ui";

export default async function FormsPage() {
  const { clientId, repo } = await requireClient();
  const forms = await repo.listForms(clientId);
  const tone = { not_started: "accent", draft: "warning", submitted: "success", reviewed: "success" } as const;
  const label = { not_started: "To do", draft: "In progress", submitted: "Submitted", reviewed: "Reviewed" };
  return (
    <>
      <PageTitle eyebrow="Forms" title="Forms and questionnaires" />
      {forms.length === 0 ? <EmptyState title="No forms right now." /> : (
        <ul className="divide-y divide-border rounded-[20px] border border-border bg-white">
          {forms.map((f) => (
            <li key={f.template.slug} className="flex flex-col justify-between gap-3 p-5 sm:flex-row sm:items-center">
              <div>
                <p className="font-semibold">{f.template.title}</p>
                <p className="text-sm text-text-secondary">{f.submittedAt ? `Submitted ${fmtDate(f.submittedAt)}` : f.dueOn ? `Before ${fmtDate(f.dueOn)}` : f.template.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone={tone[f.status]}>{label[f.status]}</Badge>
                <Link href={`/my-tab/forms/${f.template.slug}`} className="btn btn-outline btn-sm">{f.status === "submitted" || f.status === "reviewed" ? "View" : f.status === "draft" ? "Continue" : "Start"}</Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
