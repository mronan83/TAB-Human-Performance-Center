import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/portal";
import { PageTitle, Panel, StageTracker } from "@/components/portal/ui";
import { ProgressReviewForm } from "@/components/portal/interactive";

/** Progress Review (Step 14 §14.4.5): the Reflect & Adjust conversation, and the only place a stage is changed. */
export default async function ProgressReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { repo } = await requireStaff();
  const client = await repo.getClient(id);
  if (!client) notFound();
  const plan = await repo.getPlan(id);
  const name = client.preferredName ?? client.fullName;
  return (
    <>
      <PageTitle eyebrow={client.fullName} title="Progress review" lead="Work through this together. Anything you share appears in their My TAB." action={<Link href={`/practice/clients/${id}`} className="btn btn-outline btn-sm">Back to client</Link>} />
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Panel><ProgressReviewForm clientId={id} clientName={name} currentStage={client.methodStage} /></Panel>
        <div className="space-y-6">
          <Panel title="Current stage"><StageTracker stage={client.methodStage} /></Panel>
          <Panel title="When we started, you wanted to…">
            {plan?.goals.length ? (
              <ul className="space-y-2">{plan.goals.map((g) => <li key={g.id} className="rounded-xl bg-cream p-3"><p className="font-semibold">{g.title}</p>{g.whyItMatters && <p className="text-sm text-text-secondary">{g.whyItMatters}</p>}</li>)}</ul>
            ) : <p className="text-text-secondary">No plan goals recorded yet. Start with what they hoped for when they began.</p>}
          </Panel>
        </div>
      </div>
    </>
  );
}
