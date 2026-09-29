import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/portal";
import { canUsePlanType, planTypes } from "@/lib/portal/plan-types";
import type { PlanType } from "@/lib/portal/types";
import { PageTitle, Panel, EmptyState } from "@/components/portal/ui";
import { PlanForm } from "@/components/portal/interactive";

/** New plan: the Wellness Plan (anchor) or a service plan of the chosen type (design §2.4). */
export default async function NewPlanPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ type?: string }> }) {
  const { id } = await params;
  const { type } = await searchParams;
  const { viewer, repo } = await requireStaff();
  const client = await repo.getClient(id);
  if (!client || !type || !(type in planTypes)) notFound();
  const planType = type as PlanType;
  const def = planTypes[planType];
  const back = <Link href={`/practice/clients/${id}`} className="btn btn-outline btn-sm">Back to client</Link>;
  const anchor = await repo.getPlan(id);
  let blocked: string | undefined;
  if (!canUsePlanType(planType, viewer.capabilities)) blocked = `${def.label}s can only be created by a practitioner with the matching credential.`;
  else if (planType !== "wellness" && !anchor) blocked = "Create the TAB Wellness Plan first. Service plans sit under it.";
  else if (planType === "wellness" && anchor) blocked = "This client already has an active Wellness Plan. Edit it instead, or complete it before starting a new one.";
  return (
    <>
      <PageTitle eyebrow={client.fullName} title={`New ${def.label}`} action={back} />
      <Panel>{blocked ? <EmptyState title={blocked} /> : <PlanForm clientId={id} planType={planType} />}</Panel>
    </>
  );
}
