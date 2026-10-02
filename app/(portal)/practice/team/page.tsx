import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/portal";
import { PageTitle, Panel, Badge } from "@/components/portal/ui";
import { PractitionerForm } from "@/components/portal/interactive";

/** Team (C7b): the owner decides who may publish programs and who holds credentials that unlock gated plan types. */
export default async function TeamPage() {
  const { viewer, repo } = await requireStaff();
  if (viewer.role !== "owner") notFound();
  const team = await repo.listPractitioners();
  return (
    <>
      <PageTitle eyebrow="Practice workspace" title="Team" lead="Who can publish programs, and who holds the nutrition coaching credential. The database enforces both; only the owner can change them." />
      <div className="grid gap-6 md:grid-cols-2">
        {team.map((p) => (
          <Panel key={p.id} title={p.name} action={<span className="flex gap-2"><Badge tone={p.role === "owner" ? "brand" : "neutral"}>{p.role === "owner" ? "Owner" : "Practitioner"}</Badge>{!p.active && <Badge>Inactive</Badge>}</span>}>
            <PractitionerForm practitioner={p} />
          </Panel>
        ))}
      </div>
    </>
  );
}
