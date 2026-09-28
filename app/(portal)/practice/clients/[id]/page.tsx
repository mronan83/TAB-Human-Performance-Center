import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/portal";
import { fmtDate, fmtDateTime, serviceName } from "@/lib/portal/format";
import { PageTitle, Panel, Badge, StageTracker, ProgressBar } from "@/components/portal/ui";
import { TrendChart } from "@/components/portal/TrendChart";
import { NoteForm } from "@/components/portal/interactive";

export default async function ClientDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { repo } = await requireStaff();
  const client = await repo.getClient(id);
  if (!client) notFound();
  const [plan, programs, notes, checkIns, metrics, progress, appts, forms] = await Promise.all([
    repo.getPlan(id), repo.listClientPrograms(id), repo.listNotes(id, true), repo.listCheckIns(id), repo.listMetrics(), repo.listProgress(id), repo.listAppointments(id), repo.listForms(id),
  ]);
  const tracked = metrics.filter((m) => progress.some((p) => p.metricKey === m.key)).slice(0, 3);
  return (
    <>
      <PageTitle eyebrow="Client" title={client.fullName} lead={[client.email, client.delivery].filter(Boolean).join(" · ")} action={<Badge tone={client.status === "active" ? "success" : "neutral"}>{client.status}</Badge>} />
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <Panel title="TAB Method stage"><StageTracker stage={client.methodStage} /></Panel>
          <Panel title={plan ? `Plan: ${plan.title}` : "Plan"}>
            {plan ? (
              <>
                {plan.focus && <p className="text-text-secondary">{plan.focus}</p>}
                <ul className="mt-4 space-y-2">{plan.goals.map((g) => <li key={g.id} className="flex items-start justify-between gap-3 rounded-xl bg-cream p-3"><span>{g.title}</span><Badge>{g.target ?? g.status}</Badge></li>)}</ul>
                {plan.reviewDate && <p className="mt-4 text-sm text-text-secondary">Next review {fmtDate(plan.reviewDate, { month: "long", day: "numeric" })}</p>}
              </>
            ) : <p className="text-text-secondary">No active plan.</p>}
          </Panel>
          <Panel title="Session notes">
            <NoteForm clientId={id} />
            <ul className="mt-6 space-y-3">
              {notes.map((n) => (
                <li key={n.id} className={n.visibility === "internal" ? "rounded-xl border border-border bg-cream p-4" : "rounded-xl border border-sage bg-[#F1F3EA] p-4"}>
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
          <Panel title="Programs">
            <div className="space-y-4">
              {programs.map((p) => { const total = p.template.modules.reduce((n, m) => n + m.activities.length, 0); return (
                <div key={p.id}><p className="mb-1 font-semibold">{p.template.title} <span className="font-normal text-text-secondary">· week {p.currentWeek}</span></p><ProgressBar value={total ? p.completedActivityIds.length / total : 0} label="Completion" /></div>
              ); })}
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
            <ul className="space-y-2 text-sm">{forms.map((f) => <li key={f.template.slug} className="flex justify-between"><span>{f.template.title}</span><Badge tone={f.status === "submitted" ? "success" : "accent"}>{f.status.replace("_", " ")}</Badge></li>)}</ul>
          </Panel>
        </div>
      </div>
    </>
  );
}
