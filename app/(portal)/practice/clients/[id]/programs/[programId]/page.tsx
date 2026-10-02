import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/portal";
import { fmtDate, serviceName } from "@/lib/portal/format";
import { newerVersions, planOptions, programProgress, programStatuses } from "@/lib/portal/programs";
import { PageTitle, Panel, Badge, ProgressBar } from "@/components/portal/ui";
import { MoveProgramForm, ProgramAssignmentForm } from "@/components/portal/interactive";

/** One assigned program: status, plan link and this client's personalization (design §2.4 step 3). */
export default async function ClientProgramPage({ params, searchParams }: { params: Promise<{ id: string; programId: string }>; searchParams: Promise<{ saved?: string; moved?: string }> }) {
  const { id, programId } = await params;
  const { saved, moved } = await searchParams;
  const { repo } = await requireStaff();
  const [client, program] = await Promise.all([repo.getClient(id), repo.getClientProgram(id, programId)]);
  if (!client || !program) notFound();
  const plans = planOptions(await repo.listPlans(id, { staff: true }), program.planId);
  const newer = newerVersions(program, await repo.listProgramTemplates())[0];
  const status = programStatuses.find((s) => s.value === program.status)?.label ?? program.status;
  return (
    <>
      <PageTitle eyebrow={`${client.fullName} · ${serviceName(program.template.service)}`} title={program.template.title}
        action={<Link href={`/practice/clients/${id}`} className="btn btn-outline btn-sm">Back to client</Link>} />
      {saved && <p role="status" className="mb-6 rounded-xl bg-[#E4EBDD] p-4 font-semibold text-success">Program saved.{program.status === "active" ? " The client sees it in My TAB with your changes." : ""}</p>}
      {moved !== undefined && <p role="status" className="mb-6 rounded-xl bg-[#E4EBDD] p-4 font-semibold text-success">Moved to version {program.templateVersion}. {Number(moved) === 1 ? "1 completed activity" : `${Number(moved) || 0} completed activities`} carried over, with your changes for the activities that are still in the program.</p>}
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Panel title="Program"><ProgramAssignmentForm clientId={id} template={program.template} program={program} plans={plans} /></Panel>
        <Panel title="Progress">
          <div className="mb-4 flex flex-wrap gap-2"><Badge tone={program.status === "active" ? "success" : "neutral"}>{status}</Badge><Badge>Week {program.currentWeek}</Badge><Badge>Version {program.templateVersion}</Badge></div>
          <ProgressBar value={programProgress(program)} label="Completion" />
          <p className="mt-4 text-sm text-text-secondary">Started {fmtDate(program.startedAt, { month: "long", day: "numeric", year: "numeric" })}{program.completedAt ? ` · completed ${fmtDate(program.completedAt, { month: "long", day: "numeric", year: "numeric" })}` : ""}.</p>
          <p className="mt-2 text-sm text-text-secondary">The client keeps version {program.templateVersion} of this program until you move them to a newer one.</p>
          {newer && (
            <div className="mt-5 rounded-xl border border-border p-4">
              <p className="font-semibold">Version {newer.version} is available</p>
              <p className="mt-1 text-sm text-text-secondary">Moving carries over completed activities and your changes for every activity that is still in version {newer.version}. Activities you added for {client.preferredName ?? client.fullName} stay as they are.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <MoveProgramForm clientId={id} programId={program.id} target={{ id: newer.id, version: newer.version }} clientName={client.preferredName ?? client.fullName} />
                <Link href={`/practice/programs/${newer.id}`} className="btn btn-outline btn-sm">See version {newer.version}</Link>
              </div>
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}
