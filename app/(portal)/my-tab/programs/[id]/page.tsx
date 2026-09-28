import { notFound } from "next/navigation";
import { requireClient } from "@/lib/portal";
import { serviceName, fmtDate } from "@/lib/portal/format";
import { PageTitle, Panel, Badge, ProgressBar } from "@/components/portal/ui";
import { ActivityCheck } from "@/components/portal/interactive";

const KIND_LABEL = { exercise: "Exercise", habit: "Habit", reflection: "Reflection", reading: "Read", video: "Watch", check_in: "Check-in" } as const;

export default async function ProgramDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { clientId, repo } = await requireClient();
  const p = await repo.getClientProgram(clientId, id);
  if (!p) notFound();
  const total = p.template.modules.reduce((n, m) => n + m.activities.length, 0);
  return (
    <>
      <PageTitle eyebrow={serviceName(p.template.service)} title={p.template.title} lead={p.template.summary} />
      <div className="mb-8 max-w-md"><ProgressBar value={total ? p.completedActivityIds.length / total : 0} label={`Started ${fmtDate(p.startedAt, { month: "long", day: "numeric" })}`} /></div>
      <div className="space-y-6">
        {p.template.modules.map((m) => {
          const current = m.week === p.currentWeek;
          const locked = m.week > p.currentWeek;
          return (
            <Panel key={m.id} title={m.title} action={current ? <Badge tone="brand">This week</Badge> : locked ? <Badge>Upcoming</Badge> : <Badge tone="success">Done</Badge>} className={locked ? "opacity-70" : undefined}>
              {m.body && <p className="mb-4 text-text-secondary">{m.body}</p>}
              {locked ? <p className="text-sm text-text-secondary">Opens in week {m.week}.</p> : (
                <div className="space-y-3">
                  {m.activities.map((a) => (
                    <ActivityCheck key={a.id} programId={p.id} activityId={a.id} done={p.completedActivityIds.includes(a.id)}
                      title={`${KIND_LABEL[a.kind]}: ${a.title}`}
                      detail={[a.instructions, a.prescription && Object.entries(a.prescription).map(([k, v]) => `${k} ${v}`).join(" · ")].filter(Boolean).join(" — ")} />
                  ))}
                </div>
              )}
            </Panel>
          );
        })}
      </div>
    </>
  );
}
