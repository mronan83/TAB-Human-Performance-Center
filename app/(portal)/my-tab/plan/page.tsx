import { requireClient } from "@/lib/portal";
import { fmtDate, serviceName, STAGES } from "@/lib/portal/format";
import { PageTitle, Panel, Badge, StageTracker, EmptyState } from "@/components/portal/ui";
import { TrendChart } from "@/components/portal/TrendChart";

export default async function PlanPage() {
  const { clientId, repo } = await requireClient();
  const [plan, client, metrics, progress, reviews, notes] = await Promise.all([repo.getPlan(clientId), repo.getClient(clientId), repo.listMetrics(), repo.listProgress(clientId), repo.listSharedReviews(clientId), repo.listNotes(clientId, false)]);
  if (!plan) return (<><PageTitle eyebrow="My plan" title="Your plan" /><EmptyState title="Your plan is being prepared." body="After your first conversation, your practitioner will share a personalized plan here." /></>);
  const stage = STAGES.find((s) => s.key === client?.methodStage);
  return (
    <>
      <PageTitle eyebrow="My plan" title={plan.title} lead={plan.focus} />
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          {plan.goals.map((g) => {
            const metric = metrics.find((m) => m.key === g.metricKey);
            return (
              <Panel key={g.id}>
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-h4">{g.title}</h2>
                  <Badge tone={g.status === "achieved" ? "success" : "neutral"}>{g.status}</Badge>
                </div>
                {g.whyItMatters && <p className="mt-2 italic text-text-secondary">“{g.whyItMatters}”</p>}
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  {g.measure && <div><dt className="text-text-secondary">How we’ll know</dt><dd className="font-medium">{g.measure}</dd></div>}
                  {g.target && <div><dt className="text-text-secondary">Target</dt><dd className="font-medium">{g.target}</dd></div>}
                </dl>
                {metric && <div className="mt-5 border-t border-border pt-5"><TrendChart metric={metric} entries={progress} target={g.target} /></div>}
              </Panel>
            );
          })}
        </div>
        <div className="space-y-6">
          <Panel title="Where you are">
            <StageTracker stage={client!.methodStage} />
            {stage && <p className="mt-4 text-sm text-text-secondary">{stage.blurb}</p>}
          </Panel>
          <Panel title="Plan details">
            <dl className="space-y-3 text-sm">
              {plan.startDate && <div className="flex justify-between"><dt className="text-text-secondary">Started</dt><dd>{fmtDate(plan.startDate, { month: "long", day: "numeric", year: "numeric" })}</dd></div>}
              {plan.reviewDate && <div className="flex justify-between"><dt className="text-text-secondary">Next review</dt><dd>{fmtDate(plan.reviewDate, { month: "long", day: "numeric", year: "numeric" })}</dd></div>}
              {plan.practitionerName && <div className="flex justify-between"><dt className="text-text-secondary">Practitioner</dt><dd>{plan.practitionerName}</dd></div>}
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">{plan.services.map((s) => <Badge key={s}>{serviceName(s)}</Badge>)}</div>
          </Panel>
          {notes.length > 0 && (
            <Panel title="Session notes for you">
              <ul className="space-y-4">
                {notes.slice(0, 5).map((n) => (<li key={n.id}><p className="text-sm text-text-secondary">{fmtDate(n.date, { month: "long", day: "numeric" })}{n.service ? ` · ${serviceName(n.service)}` : ""}</p><p className="mt-1">{n.body}</p></li>))}
              </ul>
            </Panel>
          )}
          {reviews.length > 0 && (
            <Panel title="Progress reviews">
              <ul className="space-y-4">
                {reviews.map((r) => (<li key={r.id}><p className="text-sm text-text-secondary">{fmtDate(r.date, { month: "long", day: "numeric" })}</p><p className="mt-1">{r.summary}</p>{r.nextSteps && <p className="mt-1 text-sm"><strong>Next:</strong> {r.nextSteps}</p>}</li>))}
              </ul>
            </Panel>
          )}
        </div>
      </div>
    </>
  );
}
