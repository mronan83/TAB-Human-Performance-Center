import { notFound } from "next/navigation";
import { requireClient } from "@/lib/portal";
import { serviceName, fmtDate } from "@/lib/portal/format";
import { PageTitle, Panel, Badge, ProgressBar } from "@/components/portal/ui";
import { ActivityCheck } from "@/components/portal/interactive";
import { personalizedModules, programProgress } from "@/lib/portal/programs";

const KIND_LABEL = { exercise: "Exercise", habit: "Habit", reflection: "Reflection", reading: "Read", video: "Watch", check_in: "Check-in" } as const;

export default async function ProgramDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { clientId, repo } = await requireClient();
  const p = await repo.getClientProgram(clientId, id);
  if (!p || p.status === "cancelled") notFound();
  const modules = personalizedModules(p);
  return (
    <>
      <PageTitle eyebrow={serviceName(p.template.service)} title={p.template.title} lead={p.template.summary} />
      <div className="mb-8 max-w-md"><ProgressBar value={programProgress(p)} label={`Started ${fmtDate(p.startedAt, { month: "long", day: "numeric" })}`} /></div>
      {p.status !== "active" && <p role="status" className="mb-6 rounded-xl bg-cream p-4">{p.status === "paused" ? "This program is paused for now. Your practitioner will let you know when it picks up again." : "You’ve completed this program."}</p>}
      {p.personalization.note && (
        <section aria-labelledby="practitioner-note" className="mb-6 rounded-xl border border-sage bg-[#F1F3EA] p-4">
          <h2 id="practitioner-note" className="font-semibold">A note from your practitioner</h2>
          <p className="mt-1">{p.personalization.note}</p>
        </section>
      )}
      <div className="space-y-6">
        {modules.map((m) => {
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
                      detail={[a.instructions, a.prescription && Object.entries(a.prescription).map(([k, v]) => `${k} ${v}`).join(" · "), a.adjusted && "adjusted for you"].filter(Boolean).join(" — ")} note={a.personalNote} />
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
