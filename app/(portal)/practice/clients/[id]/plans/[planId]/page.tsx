import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/portal";
import { fmtDate } from "@/lib/portal/format";
import { canUsePlanType, planTypes } from "@/lib/portal/plan-types";
import { PageTitle, Panel, Badge } from "@/components/portal/ui";
import { PlanForm, PlanEntryForm } from "@/components/portal/interactive";

/** One plan: edit it and keep its log (design §2.2, §2.4). */
export default async function PlanDetailPage({ params, searchParams }: { params: Promise<{ id: string; planId: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { id, planId } = await params;
  const { saved } = await searchParams;
  const { viewer, repo } = await requireStaff();
  const client = await repo.getClient(id);
  const plan = client ? (await repo.listPlans(id, { staff: true })).find((p) => p.id === planId) : undefined;
  if (!client || !plan) notFound();
  const def = planTypes[plan.planType];
  const editable = canUsePlanType(plan.planType, viewer.capabilities);
  const entries = await repo.listPlanEntries(id, planId, true);
  return (
    <>
      <PageTitle eyebrow={`${client.fullName} · ${def.label}`} title={plan.title}
        action={<Link href={`/practice/clients/${id}`} className="btn btn-outline btn-sm">Back to client</Link>} />
      {saved && <p role="status" className="mb-6 rounded-xl bg-[#E4EBDD] p-4 font-semibold text-success">Plan saved.{plan.visibleToClient ? " It’s shared with the client in My TAB." : " It isn’t shared with the client yet."}</p>}
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Panel title="Plan">
          {editable ? <PlanForm clientId={id} planType={plan.planType} plan={plan} /> : <p className="text-text-secondary">{def.label}s can only be edited by a practitioner with the matching credential.</p>}
        </Panel>
        <Panel title="Plan log">
          {editable && <PlanEntryForm clientId={id} planId={planId} />}
          <ul className="mt-6 space-y-3">
            {entries.map((e) => (
              <li key={e.id} className={e.visibility === "internal" ? "rounded-xl border border-border bg-cream p-4" : "rounded-xl border border-sage bg-[#F1F3EA] p-4"}>
                <div className="mb-1 flex flex-wrap items-center gap-2 text-sm text-text-secondary">
                  <span>{fmtDate(e.date, { month: "short", day: "numeric", year: "numeric" })}</span>{e.author && <span>· {e.author}</span>}
                  <Badge tone={e.visibility === "internal" ? "neutral" : "success"}>{e.visibility === "internal" ? "Internal" : "Shared with client"}</Badge>
                </div>
                <p>{e.body}</p>
              </li>
            ))}
            {entries.length === 0 && <li className="text-text-secondary">No entries yet.</li>}
          </ul>
        </Panel>
      </div>
    </>
  );
}
