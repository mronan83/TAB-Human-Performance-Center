import type { MetricDefinition, ProgressEntry } from "@/lib/portal/types";
import { fmtDate } from "@/lib/portal/format";

/** Small, accessible line chart for one metric. Pure SVG, rendered on the server. */
export function TrendChart({ metric, entries, target }: { metric: MetricDefinition; entries: ProgressEntry[]; target?: string }) {
  const pts = entries.filter((e) => e.metricKey === metric.key).sort((a, b) => a.recordedOn.localeCompare(b.recordedOn)).slice(-10);
  const W = 320, H = 120, P = 16;
  if (pts.length === 0) return <p className="text-sm text-text-secondary">No entries yet.</p>;
  const vals = pts.map((p) => p.value);
  const lo = Math.min(metric.min ?? Math.min(...vals), ...vals), hi = Math.max(metric.max ?? Math.max(...vals), ...vals);
  const x = (i: number) => P + (pts.length === 1 ? (W - 2 * P) / 2 : (i * (W - 2 * P)) / (pts.length - 1));
  const y = (v: number) => H - P - ((v - lo) / (hi - lo || 1)) * (H - 2 * P);
  const first = vals[0], last = vals.at(-1)!;
  const delta = last - first;
  const improving = metric.higherIsBetter === undefined ? null : metric.higherIsBetter ? delta > 0 : delta < 0;
  const summary = `${metric.label}: ${first} to ${last} ${metric.unit ?? ""} over ${pts.length} entries`;
  return (
    <figure>
      <div className="flex items-baseline justify-between">
        <p className="font-[family-name:var(--font-display)] text-4xl font-medium">{last}<span className="ml-1 font-sans text-sm text-text-secondary">{metric.unit}</span></p>
        {improving !== null && delta !== 0 && (
          <span className={improving ? "text-sm font-semibold text-success" : "text-sm font-semibold text-warning"}>{delta > 0 ? "▲" : "▼"} {Math.abs(Math.round(delta * 10) / 10)}</span>
        )}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full" role="img" aria-label={summary}>
        <line x1={P} x2={W - P} y1={H - P} y2={H - P} stroke="var(--color-border)" />
        <polyline fill="none" stroke="var(--color-olive)" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" points={pts.map((p, i) => `${x(i)},${y(p.value)}`).join(" ")} />
        {pts.map((p, i) => (<circle key={p.recordedOn + i} cx={x(i)} cy={y(p.value)} r={i === pts.length - 1 ? 4.5 : 3} fill={i === pts.length - 1 ? "var(--color-terracotta-deep)" : "var(--color-olive)"} />))}
      </svg>
      <figcaption className="mt-1 flex justify-between text-xs text-text-secondary">
        <span>{fmtDate(pts[0].recordedOn)}</span>{target && <span>Target: {target}</span>}<span>{fmtDate(pts.at(-1)!.recordedOn)}</span>
      </figcaption>
    </figure>
  );
}
