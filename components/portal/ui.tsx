import Link from "next/link";
import clsx from "clsx";
import type { ReactNode } from "react";
import { STAGES } from "@/lib/portal/format";
import type { MethodStage } from "@/lib/portal/types";

export function PageTitle({ eyebrow, title, lead, action }: { eyebrow?: string; title: string; lead?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        {eyebrow && <p className="text-label text-secondary">{eyebrow}</p>}
        <h1 className="text-h1 mt-2">{title}</h1>
        {lead && <p className="mt-3 max-w-2xl text-text-secondary">{lead}</p>}
      </div>
      {action}
    </div>
  );
}

export function Panel({ title, action, children, className }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={clsx("rounded-[20px] border border-border bg-white p-6", className)}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-4">
          {title && <h2 className="text-h4">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="text-sm font-semibold text-primary underline decoration-border-strong underline-offset-4 hover:decoration-primary">{children}</Link>;
}

export function Badge({ tone = "neutral", children }: { tone?: "neutral" | "success" | "warning" | "brand" | "accent"; children: ReactNode }) {
  const tones = { neutral: "bg-sand text-text-primary", success: "bg-[#E4EBDD] text-success", warning: "bg-[#F6EBD9] text-text-primary", brand: "bg-olive text-white", accent: "bg-accent-soft text-secondary-hover" };
  return <span className={clsx("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", tones[tone])}>{children}</span>;
}

export function ProgressBar({ value, label }: { value: number; label: string }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm"><span className="text-text-secondary">{label}</span><span className="font-semibold">{pct}%</span></div>
      <div className="h-2 rounded-full bg-sand" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <div className="h-2 rounded-full bg-sage transition-[width] duration-300" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/** Where the client is in the TAB Method journey (Step 14). */
export function StageTracker({ stage }: { stage: MethodStage }) {
  const idx = STAGES.findIndex((s) => s.key === stage);
  return (
    <ol className="grid grid-cols-5 gap-2" aria-label="Your TAB Method stage">
      {STAGES.map((s, i) => (
        <li key={s.key} aria-current={i === idx ? "step" : undefined}>
          <div className={clsx("h-1.5 rounded-full", i <= idx ? "bg-olive" : "bg-sand")} />
          <p className={clsx("mt-2 text-xs leading-tight", i === idx ? "font-semibold text-text-primary" : "text-text-secondary")}>{s.label}</p>
        </li>
      ))}
    </ol>
  );
}

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="rounded-[20px] border border-dashed border-border-strong bg-white/60 p-8 text-center">
      <p className="font-semibold">{title}</p>
      {body && <p className="mt-1 text-sm text-text-secondary">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
