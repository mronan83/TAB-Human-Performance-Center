/**
 * Assigned programs (C4c, docs/design/plans-programs-stages.md §2.4): what a client sees is the published template
 * with their practitioner's personalization applied. Shared by both repositories, the actions and the pages.
 */
import { planTypes } from "./plan-types";
import type { ClientProgram, Module, Personalization, Plan, ProgramTemplate } from "./types";

export const programStatuses = [
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
] as const satisfies readonly { value: ClientProgram["status"]; label: string }[];

export const MAX_NOTE = 500;
export const MAX_PROGRAM_NOTE = 1000;
export const MAX_RX_VALUE = 40;

/** Week of the program today (1-based), capped at its length. */
export function currentWeekFor(startedAt: string, durationWeeks?: number) {
  const weeks = Math.floor((Date.now() - new Date(startedAt).getTime()) / (7 * 86400000)) + 1;
  return Math.max(1, durationWeeks ? Math.min(weeks, durationWeeks) : weeks);
}

/** The modules as this client sees them: skipped activities removed, prescriptions and notes applied. */
export function personalizedModules(p: Pick<ClientProgram, "template" | "personalization">): Module[] {
  const adj = p.personalization.activities ?? {};
  return p.template.modules.map((m) => ({
    ...m,
    activities: m.activities.filter((a) => !adj[a.id]?.skip).map((a) => {
      const x = adj[a.id];
      if (!x) return a;
      const rx = x.prescription && Object.keys(x.prescription).length ? x.prescription : undefined;
      return { ...a, prescription: rx ? { ...a.prescription, ...rx } : a.prescription, personalNote: x.note, adjusted: !!rx };
    }),
  }));
}

/** Share of the client's (personalized) activities completed, 0–1. */
export function programProgress(p: ClientProgram) {
  const ids = personalizedModules(p).flatMap((m) => m.activities.map((a) => a.id));
  const done = new Set(p.completedActivityIds);
  return ids.length ? ids.filter((id) => done.has(id)).length / ids.length : 0;
}

/** Whether the client may tick this activity off: it is in the program and not skipped for them. */
export const isActivityInProgram = (p: Pick<ClientProgram, "template" | "personalization">, activityId: string) =>
  personalizedModules(p).some((m) => m.activities.some((a) => a.id === activityId));

/**
 * Reads the personalization fields of the assignment form. Only activities in the template and prescription keys
 * the template already has are kept, so a crafted form can't add content; an unchanged value is not an override.
 * Fields: `programNote`, `skip:<activity>`, `note:<activity>`, `rx:<activity>:<key>`.
 */
export function readPersonalization(template: ProgramTemplate, get: (name: string) => string | null): Personalization {
  const txt = (name: string, max: number) => (get(name) ?? "").trim().slice(0, max);
  const activities: NonNullable<Personalization["activities"]> = {};
  for (const a of template.modules.flatMap((m) => m.activities)) {
    const skip = get(`skip:${a.id}`) === "on";
    const note = txt(`note:${a.id}`, MAX_NOTE);
    const prescription: Record<string, string> = {};
    for (const [key, base] of Object.entries(a.prescription ?? {})) {
      const v = txt(`rx:${a.id}:${key}`, MAX_RX_VALUE);
      if (v && v !== String(base)) prescription[key] = v;
    }
    const hasRx = Object.keys(prescription).length > 0;
    if (skip || note || hasRx) activities[a.id] = { ...(skip && { skip }), ...(note && { note }), ...(hasRx && { prescription }) };
  }
  const note = txt("programNote", MAX_PROGRAM_NOTE);
  return { ...(note && { note }), ...(Object.keys(activities).length && { activities }) };
}

/** The client's plans a program can support, labelled by type (an archived plan only when it is already linked). */
export const planOptions = (plans: Plan[], keep?: string) =>
  plans.filter((p) => p.status !== "archived" || p.id === keep).map((p) => ({ id: p.id, label: `${planTypes[p.planType].short}: ${p.title}` }));
