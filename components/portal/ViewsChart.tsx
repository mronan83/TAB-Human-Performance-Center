"use client";

import { useState } from "react";
import { fmtDate } from "@/lib/portal/format";

/**
 * Daily page views as thin bars (one series, so the title names it and there is no legend). Bars are Deep Olive with
 * 4px rounded tops on the baseline and a 2px gap; the y-axis is a few recessive gridlines. Hovering or focusing a bar
 * shows its day and count; the same numbers are in the table below for keyboard and screen-reader use.
 */
export function ViewsChart({ days }: { days: { day: string; views: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 720, H = 220, top = 12, bottom = 28, left = 36;
  const max = Math.max(4, ...days.map((d) => d.views));
  const step = Math.pow(10, Math.floor(Math.log10(max)));
  const tick = [1, 2, 5, 10].map((m) => m * step).find((t) => max / t <= 4) ?? step * 10;
  const ceiling = Math.ceil(max / tick) * tick;
  const slot = (W - left) / days.length;
  const bar = Math.max(2, slot - 2);
  const y = (v: number) => top + (H - top - bottom) * (1 - v / ceiling);
  const ticks = Array.from({ length: Math.round(ceiling / tick) + 1 }, (_, i) => i * tick);
  const shown = hover === null ? null : days[hover];
  return (
    <figure className="m-0">
      <p className="mb-2 h-5 text-sm text-text-secondary" aria-live="polite">
        {shown ? <><span className="font-semibold text-text-primary">{shown.views.toLocaleString()}</span> page views on {fmtDate(shown.day, { weekday: "short", month: "short", day: "numeric" })}</> : "Hover over a day to see its count."}
      </p>
      <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[560px]" role="img" aria-label="Page views per day for the last 30 days" onMouseLeave={() => setHover(null)}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={left} x2={W} y1={y(t)} y2={y(t)} stroke="var(--color-border)" strokeWidth={1} />
            <text x={left - 6} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--color-text-secondary)">{t}</text>
          </g>
        ))}
        {days.map((d, i) => {
          const x = left + i * slot + 1, h = H - bottom - y(d.views), active = hover === i;
          return (
            <g key={d.day} onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} tabIndex={-1}>
              <rect x={left + i * slot} y={top} width={slot} height={H - top - bottom} fill="transparent" />
              {d.views > 0 && <path d={roundedTop(x, y(d.views), bar, h)} fill="var(--color-olive)" opacity={hover === null || active ? 1 : 0.45} />}
              {(i === 0 || i === days.length - 1 || (i % 7 === 0 && days.length - 1 - i > 3)) && (
                <text x={i === days.length - 1 ? x + bar : i === 0 ? x : x + bar / 2} y={H - 8} textAnchor={i === days.length - 1 ? "end" : i === 0 ? "start" : "middle"} fontSize="11" fill="var(--color-text-secondary)">{fmtDate(d.day)}</text>
              )}
            </g>
          );
        })}
      </svg>
      </div>
      <details className="mt-3 text-sm">
        <summary className="cursor-pointer text-text-secondary">Show as a table</summary>
        <table className="mt-3 w-full max-w-sm text-left">
          <thead><tr><th className="py-1 font-semibold">Day</th><th className="py-1 text-right font-semibold">Page views</th></tr></thead>
          <tbody>{days.map((d) => <tr key={d.day} className="border-t border-border"><td className="py-1">{fmtDate(d.day, { weekday: "short", month: "short", day: "numeric" })}</td><td className="py-1 text-right tabular-nums">{d.views.toLocaleString()}</td></tr>)}</tbody>
        </table>
      </details>
    </figure>
  );
}

/** A bar anchored to the baseline with a 4px (or smaller, for short bars) rounded top. */
function roundedTop(x: number, y: number, w: number, h: number) {
  const r = Math.min(4, w / 2, h);
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
}
