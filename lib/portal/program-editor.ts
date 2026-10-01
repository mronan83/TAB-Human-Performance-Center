/**
 * Program editor (C7, design §3.1): the shape and limits of a draft as the editor sends it. The editor posts the
 * whole draft as JSON in a `content` field; this is the only parser for it, so a crafted form can't exceed the limits.
 */
import { z } from "zod";
import { services } from "@/content/services";
import { LIMITS, activityKinds, prescriptionKeys } from "./programs";
import type { Activity, ProgramDraftInput } from "./types";

const text = (max: number) => z.string().trim().max(max);
const optional = (max: number) => text(max).optional().transform((v) => v || undefined);
const id = z.string().max(64).optional().transform((v) => v || undefined);

const activity = z.object({
  id,
  kind: z.enum(activityKinds.map((k) => k.value) as [Activity["kind"], ...Activity["kind"][]]),
  title: text(LIMITS.title).min(1, "Every activity needs a name."),
  instructions: optional(LIMITS.instructions),
  prescription: z.record(z.enum(prescriptionKeys), text(LIMITS.rxValue)).default({})
    .transform((rx) => Object.fromEntries(Object.entries(rx).filter(([, v]) => v))),
});

const moduleSchema = z.object({
  id,
  week: z.coerce.number().int().min(1).max(LIMITS.weeks),
  title: text(LIMITS.title).min(1, "Every week needs a title."),
  body: optional(LIMITS.body),
  activities: z.array(activity).max(LIMITS.activities, `A week can hold up to ${LIMITS.activities} activities.`),
});

const content = z.array(moduleSchema).max(LIMITS.modules, `A program can hold up to ${LIMITS.modules} weeks.`);
const serviceSlugs = services.map((s) => s.slug) as [ProgramDraftInput["service"], ...ProgramDraftInput["service"][]];

/** Parses the editor's form. Program length is the last week that has content. */
export function parseProgramDraft(fd: FormData): { ok: true; draft: Omit<ProgramDraftInput, "id"> } | { ok: false; error: string } {
  let raw: unknown;
  try { raw = JSON.parse(String(fd.get("content") ?? "[]")); } catch { return { ok: false, error: "The program content couldn't be read. Reload and try again." }; }
  const r = z.object({
    title: text(LIMITS.title).min(1, "Give the program a title."),
    summary: optional(LIMITS.summary),
    service: z.enum(serviceSlugs, { errorMap: () => ({ message: "Choose a service." }) }),
    modules: content,
  }).safeParse({ title: fd.get("title") ?? "", summary: fd.get("summary") ?? "", service: fd.get("service"), modules: raw });
  if (!r.success) return { ok: false, error: r.error.issues[0]?.message ?? "Check the program and try again." };
  const modules = [...r.data.modules].sort((a, b) => a.week - b.week);
  return { ok: true, draft: { ...r.data, modules, durationWeeks: modules.length ? modules[modules.length - 1].week : undefined } };
}
