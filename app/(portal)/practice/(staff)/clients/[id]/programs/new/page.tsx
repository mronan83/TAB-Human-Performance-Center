import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/portal";
import { serviceName } from "@/lib/portal/format";
import { planOptions } from "@/lib/portal/programs";
import { PageTitle, Panel, EmptyState } from "@/components/portal/ui";
import { ProgramAssignmentForm } from "@/components/portal/interactive";

/** Assign a program (design §2.4 step 3): choose a published template, then link and personalize it. */
export default async function AssignProgramPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ template?: string }> }) {
  const { id } = await params;
  const { template: templateId } = await searchParams;
  const { repo } = await requireStaff();
  const client = await repo.getClient(id);
  if (!client) notFound();
  const published = (await repo.listProgramTemplates()).filter((t) => t.status === "published");
  const template = templateId ? published.find((t) => t.id === templateId) : undefined;
  const back = <Link href={`/practice/clients/${id}`} className="btn btn-outline btn-sm">Back to client</Link>;
  if (!template) {
    return (
      <>
        <PageTitle eyebrow={client.fullName} title="Assign a program" lead="Choose a published program from the library. You can personalize it for this client next." action={back} />
        {published.length === 0 ? <EmptyState title="No published programs yet." body="Programs appear here once they're published in the library." /> : (
          <div className="grid gap-6 md:grid-cols-2">
            {published.map((t) => (
              <Panel key={t.id} title={t.title}>
                <p className="text-sm text-text-secondary">{serviceName(t.service)}{t.durationWeeks ? ` · ${t.durationWeeks} weeks` : ""} · {t.modules.reduce((n, m) => n + m.activities.length, 0)} activities</p>
                {t.summary && <p className="mt-3">{t.summary}</p>}
                <Link href={`/practice/clients/${id}/programs/new?template=${encodeURIComponent(t.id)}`} className="btn btn-primary btn-sm mt-4">Choose {t.title}</Link>
              </Panel>
            ))}
          </div>
        )}
      </>
    );
  }
  const plans = planOptions(await repo.listPlans(id, { staff: true }));
  return (
    <>
      <PageTitle eyebrow={`${client.fullName} · ${serviceName(template.service)}`} title={`Assign ${template.title}`} lead={template.summary}
        action={<Link href={`/practice/clients/${id}/programs/new`} className="btn btn-outline btn-sm">Choose another program</Link>} />
      <Panel><ProgramAssignmentForm clientId={id} template={template} plans={plans} /></Panel>
    </>
  );
}
