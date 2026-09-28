import { requireClient } from "@/lib/portal";
import { weekStartISO, fmtDate } from "@/lib/portal/format";
import { PageTitle, Panel } from "@/components/portal/ui";
import { TrendChart } from "@/components/portal/TrendChart";
import { CheckInForm } from "@/components/portal/interactive";

export default async function ProgressPage() {
  const { clientId, repo } = await requireClient();
  const [metrics, progress, checkIns, plan] = await Promise.all([repo.listMetrics(), repo.listProgress(clientId), repo.listCheckIns(clientId), repo.getPlan(clientId)]);
  const week = weekStartISO();
  const thisWeek = checkIns.find((c) => c.weekOf === week);
  const tracked = metrics.filter((m) => progress.some((p) => p.metricKey === m.key));
  return (
    <>
      <PageTitle eyebrow="Progress" title="How it’s going" lead="Progress is measured by what matters to you—not only by numbers." />
      <Panel title={`Weekly check-in · week of ${fmtDate(week, { month: "long", day: "numeric" })}`} className="mb-8">
        <div id="check-in"><CheckInForm weekOf={week} existing={thisWeek} /></div>
      </Panel>
      <h2 className="text-h2 mb-4">Trends</h2>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {tracked.map((m) => (
          <Panel key={m.key} title={m.label}>
            <TrendChart metric={m} entries={progress} target={plan?.goals.find((g) => g.metricKey === m.key)?.target} />
          </Panel>
        ))}
      </div>
      {checkIns.length > 0 && (
        <section className="mt-10">
          <h2 className="text-h2 mb-4">Past check-ins</h2>
          <ul className="space-y-3">
            {checkIns.filter((c) => c.weekOf !== week).map((c) => (
              <li key={c.weekOf} className="rounded-[20px] border border-border bg-white p-5">
                <p className="text-sm font-semibold">Week of {fmtDate(c.weekOf, { month: "long", day: "numeric" })}</p>
                <p className="mt-1 text-sm text-text-secondary">Energy {c.energy ?? "–"} · Sleep {c.sleepQuality ?? "–"} · Stress {c.stress ?? "–"}</p>
                {c.wins && <p className="mt-2"><span className="font-semibold">Win:</span> {c.wins}</p>}
                {c.challenges && <p className="mt-1"><span className="font-semibold">In the way:</span> {c.challenges}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
