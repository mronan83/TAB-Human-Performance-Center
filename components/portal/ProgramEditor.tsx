"use client";

import { useActionState, useEffect, useState } from "react";
import { saveProgramDraftAction, programActionAction } from "@/app/(portal)/actions";
import type { Activity, ProgramAction, ProgramTemplate } from "@/lib/portal/types";
import { LIMITS, activityKinds, prescriptionKeys } from "@/lib/portal/programs";
import { services } from "@/content/services";

/**
 * Program editor (C7, design §3.1): details plus weeks and activities, edited in the browser and saved as one draft.
 * The whole draft travels as JSON in `content`; the server parses it (lib/portal/program-editor.ts) and the database
 * saves it in one transaction (save_program_draft).
 */
type RxRow = { key: string; value: string };
type ActivityRow = { key: string; id?: string; kind: Activity["kind"]; title: string; instructions: string; rx: RxRow[] };
type WeekRow = { key: string; id?: string; week: number; title: string; body: string; activities: ActivityRow[] };

let seq = 0;
const k = (p: string) => `${p}-${++seq}`;

function fromTemplate(t?: ProgramTemplate): WeekRow[] {
  if (!t) return [{ key: k("w"), week: 1, title: "Week 1", body: "", activities: [] }];
  return t.modules.map((m) => ({
    key: m.id, id: m.id, week: m.week, title: m.title, body: m.body ?? "",
    activities: m.activities.map((a) => ({
      key: a.id, id: a.id, kind: a.kind, title: a.title, instructions: a.instructions ?? "",
      rx: Object.entries(a.prescription ?? {}).map(([key, value]) => ({ key, value: String(value) })),
    })),
  }));
}

const serialize = (weeks: WeekRow[]) => JSON.stringify(weeks.map((w) => ({
  id: w.id, week: w.week, title: w.title, body: w.body,
  activities: w.activities.map((a) => ({ id: a.id, kind: a.kind, title: a.title, instructions: a.instructions, prescription: Object.fromEntries(a.rx.filter((r) => r.value.trim()).map((r) => [r.key, r.value])) })),
})));

const move = <T,>(list: T[], i: number, by: number) => { const j = i + by; if (j < 0 || j >= list.length) return list; const c = [...list]; [c[i], c[j]] = [c[j], c[i]]; return c; };

export function ProgramEditor({ program }: { program?: ProgramTemplate }) {
  const [state, action, pending] = useActionState(saveProgramDraftAction.bind(null, program?.id ?? null), null);
  const [weeks, setWeeks] = useState<WeekRow[]>(() => fromTemplate(program));
  const [focusId, setFocusId] = useState<string | null>(null);
  useEffect(() => { if (focusId) document.getElementById(focusId)?.focus(); }, [focusId]);

  const setWeek = (wi: number, patch: Partial<WeekRow>) => setWeeks((ws) => ws.map((w, i) => (i === wi ? { ...w, ...patch } : w)));
  const setActivity = (wi: number, ai: number, patch: Partial<ActivityRow>) =>
    setWeeks((ws) => ws.map((w, i) => (i === wi ? { ...w, activities: w.activities.map((a, j) => (j === ai ? { ...a, ...patch } : a)) } : w)));
  const addWeek = () => {
    const next = Math.min((weeks.at(-1)?.week ?? 0) + 1, LIMITS.weeks);
    const key = k("w");
    setWeeks((ws) => [...ws, { key, week: next, title: `Week ${next}`, body: "", activities: [] }]);
    setFocusId(`${key}-title`);
  };
  const addActivity = (wi: number) => {
    const key = k("a");
    setWeeks((ws) => ws.map((w, i) => (i === wi ? { ...w, activities: [...w.activities, { key, kind: "exercise", title: "", instructions: "", rx: [] }] } : w)));
    setFocusId(`${key}-title`);
  };

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="content" value={serialize(weeks)} />
      <div className="grid gap-4 md:grid-cols-[2fr_1fr] [&>div]:min-w-0">
        <div><label htmlFor="program-title" className="field-label">Program title</label><input id="program-title" name="title" required maxLength={LIMITS.title} defaultValue={program?.title} className="field-input" /></div>
        <div><label htmlFor="program-service" className="field-label">Service</label>
          <select id="program-service" name="service" defaultValue={program?.service ?? services[0].slug} className="field-input">
            {services.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
          </select></div>
      </div>
      <div>
        <label htmlFor="program-summary" className="field-label">Summary</label>
        <p id="hint-summary" className="-mt-1 mb-2 text-sm text-text-secondary">Shown to clients. Describe what they&rsquo;ll do, not outcomes; no diagnosis or treatment claims.</p>
        <textarea id="program-summary" name="summary" maxLength={LIMITS.summary} defaultValue={program?.summary} className="field-input" aria-describedby="hint-summary" />
      </div>

      {weeks.map((w, wi) => {
        const ctx = `week section ${wi + 1}`;
        return (
          <fieldset key={w.key} className="space-y-4 rounded-xl border border-border p-4">
            <legend className="px-1 font-semibold">Week {w.week}: {w.title || "untitled"}</legend>
            <div className="grid gap-4 md:grid-cols-[8rem_1fr] [&>div]:min-w-0">
              <div><label htmlFor={`${w.key}-week`} className="field-label">Week<span className="sr-only"> ({ctx})</span></label>
                <input id={`${w.key}-week`} type="number" min={1} max={LIMITS.weeks} value={w.week} onChange={(e) => setWeek(wi, { week: Number(e.target.value) || 1 })} className="field-input" /></div>
              <div><label htmlFor={`${w.key}-title`} className="field-label">Title<span className="sr-only"> ({ctx})</span></label>
                <input id={`${w.key}-title`} maxLength={LIMITS.title} value={w.title} onChange={(e) => setWeek(wi, { title: e.target.value })} className="field-input" /></div>
            </div>
            <div><label htmlFor={`${w.key}-body`} className="field-label">Introduction<span className="sr-only"> ({ctx})</span></label>
              <textarea id={`${w.key}-body`} maxLength={LIMITS.body} value={w.body} onChange={(e) => setWeek(wi, { body: e.target.value })} className="field-input" /></div>

            {w.activities.map((a, ai) => {
              const actx = `${ctx}, activity ${ai + 1}`;
              const free = prescriptionKeys.filter((key) => !a.rx.some((r) => r.key === key));
              return (
                <div key={a.key} className="space-y-3 rounded-xl bg-bone p-4">
                  <div className="grid gap-3 md:grid-cols-[10rem_1fr] [&>div]:min-w-0">
                    <div><label htmlFor={`${a.key}-kind`} className="field-label">Type<span className="sr-only"> ({actx})</span></label>
                      <select id={`${a.key}-kind`} value={a.kind} onChange={(e) => setActivity(wi, ai, { kind: e.target.value as Activity["kind"] })} className="field-input">
                        {activityKinds.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}
                      </select></div>
                    <div><label htmlFor={`${a.key}-title`} className="field-label">Activity<span className="sr-only"> ({actx})</span></label>
                      <input id={`${a.key}-title`} maxLength={LIMITS.title} value={a.title} onChange={(e) => setActivity(wi, ai, { title: e.target.value })} className="field-input" /></div>
                  </div>
                  <div><label htmlFor={`${a.key}-instructions`} className="field-label">Instructions<span className="sr-only"> ({actx})</span></label>
                    <textarea id={`${a.key}-instructions`} maxLength={LIMITS.instructions} value={a.instructions} onChange={(e) => setActivity(wi, ai, { instructions: e.target.value })} className="field-input" /></div>
                  {a.rx.map((r, ri) => (
                    <div key={r.key} className="grid items-end gap-3 md:grid-cols-[10rem_1fr_auto] [&>div]:min-w-0">
                      <div><label htmlFor={`${a.key}-rx-${ri}-key`} className="field-label">Prescription<span className="sr-only"> ({actx}, field {ri + 1})</span></label>
                        <select id={`${a.key}-rx-${ri}-key`} value={r.key} onChange={(e) => setActivity(wi, ai, { rx: a.rx.map((x, i) => (i === ri ? { ...x, key: e.target.value } : x)) })} className="field-input">
                          {[r.key, ...free].map((key) => <option key={key} value={key}>{key}</option>)}
                        </select></div>
                      <div><label htmlFor={`${a.key}-rx-${ri}-value`} className="field-label">Value<span className="sr-only"> ({actx}, {r.key})</span></label>
                        <input id={`${a.key}-rx-${ri}-value`} maxLength={LIMITS.rxValue} value={r.value} onChange={(e) => setActivity(wi, ai, { rx: a.rx.map((x, i) => (i === ri ? { ...x, value: e.target.value } : x)) })} className="field-input" /></div>
                      <button type="button" className="btn btn-outline btn-sm" aria-label={`Remove ${r.key} (${actx})`} onClick={() => setActivity(wi, ai, { rx: a.rx.filter((_, i) => i !== ri) })}>Remove</button>
                    </div>
                  ))}
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="btn btn-outline btn-sm" disabled={!free.length} onClick={() => setActivity(wi, ai, { rx: [...a.rx, { key: free[0], value: "" }] })}>Add prescription<span className="sr-only"> ({actx})</span></button>
                    <button type="button" className="btn btn-outline btn-sm" disabled={ai === 0} onClick={() => setWeek(wi, { activities: move(w.activities, ai, -1) })}>Move up<span className="sr-only"> ({actx})</span></button>
                    <button type="button" className="btn btn-outline btn-sm" disabled={ai === w.activities.length - 1} onClick={() => setWeek(wi, { activities: move(w.activities, ai, 1) })}>Move down<span className="sr-only"> ({actx})</span></button>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => { setWeek(wi, { activities: w.activities.filter((_, j) => j !== ai) }); setFocusId(`${w.key}-add`); }}>Remove activity<span className="sr-only"> ({actx})</span></button>
                  </div>
                </div>
              );
            })}
            <div className="flex flex-wrap gap-2">
              <button id={`${w.key}-add`} type="button" className="btn btn-outline btn-sm" disabled={w.activities.length >= LIMITS.activities} onClick={() => addActivity(wi)}>Add activity<span className="sr-only"> ({ctx})</span></button>
              <button type="button" className="btn btn-outline btn-sm" disabled={wi === 0} onClick={() => setWeeks((ws) => move(ws, wi, -1))}>Move week up<span className="sr-only"> ({ctx})</span></button>
              <button type="button" className="btn btn-outline btn-sm" disabled={wi === weeks.length - 1} onClick={() => setWeeks((ws) => move(ws, wi, 1))}>Move week down<span className="sr-only"> ({ctx})</span></button>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => { setWeeks((ws) => ws.filter((_, i) => i !== wi)); setFocusId("add-week"); }}>Remove week<span className="sr-only"> ({ctx})</span></button>
            </div>
          </fieldset>
        );
      })}
      <div className="flex flex-wrap items-center gap-3">
        <button id="add-week" type="button" className="btn btn-outline" disabled={weeks.length >= LIMITS.modules} onClick={addWeek}>Add week</button>
        <p className="text-sm text-text-secondary">Weeks are shown to clients in week order; the program runs to its last week.</p>
      </div>
      <button className="btn btn-primary" disabled={pending}>{pending ? "Saving…" : program ? "Save draft" : "Create draft"}</button>
      {state && !state.ok && <p role="alert" className="text-sm font-semibold text-danger">{state.error}</p>}
    </form>
  );
}

const ACTION_LABEL: Record<ProgramAction, string> = { submit: "Submit for review", publish: "Publish", retire: "Retire program", new_version: "Edit as a new version", discard: "Discard draft" };

/** One life-cycle button (submit, publish, retire, new version, discard). */
export function ProgramActionButton({ programId, action, primary, confirmText }: { programId: string; action: ProgramAction; primary?: boolean; confirmText?: string }) {
  const [state, run, pending] = useActionState(programActionAction.bind(null, programId), null);
  return (
    <form action={run} onSubmit={(e) => { if (confirmText && !window.confirm(confirmText)) e.preventDefault(); }}>
      <input type="hidden" name="action" value={action} />
      <button className={primary ? "btn btn-primary btn-sm" : "btn btn-outline btn-sm"} disabled={pending}>{ACTION_LABEL[action]}</button>
      {state && !state.ok && <p role="alert" className="mt-2 text-sm font-semibold text-danger">{state.error}</p>}
    </form>
  );
}
