import { method } from "@/content/pages";

/** Start Where You Are → Transform → Align → Become → Evolve (D-029). */
export function MethodSteps({ compact = false }: { compact?: boolean }) {
  const steps = compact ? method.steps.slice(0, 4) : method.steps;
  return (
    <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" style={compact ? undefined : { gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
      {steps.map((s, i) => (
        <li key={s.key} className="relative rounded-[20px] border border-border bg-white p-6">
          <span className="text-label text-secondary">{i === 0 ? "Begin" : s.key === "evolve" ? "Then" : `Step ${i}`}</span>
          <h3 className="mt-2 font-[family-name:var(--font-display)] text-[1.75rem] font-medium leading-tight">{s.name}</h3>
          <p className="mt-2 font-semibold">{s.short}</p>
          {!compact && <p className="mt-3 text-text-secondary">{s.body}</p>}
        </li>
      ))}
    </ol>
  );
}
