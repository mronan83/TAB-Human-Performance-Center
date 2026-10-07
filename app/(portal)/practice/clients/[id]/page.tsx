import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/portal";
import { STAGES, fmtDate, fmtDateTime, serviceName } from "@/lib/portal/format";
import { outcomeLabel } from "@/lib/portal/review";
import { programProgress } from "@/lib/portal/programs";
import { canUsePlanType, planTypes, servicePlanTypes } from "@/lib/portal/plan-types";
import { PageTitle, Panel, Badge, StageTracker, ProgressBar } from "@/components/portal/ui";
import { TrendChart } from "@/components/portal/TrendChart";
import { AssignFormForm, InviteForm, NoteForm, RowActionButton, ShareResourceForm } from "@/components/portal/interactive";
import { removeResourceAction, withdrawFormAction } from "@/app/(portal)/actions";
import { resourcePicks } from "@/lib/resources";

const stageLabel = (k?: string) => STAGES.find((s) => s.key === k)?.label ?? k;
const ACCESS_LABEL = { not_invited: "Not invited", invited: "Invited", active: "Active" } as const;
const EMAIL_NOTE: Record<string, string> = { sent: "They’ve been emailed.", skipped: "No email was sent (demo mode or email not set up yet).", failed: "The email couldn’t be sent; let them know directly." };

export default async function ClientDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ review?: string; email?: string }> }) {
  const { id } = await params;
  const { review, email } = await searchParams;
  const { viewer, repo } = await requireStaff();
  const client = await repo.getClient(id);
  if (!client) notFound();
  const [plan, programs, notes, checkIns, metrics, progress, appts, forms, reviews, stageChanges] = await Promise.all([
    repo.getPlan(id), repo.listClientPrograms(id), repo.listNotes(id, true), repo.listCheckIns(id), repo.listMetrics(), repo.listProgress(id), repo.listAppointments(id), repo.listForms(id),
    repo.listReviews(id), repo.listStageChanges(id),
  ]);
  const allPlans = await repo.listPlans(id, { staff: true });
  const [resources, formTemplates] = await Promise.all([repo.listResources(id), repo.listFormTemplates()]);
  const access = client.myTab ?? { status: "not_invited" as const };
  const servicePlans = allPlans.filter((p) => p.planType !== "wellness");
  const tracked = metrics.filter((m) => progress.some((p) => p.metricKey === m.key)).slice(0, 3);
  return (
    <>
      <PageTitle eyebrow="Client" title={client.fullName} lead={[client.email, client.delivery].filter(Boolean).join(" · ")} action={<Badge tone={client.status === "active" ? "success" : "neutral"}>{client.status}</Badge>} />
      {review === "saved" && (
        <p role="status" className="mb-6 rounded-xl bg-success-soft p-4 font-semibold text-success">
          Progress review saved.{email ? ` Stage updated to ${stageLabel(client.methodStage)}. ${EMAIL_NOTE[email] ?? ""}` : ""}
        </p>
      )}
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <Panel title="TAB Method stage" action={<Link href={`/practice/clients/${id}/review`} className="btn btn-primary btn-sm">Progress review</Link>}>
            <StageTracker stage={client.methodStage} />
            {stageChanges.length > 0 && (
              <ul className="mt-5 space-y-1 text-sm text-text-secondary">
                {stageChanges.map((c) => <li key={c.id}>{fmtDate(c.changedAt, { month: "short", day: "numeric", year: "numeric" })}: {c.from ? `${stageLabel(c.from)} → ` : ""}{stageLabel(c.to)}{c.changedBy ? ` · ${c.changedBy}` : ""}</li>)}
              </ul>
            )}
          </Panel>
          <Panel title="Progress reviews">
            {reviews.length ? (
              <ul className="space-y-3">
                {reviews.map((r) => (
                  <li key={r.id} className="rounded-xl border border-border p-4">
                    <div className="mb-1 flex flex-wrap items-center gap-2 text-sm text-text-secondary">
                      <span>{fmtDate(r.date, { month: "short", day: "numeric", year: "numeric" })}</span>
                      {r.outcome && <span>· {outcomeLabel(r.outcome)}</span>}
                      <Badge tone={r.shared ? "success" : "neutral"}>{r.shared ? "Shared with client" : "Internal"}</Badge>
                    </div>
                    {r.summary && <p>{r.summary}</p>}
                    {r.nextSteps && <p className="mt-1 text-sm"><span className="font-semibold">Next: </span>{r.nextSteps}</p>}
                  </li>
                ))}
              </ul>
            ) : <p className="text-text-secondary">No reviews yet.</p>}
          </Panel>
          <Panel title="Plans" action={plan ? <Link href={`/practice/clients/${id}/plans/${plan.id}`} className="btn btn-outline btn-sm">Edit Performance Plan</Link> : undefined}>
            {plan ? (
              <>
                <p className="font-semibold">{plan.title}</p>
                {plan.focus && <p className="text-text-secondary">{plan.focus}</p>}
                <ul className="mt-4 space-y-2">{plan.goals.map((g) => <li key={g.id} className="flex items-start justify-between gap-3 rounded-xl bg-bone p-3"><span>{g.title}</span><Badge>{g.target ?? g.status}</Badge></li>)}</ul>
                {plan.reviewDate && <p className="mt-4 text-sm text-text-secondary">Next review {fmtDate(plan.reviewDate, { month: "long", day: "numeric" })}</p>}
              </>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-text-secondary">No active Performance Plan yet.</p><Link href={`/practice/clients/${id}/plans/new?type=wellness`} className="btn btn-primary btn-sm">Create Performance Plan</Link></div>
            )}
            {servicePlans.length > 0 && (
              <ul className="mt-6 divide-y divide-border border-t border-border">
                {servicePlans.map((p) => (
                  <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <Link href={`/practice/clients/${id}/plans/${p.id}`} className="font-semibold text-primary underline">{planTypes[p.planType].short}: {p.title}</Link>
                    <span className="flex gap-2"><Badge tone={p.status === "active" ? "success" : "neutral"}>{p.status}</Badge><Badge tone={p.visibleToClient ? "success" : "neutral"}>{p.visibleToClient ? "Shared" : "Not shared"}</Badge></span>
                  </li>
                ))}
              </ul>
            )}
            {plan && (
              <div className="mt-6">
                <p className="field-label">Add a service plan</p>
                <div className="flex flex-wrap gap-2">
                  {servicePlanTypes.filter((t) => canUsePlanType(t, viewer.capabilities)).map((t) => (
                    <Link key={t} href={`/practice/clients/${id}/plans/new?type=${t}`} className="btn btn-outline btn-sm">{planTypes[t].short}</Link>
                  ))}
                </div>
              </div>
            )}
          </Panel>
          <Panel title="Session notes">
            <NoteForm clientId={id} />
            <ul className="mt-6 space-y-3">
              {notes.map((n) => (
                <li key={n.id} className={n.visibility === "internal" ? "rounded-xl border border-border bg-bone p-4" : "rounded-xl border border-sage bg-note-soft p-4"}>
                  <div className="mb-1 flex flex-wrap items-center gap-2 text-sm text-text-secondary">
                    <span>{fmtDate(n.date, { month: "short", day: "numeric", year: "numeric" })}</span>{n.service && <span>· {serviceName(n.service)}</span>}
                    <Badge tone={n.visibility === "internal" ? "neutral" : "success"}>{n.visibility === "internal" ? "Internal" : "Shared with client"}</Badge>
                  </div>
                  <p>{n.body}</p>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
        <div className="space-y-6">
          <Panel title="My TAB access" action={<Badge tone={access.status === "active" ? "success" : access.status === "invited" ? "accent" : "neutral"}>{ACCESS_LABEL[access.status]}</Badge>}>
            <p className="mb-3 text-sm text-text-secondary">
              {access.status === "active" ? `Using My TAB since ${fmtDate(access.activatedAt!, { month: "long", day: "numeric", year: "numeric" })}.`
                : access.status === "invited" ? `Invited${access.invitedAt ? ` ${fmtDate(access.invitedAt, { month: "long", day: "numeric" })}` : ""}; they haven't signed in yet.`
                : "They can't sign in to My TAB until you invite them."}
            </p>
            <InviteForm clientId={id} status={access.status} hasEmail={!!client.email} />
          </Panel>
          <Panel title="Programs" action={<Link href={`/practice/clients/${id}/programs/new`} className="btn btn-primary btn-sm">Assign program</Link>}>
            <div className="space-y-4">
              {programs.map((p) => (
                <div key={p.id}>
                  <p className="mb-1 flex flex-wrap items-center gap-2">
                    <Link href={`/practice/clients/${id}/programs/${p.id}`} className="font-semibold text-primary underline">{p.template.title}</Link>
                    <span className="text-text-secondary">· week {p.currentWeek}</span>
                    {p.status !== "active" && <Badge>{p.status}</Badge>}
                  </p>
                  <ProgressBar value={programProgress(p)} label="Completion" />
                </div>
              ))}
              {programs.length === 0 && <p className="text-text-secondary">None assigned.</p>}
            </div>
          </Panel>
          {tracked.map((m) => <Panel key={m.key} title={m.label}><TrendChart metric={m} entries={progress} /></Panel>)}
          <Panel title="Recent check-ins">
            <ul className="space-y-3 text-sm">
              {checkIns.slice(0, 4).map((c) => (<li key={c.weekOf}><p className="font-semibold">Week of {fmtDate(c.weekOf)}</p><p className="text-text-secondary">Energy {c.energy ?? "–"} · Sleep {c.sleepQuality ?? "–"} · Stress {c.stress ?? "–"}</p>{c.challenges && <p className="mt-1">{c.challenges}</p>}</li>))}
              {checkIns.length === 0 && <li className="text-text-secondary">No check-ins yet.</li>}
            </ul>
          </Panel>
          <Panel title="Upcoming">
            <ul className="space-y-2 text-sm">{appts.map((a) => <li key={a.id}>{fmtDateTime(a.startsAt)} · {serviceName(a.service)}</li>)}{appts.length === 0 && <li className="text-text-secondary">Nothing scheduled.</li>}</ul>
          </Panel>
          <Panel title="Forms">
            <ul className="space-y-3 text-sm">
              {forms.map((f) => (
                <li key={f.id ?? f.template.slug} className="flex flex-wrap items-center justify-between gap-2">
                  <span><span className="font-semibold">{f.template.title}</span>{f.dueOn && f.status === "not_started" && <span className="text-text-secondary"> · due {fmtDate(f.dueOn, { month: "short", day: "numeric" })}</span>}</span>
                  <span className="flex items-center gap-2">
                    <Badge tone={f.status === "submitted" || f.status === "reviewed" ? "success" : "accent"}>{f.status.replace("_", " ")}</Badge>
                    {f.id && f.status === "not_started" && <RowActionButton action={withdrawFormAction.bind(null, id, f.id)} label="Withdraw" context={f.template.title} />}
                  </span>
                </li>
              ))}
              {forms.length === 0 && <li className="text-text-secondary">No forms yet.</li>}
            </ul>
            <div className="mt-5 border-t border-border pt-4"><AssignFormForm clientId={id} templates={formTemplates.map((t) => ({ id: t.id, title: t.title }))} /></div>
          </Panel>
          <Panel title="Resources">
            <ul className="space-y-3 text-sm">
              {resources.map((r) => (
                <li key={r.id} className="flex flex-wrap items-start justify-between gap-2">
                  <span className="min-w-0"><span className="font-semibold">{r.title}</span>{r.kind && <span className="text-text-secondary"> · {r.kind}</span>}
                    <span className="block text-text-secondary">Shared {fmtDate(r.assignedAt, { month: "short", day: "numeric" })}{r.viewedAt ? ", viewed" : ", not viewed yet"}</span>
                    {r.note && <span className="block">{r.note}</span>}</span>
                  <RowActionButton action={removeResourceAction.bind(null, id, r.id)} label="Remove" context={r.title} />
                </li>
              ))}
              {resources.length === 0 && <li className="text-text-secondary">Nothing shared yet.</li>}
            </ul>
            <div className="mt-5 border-t border-border pt-4"><ShareResourceForm clientId={id} library={resourcePicks()} /></div>
          </Panel>
        </div>
      </div>
    </>
  );
}
