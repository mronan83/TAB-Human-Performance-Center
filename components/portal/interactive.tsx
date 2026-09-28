"use client";

import { useActionState, useOptimistic, useState, useTransition } from "react";
import clsx from "clsx";
import { toggleActivityAction, saveCheckInAction, submitFormAction, setConsentAction, updateContactAction, addNoteAction, sendMagicLinkAction } from "@/app/(portal)/actions";
import type { Consent, FormField, FormTemplate } from "@/lib/portal/types";
import { services } from "@/content/services";

export function ActivityCheck({ programId, activityId, title, detail, done }: { programId: string; activityId: string; title: string; detail?: string; done: boolean }) {
  const [optimistic, setOptimistic] = useOptimistic(done);
  const [, start] = useTransition();
  return (
    <label className={clsx("flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors", optimistic ? "border-sage bg-[#F1F3EA]" : "border-border bg-white hover:border-primary")}>
      <input type="checkbox" checked={optimistic} className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-olive)]"
        onChange={(e) => { const v = e.target.checked; start(async () => { setOptimistic(v); await toggleActivityAction(programId, activityId, v); }); }} />
      <span>
        <span className={clsx("block font-semibold", optimistic && "text-text-secondary line-through decoration-sage")}>{title}</span>
        {detail && <span className="mt-0.5 block text-sm text-text-secondary">{detail}</span>}
      </span>
    </label>
  );
}

function Scale({ name, label, low, high, defaultValue }: { name: string; label: string; low: string; high: string; defaultValue?: number }) {
  return (
    <fieldset>
      <legend className="field-label">{label}</legend>
      <div className="mt-1 flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className="flex-1">
            <input type="radio" name={name} value={n} defaultChecked={defaultValue === n} className="peer sr-only" />
            <span className="flex h-12 items-center justify-center rounded-xl border border-border font-semibold peer-checked:border-olive peer-checked:bg-olive peer-checked:text-white peer-focus-visible:outline peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--color-focus)]">{n}</span>
          </label>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-xs text-text-secondary"><span>{low}</span><span>{high}</span></div>
    </fieldset>
  );
}

export function CheckInForm({ weekOf, existing }: { weekOf: string; existing?: { energy?: number; sleepQuality?: number; stress?: number; wins?: string; challenges?: string; supportNeeded?: string } }) {
  const [state, action, pending] = useActionState(saveCheckInAction, null);
  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="weekOf" value={weekOf} />
      <div className="grid gap-6 md:grid-cols-3">
        <Scale name="energy" label="Energy" low="Low" high="High" defaultValue={existing?.energy} />
        <Scale name="sleepQuality" label="Sleep quality" low="Poor" high="Great" defaultValue={existing?.sleepQuality} />
        <Scale name="stress" label="Stress" low="Low" high="High" defaultValue={existing?.stress} />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div><label htmlFor="wins" className="field-label">A win this week</label><textarea id="wins" name="wins" className="field-input" defaultValue={existing?.wins} /></div>
        <div><label htmlFor="challenges" className="field-label">What got in the way?</label><textarea id="challenges" name="challenges" className="field-input" defaultValue={existing?.challenges} /></div>
      </div>
      <div><label htmlFor="supportNeeded" className="field-label">Anything you’d like help with? (optional)</label><input id="supportNeeded" name="supportNeeded" className="field-input" defaultValue={existing?.supportNeeded} /></div>
      <div className="flex items-center gap-4">
        <button className="btn btn-primary" disabled={pending}>{pending ? "Saving…" : existing ? "Update check-in" : "Save check-in"}</button>
        {state?.ok && <p role="status" className="font-semibold text-success">Saved. Thank you for checking in.</p>}
      </div>
    </form>
  );
}

function FieldInput({ f, value, onChange }: { f: FormField; value: unknown; onChange: (v: unknown) => void }) {
  if (f.type === "text" || f.type === "textarea") return f.type === "textarea" ? <textarea id={f.id} className="field-input" value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} required={f.required} /> : <input id={f.id} className="field-input" value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} required={f.required} />;
  if (f.type === "scale")
    return (
      <div className="flex gap-2" role="radiogroup" aria-labelledby={`${f.id}-label`}>
        {Array.from({ length: f.max - f.min + 1 }, (_, i) => f.min + i).map((n) => (
          <button type="button" key={n} role="radio" aria-checked={value === n} onClick={() => onChange(n)}
            className={clsx("h-12 flex-1 rounded-xl border font-semibold", value === n ? "border-olive bg-olive text-white" : "border-border bg-white")}>{n}</button>
        ))}
      </div>
    );
  const multi = f.type === "multi";
  const arr = (value as string[]) ?? [];
  return (
    <div className="flex flex-wrap gap-2">
      {f.options.map((o) => {
        const on = multi ? arr.includes(o) : value === o;
        return (
          <button type="button" key={o} aria-pressed={on} onClick={() => onChange(multi ? (on ? arr.filter((x) => x !== o) : [...arr, o]) : o)}
            className={clsx("rounded-full border px-4 py-2 font-medium", on ? "border-olive bg-olive text-white" : "border-border bg-white")}>{o}</button>
        );
      })}
    </div>
  );
}

/** Renders any form template from its JSON schema (form_templates.schema). */
export function DynamicForm({ template, initial, readOnly }: { template: FormTemplate; initial?: Record<string, unknown>; readOnly?: boolean }) {
  const [answers, setAnswers] = useState<Record<string, unknown>>(initial ?? {});
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "submitted" | "error">("idle");
  const [missing, setMissing] = useState<string[]>([]);
  const save = async (final: boolean) => {
    if (final) {
      const req = template.sections.flatMap((s) => s.fields).filter((f) => f.required && (answers[f.id] == null || answers[f.id] === ""));
      setMissing(req.map((f) => f.id));
      if (req.length) { setStatus("error"); return; }
    }
    setStatus("saving");
    await submitFormAction(template.slug, answers, final);
    setStatus(final ? "submitted" : "saved");
  };
  if (status === "submitted") return <div role="status" className="rounded-[20px] bg-[#E4EBDD] p-6 font-semibold text-success">Submitted. Thank you—we’ll review this before your next session.</div>;
  return (
    <form noValidate onSubmit={(e) => { e.preventDefault(); save(true); }} className="space-y-10">
      {template.sensitivity === "sensitive" && <p className="rounded-xl bg-accent-soft p-4 text-sm">This form collects confidential health information. Only you and your practitioner can see it.</p>}
      {template.sections.map((s) => (
        <fieldset key={s.title} disabled={readOnly} className="space-y-6">
          <legend className="text-h4 mb-2">{s.title}</legend>
          {s.fields.map((f) => (
            <div key={f.id}>
              <label id={`${f.id}-label`} htmlFor={f.id} className="field-label">{f.label}{f.required && <span className="text-danger"> *</span>}</label>
              {f.type === "scale" && (f.minLabel || f.maxLabel) && <p className="field-hint mb-2">{f.min} = {f.minLabel}, {f.max} = {f.maxLabel}</p>}
              <FieldInput f={f} value={answers[f.id]} onChange={(v) => setAnswers((a) => ({ ...a, [f.id]: v }))} />
              {missing.includes(f.id) && <p className="mt-1 text-sm font-medium text-danger">This question is required.</p>}
            </div>
          ))}
        </fieldset>
      ))}
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-3">
          <button className="btn btn-primary" disabled={status === "saving"}>Submit</button>
          <button type="button" className="btn btn-outline" onClick={() => save(false)} disabled={status === "saving"}>Save and finish later</button>
          {status === "saved" && <p role="status" className="font-semibold text-success">Progress saved.</p>}
          {status === "error" && <p role="alert" className="font-semibold text-danger">Please answer the required questions.</p>}
        </div>
      )}
    </form>
  );
}

export function ConsentToggle({ consent }: { consent: Consent }) {
  const [on, setOn] = useOptimistic(consent.granted);
  const [, start] = useTransition();
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div>
        <p className="font-medium">{consent.label}</p>
        <p className="text-sm text-text-secondary">{consent.required ? "Required to use My TAB" : on ? "On" : "Off"}</p>
      </div>
      <button type="button" role="switch" aria-checked={on} aria-label={consent.label} disabled={consent.required}
        onClick={() => start(async () => { setOn(!on); await setConsentAction(consent.type, !on); })}
        className={clsx("relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-60", on ? "bg-olive" : "bg-border-strong")}>
        <span className={clsx("absolute top-1 h-5 w-5 rounded-full bg-white transition-transform", on ? "translate-x-6" : "translate-x-1")} />
      </button>
    </div>
  );
}

export function ContactForm({ preferredName, phone }: { preferredName?: string; phone?: string }) {
  const [state, action, pending] = useActionState(updateContactAction, null);
  return (
    <form action={action} className="grid gap-5 md:grid-cols-2">
      <div><label htmlFor="preferredName" className="field-label">Preferred name</label><input id="preferredName" name="preferredName" className="field-input" defaultValue={preferredName} autoComplete="nickname" /></div>
      <div><label htmlFor="phone" className="field-label">Phone</label><input id="phone" name="phone" type="tel" className="field-input" defaultValue={phone} autoComplete="tel" /></div>
      <div className="flex items-center gap-4 md:col-span-2">
        <button className="btn btn-primary btn-sm" disabled={pending}>{pending ? "Saving…" : "Save changes"}</button>
        {state?.ok && <p role="status" className="text-sm font-semibold text-success">Saved.</p>}
      </div>
    </form>
  );
}

export function NoteForm({ clientId }: { clientId: string }) {
  const [state, action, pending] = useActionState(addNoteAction.bind(null, clientId), null);
  return (
    <form action={action} className="space-y-4">
      <div><label htmlFor="body" className="field-label">New note</label><textarea id="body" name="body" className="field-input" placeholder="What happened, what changed, what’s next…" /></div>
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label htmlFor="service" className="field-label">Service</label>
          <select id="service" name="service" className="field-input"><option value="">General</option>{services.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}</select>
        </div>
        <fieldset className="flex gap-2">
          <legend className="field-label">Visibility</legend>
          <label className="flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm"><input type="radio" name="visibility" value="internal" defaultChecked className="accent-[var(--color-olive)]" /> Internal only</label>
          <label className="flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm"><input type="radio" name="visibility" value="shared" className="accent-[var(--color-olive)]" /> Share with client</label>
        </fieldset>
        <button className="btn btn-primary btn-sm" disabled={pending}>{pending ? "Saving…" : "Add note"}</button>
      </div>
      {state && !state.ok && <p role="alert" className="text-sm font-semibold text-danger">{state.error}</p>}
      {state?.ok && <p role="status" className="text-sm font-semibold text-success">Note added.</p>}
    </form>
  );
}

export function LoginForm() {
  const [state, action, pending] = useActionState(sendMagicLinkAction, null);
  if (state?.ok) return <p role="status" className="rounded-[20px] bg-[#E4EBDD] p-5 font-medium text-success">If that email belongs to a TAB client, a sign-in link is on its way. It expires in one hour.</p>;
  return (
    <form action={action} className="space-y-4">
      <div><label htmlFor="email" className="field-label">Email</label><input id="email" name="email" type="email" className="field-input" autoComplete="email" required /></div>
      {state?.error && <p role="alert" className="text-sm font-semibold text-danger">{state.error}</p>}
      <button className="btn btn-primary w-full" disabled={pending}>{pending ? "Sending…" : "Email me a sign-in link"}</button>
    </form>
  );
}
