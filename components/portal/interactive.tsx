"use client";

import { useActionState, useEffect, useOptimistic, useState, useTransition } from "react";
import clsx from "clsx";
import { toggleActivityAction, saveCheckInAction, submitFormAction, setConsentAction, updateContactAction, addNoteAction, sendMagicLinkAction, recordProgressReviewAction, savePlanAction, addPlanEntryAction } from "@/app/(portal)/actions";
import type { Consent, FormField, FormTemplate, MethodStage, Plan, PlanType } from "@/lib/portal/types";
import { planTypes } from "@/lib/portal/plan-types";
import { STAGES } from "@/lib/portal/format";
import { circumstanceOptions, reviewOutcomes } from "@/lib/portal/review";
import { services } from "@/content/services";
import { siteConfig } from "@/config/site";
import { useTurnstile } from "@/components/Turnstile";

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
            <span className="flex h-12 items-center justify-center rounded-xl border border-border-input font-semibold peer-checked:border-olive peer-checked:bg-olive peer-checked:text-white peer-focus-visible:outline peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--color-focus)]">{n}</span>
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
            className={clsx("h-12 flex-1 rounded-xl border font-semibold", value === n ? "border-olive bg-olive text-white" : "border-border-input bg-white")}>{n}</button>
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
            className={clsx("rounded-full border px-4 py-2 font-medium", on ? "border-olive bg-olive text-white" : "border-border-input bg-white")}>{o}</button>
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
        className={clsx("relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-60", on ? "bg-olive" : "bg-border-input")}>
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

/** Progress Review (Step 14 §14.4.5). The stage changes only when the practitioner picks a new one and confirms the conversation. */
export function ProgressReviewForm({ clientId, clientName, currentStage }: { clientId: string; clientName: string; currentStage: MethodStage }) {
  const [state, action, pending] = useActionState(recordProgressReviewAction.bind(null, clientId), null);
  const [stage, setStage] = useState<MethodStage>(currentStage);
  const [share, setShare] = useState(true);
  const changing = stage !== currentStage;
  const label = (k: MethodStage) => STAGES.find((s) => s.key === k)?.label ?? k;
  return (
    <form action={action} className="space-y-6">
      <div><label htmlFor="changed" className="field-label">What has changed? What feels better or easier?</label><textarea id="changed" name="changed" className="field-input" /></div>
      <div><label htmlFor="difficult" className="field-label">What remains difficult?</label><textarea id="difficult" name="difficult" className="field-input" /></div>
      <div><label htmlFor="learned" className="field-label">What have you learned about your body, habits, priorities, or needs?</label><textarea id="learned" name="learned" className="field-input" /></div>
      <fieldset>
        <legend className="field-label">Has anything changed?</legend>
        <div className="flex flex-wrap gap-2">
          {circumstanceOptions.map((c) => (
            <label key={c} className="flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm"><input type="checkbox" name="circumstances" value={c} className="accent-[var(--color-olive)]" /> {c}</label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="field-label">Does the current approach still fit?</legend>
        <div className="flex flex-wrap gap-2">
          {reviewOutcomes.map((o) => (
            <label key={o.value} className="flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm"><input type="radio" name="outcome" value={o.value} required className="accent-[var(--color-olive)]" /> {o.label}</label>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor="stage" className="field-label">TAB Method stage</label>
        <select id="stage" name="stage" className="field-input" value={stage} onChange={(e) => setStage(e.target.value as MethodStage)}>
          {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}{s.key === currentStage ? " (current)" : ""}</option>)}
        </select>
        {changing && (
          <div className="mt-3 rounded-xl border border-border-strong bg-cream p-4">
            <p className="text-sm">This moves {clientName} from <strong>{label(currentStage)}</strong> to <strong>{label(stage)}</strong>. They&rsquo;ll see it on their My TAB dashboard and get an email that their stage has been updated.</p>
            <label className="mt-3 flex items-start gap-2 text-sm font-semibold"><input type="checkbox" name="discussed" required className="mt-0.5 h-4 w-4 accent-[var(--color-olive)]" /> I&rsquo;ve discussed this stage change with {clientName}.</label>
          </div>
        )}
      </div>
      <div><label htmlFor="summary" className="field-label">Summary for {clientName}</label><textarea id="summary" name="summary" className="field-input" placeholder="What you noticed together, in words they'll recognise." /></div>
      <div><label htmlFor="nextSteps" className="field-label">Next steps</label><textarea id="nextSteps" name="nextSteps" className="field-input" /></div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="share" checked={share} onChange={(e) => setShare(e.target.checked)} className="h-4 w-4 accent-[var(--color-olive)]" /> Share the summary and next steps with {clientName} in My TAB</label>
      <div className="flex flex-wrap items-center gap-4">
        <button className="btn btn-primary" disabled={pending}>{pending ? "Saving…" : changing ? "Save review and update stage" : "Save review"}</button>
      </div>
      {state && !state.ok && <p role="alert" className="text-sm font-semibold text-danger">{state.error}</p>}
    </form>
  );
}

/** Plan editor (design §2.4). Wellness Plans carry focus and goals; service plans carry their type's sections. */
export function PlanForm({ clientId, planType, plan }: { clientId: string; planType: PlanType; plan?: Plan }) {
  const [state, action, pending] = useActionState(savePlanAction.bind(null, clientId, plan?.id ?? null, planType), null);
  const def = planTypes[planType];
  const shared = def.sections.filter((s) => !s.private), priv = def.sections.filter((s) => s.private);
  const goals = [...(plan?.goals ?? []), ...Array.from({ length: 3 }, () => undefined)].slice(0, 12);
  const section = (sec: (typeof def.sections)[number], value?: string) => (
    <div key={sec.key}>
      <label htmlFor={`section-${sec.key}`} className="field-label">{sec.label}</label>
      {sec.hint && <p id={`hint-${sec.key}`} className="-mt-1 mb-2 text-sm text-text-secondary">{sec.hint}</p>}
      <textarea id={`section-${sec.key}`} name={`section:${sec.key}`} defaultValue={value} className="field-input" aria-describedby={sec.hint ? `hint-${sec.key}` : undefined} />
    </div>
  );
  return (
    <form action={action} className="space-y-6">
      <div><label htmlFor="title" className="field-label">Title</label><input id="title" name="title" required defaultValue={plan?.title} className="field-input" /></div>
      {planType === "wellness" && (
        <div><label htmlFor="focus" className="field-label">Focus</label><textarea id="focus" name="focus" defaultValue={plan?.focus} className="field-input" placeholder="What this season of work is about, in their words." /></div>
      )}
      {planType === "wellness" && (
        <fieldset className="space-y-4">
          <legend className="field-label">Goals</legend>
          {goals.map((g, i) => (
            <div key={g?.id ?? `new-${i}`} className="grid gap-3 rounded-xl border border-border p-4 md:grid-cols-2">
              <input type="hidden" name={`goal.${i}.id`} value={g?.id ?? ""} />
              <div className="md:col-span-2"><label htmlFor={`goal-${i}-title`} className="field-label">Goal {i + 1}</label><input id={`goal-${i}-title`} name={`goal.${i}.title`} defaultValue={g?.title} className="field-input" /></div>
              <div><label htmlFor={`goal-${i}-why`} className="field-label">Why it matters</label><input id={`goal-${i}-why`} name={`goal.${i}.why`} defaultValue={g?.whyItMatters} className="field-input" /></div>
              <div><label htmlFor={`goal-${i}-measure`} className="field-label">How we&rsquo;ll know</label><input id={`goal-${i}-measure`} name={`goal.${i}.measure`} defaultValue={g?.measure} className="field-input" /></div>
              <div><label htmlFor={`goal-${i}-target`} className="field-label">Target</label><input id={`goal-${i}-target`} name={`goal.${i}.target`} defaultValue={g?.target} className="field-input" /></div>
              <div><label htmlFor={`goal-${i}-status`} className="field-label">Status</label>
                <select id={`goal-${i}-status`} name={`goal.${i}.status`} defaultValue={g?.status ?? "active"} className="field-input">
                  <option value="active">Active</option><option value="achieved">Achieved</option><option value="paused">Paused</option><option value="dropped">Dropped</option>
                </select></div>
            </div>
          ))}
          <p className="text-sm text-text-secondary">Leave a goal&rsquo;s title empty to remove it. Save to get more empty rows.</p>
        </fieldset>
      )}
      {shared.map((sec) => section(sec, plan?.details[sec.key]))}
      {priv.length > 0 && (
        <fieldset className="space-y-4 rounded-xl border border-border-strong bg-cream p-4">
          <legend className="px-1 font-semibold">Practitioner-only</legend>
          <p className="text-sm text-text-secondary">Never shown to the client.</p>
          {priv.map((sec) => section(sec, plan?.privateDetails?.[sec.key]))}
        </fieldset>
      )}
      <div className="grid gap-4 md:grid-cols-3">
        <div><label htmlFor="status" className="field-label">Status</label>
          <select id="status" name="status" defaultValue={plan?.status ?? "draft"} className="field-input">
            <option value="draft">Draft</option><option value="active">Active</option><option value="completed">Completed</option><option value="archived">Archived</option>
          </select></div>
        <div><label htmlFor="startDate" className="field-label">Start date</label><input id="startDate" name="startDate" type="date" defaultValue={plan?.startDate} className="field-input" /></div>
        <div><label htmlFor="reviewDate" className="field-label">Next review</label><input id="reviewDate" name="reviewDate" type="date" defaultValue={plan?.reviewDate} className="field-input" /></div>
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="visible" defaultChecked={plan?.visibleToClient ?? false} className="h-4 w-4 accent-[var(--color-olive)]" /> Share this plan with the client in My TAB (practitioner-only sections stay private)</label>
      <button className="btn btn-primary" disabled={pending}>{pending ? "Saving…" : plan ? "Save plan" : "Create plan"}</button>
      {state && !state.ok && <p role="alert" className="text-sm font-semibold text-danger">{state.error}</p>}
    </form>
  );
}

export function PlanEntryForm({ clientId, planId }: { clientId: string; planId: string }) {
  const [state, action, pending] = useActionState(addPlanEntryAction.bind(null, clientId, planId), null);
  return (
    <form action={action} className="space-y-4">
      <div><label htmlFor="entry-body" className="field-label">New log entry</label><textarea id="entry-body" name="body" className="field-input" placeholder="What you did, how they responded, what changes next time." /></div>
      <div className="flex flex-wrap items-end gap-4">
        <div><label htmlFor="entry-date" className="field-label">Date</label><input id="entry-date" name="date" type="date" className="field-input" /></div>
        <fieldset className="flex gap-2">
          <legend className="field-label">Visibility</legend>
          <label className="flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm"><input type="radio" name="visibility" value="internal" defaultChecked className="accent-[var(--color-olive)]" /> Internal only</label>
          <label className="flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm"><input type="radio" name="visibility" value="shared" className="accent-[var(--color-olive)]" /> Share with client</label>
        </fieldset>
        <button className="btn btn-primary btn-sm" disabled={pending}>{pending ? "Saving…" : "Add entry"}</button>
      </div>
      {state && !state.ok && <p role="alert" className="text-sm font-semibold text-danger">{state.error}</p>}
      {state?.ok && <p role="status" className="text-sm font-semibold text-success">Entry added.</p>}
    </form>
  );
}

/** My TAB sign-in: honeypot and Turnstile like the public forms (SEC-013); limits are enforced in sendMagicLinkAction. */
export function LoginForm() {
  const [state, action, pending] = useActionState(sendMagicLinkAction, null);
  const turnstile = useTurnstile("login");
  const [waitMessage, setWaitMessage] = useState("");
  const { reset } = turnstile;
  useEffect(() => { if (state) reset(); }, [state, reset]); // tokens are single-use
  if (state?.ok) return <p role="status" className="rounded-[20px] bg-[#E4EBDD] p-5 font-medium text-success">If that email belongs to a TAB client, a sign-in link is on its way. It expires in one hour.</p>;
  const error = waitMessage || state?.error;
  return (
    <form
      action={action}
      className="space-y-4"
      onSubmit={(e) => {
        if (!turnstile.enabled || turnstile.token) return setWaitMessage("");
        e.preventDefault();
        setWaitMessage(turnstile.blocked
          ? `Our spam check couldn’t load (a browser extension may be blocking it). Please email ${siteConfig.contact.email} and we’ll help you sign in.`
          : "Just a moment: we’re checking this is a real browser. Please try again in a few seconds.");
      }}
    >
      <div><label htmlFor="email" className="field-label">Email</label><input id="email" name="email" type="email" className="field-input" autoComplete="email" required /></div>
      {/* Honeypot: off-screen, hidden from assistive technology and skipped by keyboard. */}
      <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
        <label htmlFor="website">Leave this field empty</label>
        <input id="website" type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <input type="hidden" name="turnstileToken" value={turnstile.token} />
      {turnstile.widget}
      {error && <p role="alert" className="text-sm font-semibold text-danger">{error}</p>}
      <button className="btn btn-primary w-full" disabled={pending}>{pending ? "Sending…" : "Email me a sign-in link"}</button>
    </form>
  );
}
