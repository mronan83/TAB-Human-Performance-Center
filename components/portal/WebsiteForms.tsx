"use client";

import { useActionState, useState } from "react";
import clsx from "clsx";
import { addWebsiteRequestNoteAction, createWebsiteRequestAction, inviteAdminAction, removeAdminAction, setWebsiteRequestStatusAction } from "@/app/(portal)/actions";
import { CONTENT_KINDS, DESIGN_KINDS, LANES, LIMITS, PAGE_OPTIONS, PRIORITIES, STATUSES, type Lane, type RequestStatus } from "@/lib/website-requests";

const Alert = ({ text }: { text?: string }) => (text ? <p role="alert" className="mt-3 text-sm font-semibold text-danger">{text}</p> : null);

/**
 * The website request form (proposed D-071): every answer but the description is a choice, so a request arrives
 * complete. The lane decides which kinds of change are offered.
 */
export function WebsiteRequestForm({ initialLane }: { initialLane: Lane }) {
  const [state, action, pending] = useActionState(createWebsiteRequestAction, undefined);
  const [lane, setLane] = useState<Lane>(initialLane);
  const kinds = lane === "content" ? CONTENT_KINDS : DESIGN_KINDS;
  return (
    <form action={action} className="space-y-8">
      <fieldset>
        <legend className="field-label">What kind of request?</legend>
        <div className="mt-2 grid gap-3 md:grid-cols-2">
          {LANES.map((l) => (
            <label key={l.value} className={clsx("flex cursor-pointer gap-3 rounded-xl border p-4", lane === l.value ? "border-olive bg-note-soft" : "border-border-input bg-white")}>
              <input type="radio" name="lane" value={l.value} checked={lane === l.value} onChange={() => setLane(l.value)} className="mt-1 h-4 w-4 accent-[var(--color-olive)]" />
              <span><span className="block font-semibold">{l.label}</span><span className="mt-0.5 block text-sm text-text-secondary">{l.hint}</span></span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="field-label">Which pages?</legend>
        <p className="text-sm text-text-secondary">Choose every page it affects.</p>
        <div className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
          {PAGE_OPTIONS.map((p) => (
            <label key={p} className="flex items-start gap-2 text-[0.9375rem]">
              <input type="checkbox" name="pages" value={p} className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-olive)]" />{p}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="kind" className="field-label">What kind of change?</label>
          <select id="kind" name="kind" className="field-input" required defaultValue="" key={lane}>
            <option value="" disabled>Choose one</option>
            {kinds.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="title" className="field-label">Short title</label>
          <input id="title" name="title" className="field-input" required minLength={3} maxLength={LIMITS.title} placeholder={lane === "content" ? "Update Saturday hours" : "Compare coaching options side by side"} />
        </div>
      </div>

      <div>
        <label htmlFor="details" className="field-label">{lane === "content" ? "The change" : "What do you want to achieve, and what’s wrong or missing today?"}</label>
        <p id="details-help" className="mb-2 text-sm text-text-secondary">
          {lane === "content"
            ? "Where on the page (the section’s heading helps), what it says now, and what it should say. Paste the new wording if you have it."
            : "Describe the outcome for visitors or clients. Claude will reply with options, effort and any trade-offs before anything is built."}
        </p>
        <textarea id="details" name="details" aria-describedby="details-help details-privacy" className="field-input min-h-40" required maxLength={LIMITS.details} />
        <p id="details-privacy" className="mt-2 text-sm text-text-secondary">Never include a client’s name or health details. Requests are about the website only.</p>
      </div>

      <div>
        <label htmlFor="reason" className="field-label">Why (optional)</label>
        <textarea id="reason" name="reason" className="field-input" maxLength={LIMITS.reason} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="priority" className="field-label">How soon?</label>
          <select id="priority" name="priority" className="field-input" defaultValue="whenever">
            {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="deadline" className="field-label">Deadline (optional)</label>
          <input id="deadline" name="deadline" type="date" className="field-input" />
        </div>
      </div>

      <div>
        <button className="btn btn-primary" disabled={pending}>{pending ? "Sending…" : "Send request"}</button>
        <Alert text={state?.error} />
      </div>
    </form>
  );
}

/** A reply on a request: answers to Claude's questions, a choice between options, or more detail. */
export function RequestNoteForm({ requestId, number }: { requestId: string; number: number }) {
  const [state, action, pending] = useActionState(addWebsiteRequestNoteAction.bind(null, requestId, number), null);
  return (
    <form action={action} key={state?.ok ? Date.now() : "note"}>
      <label htmlFor="body" className="field-label">Add a note</label>
      <textarea id="body" name="body" className="field-input" maxLength={LIMITS.note} required aria-describedby="note-help" />
      <p id="note-help" className="mt-2 text-sm text-text-secondary">Answer a question, choose an option or add detail. No client names or health details.</p>
      <button className="btn btn-primary btn-sm mt-3" disabled={pending}>Add note</button>
      {state?.ok && <p role="status" className="mt-2 text-sm font-semibold text-success">Added.</p>}
      <Alert text={state && !state.ok ? state.error : undefined} />
    </form>
  );
}

/** The owner's control: approve, decline or reopen a request. */
export function RequestStatusForm({ requestId, number, status }: { requestId: string; number: number; status: RequestStatus }) {
  const [state, action, pending] = useActionState(setWebsiteRequestStatusAction.bind(null, requestId, number), null);
  return (
    <form action={action} className="space-y-3">
      <div>
        <label htmlFor="status" className="field-label">Status</label>
        <select id="status" name="status" className="field-input" defaultValue={status}>
          {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>
      <button className="btn btn-outline btn-sm" disabled={pending}>Update status</button>
      {state?.ok && <p role="status" className="text-sm font-semibold text-success">Updated.</p>}
      {state && !state.ok && <p role="alert" className="text-sm font-semibold text-danger">{state.error}</p>}
    </form>
  );
}

type Msg = { ok: boolean; message: string } | null;

export function InviteAdminForm() {
  const [state, action, pending] = useActionState(inviteAdminAction, null as Msg);
  return (
    <form action={action} className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
      <div><label htmlFor="admin-name" className="field-label">Name</label><input id="admin-name" name="name" className="field-input" required maxLength={80} autoComplete="off" /></div>
      <div><label htmlFor="admin-email" className="field-label">Work email</label><input id="admin-email" name="email" type="email" className="field-input" required maxLength={254} autoComplete="off" /></div>
      <button className="btn btn-primary" disabled={pending}>{pending ? "Inviting…" : "Invite admin"}</button>
      {state && <p role={state.ok ? "status" : "alert"} className={clsx("text-sm font-semibold md:col-span-3", state.ok ? "text-success" : "text-danger")}>{state.message}</p>}
    </form>
  );
}

export function RemoveAdminButton({ id, name }: { id: string; name: string }) {
  const [state, action, pending] = useActionState(removeAdminAction.bind(null, id), null as Msg);
  return (
    <form action={action} onSubmit={(e) => { if (!window.confirm(`Remove ${name} as an admin? They lose access to TAB Practice straight away.`)) e.preventDefault(); }}>
      <button className="btn btn-outline btn-sm" disabled={pending}>Remove<span className="sr-only"> {name}</span></button>
      {state && !state.ok && <p role="alert" className="mt-1 text-sm font-semibold text-danger">{state.message}</p>}
    </form>
  );
}
