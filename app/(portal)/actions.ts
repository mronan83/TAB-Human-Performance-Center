"use server";

import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireClient, requireStaff, isMock } from "@/lib/portal";
import { siteUrl } from "@/config/site";
import type { Consent, GoalInput, InviteResult, MethodStage, Plan, PlanType, ProgramAction, ReviewOutcome } from "@/lib/portal/types";
import { isSafeResourceHref, resourceKinds } from "@/lib/portal/resources";
import { parseClientActivities, parseProgramDraft } from "@/lib/portal/program-editor";
import { MAX_PLAN_GOALS, canUsePlanType, planTypes, splitSections } from "@/lib/portal/plan-types";
import { STAGES } from "@/lib/portal/format";
import { newerVersions, programStatuses, readPersonalization } from "@/lib/portal/programs";
import { circumstanceOptions, reviewOutcomes } from "@/lib/portal/review";
import { sendStageUpdatedEmail } from "@/lib/email";
import type { ServiceSlug } from "@/content/services";
import { routingOptions, type RoutingOutcome } from "@/lib/inquiry";
import { limiter, verifyHuman } from "@/lib/spam";

export async function toggleActivityAction(programId: string, activityId: string, done: boolean) {
  const { clientId, repo } = await requireClient();
  await repo.toggleActivity(clientId, programId, activityId, done);
  revalidatePath("/my-tab", "layout");
}

export async function saveCheckInAction(_prev: unknown, fd: FormData) {
  const { clientId, repo } = await requireClient();
  const num = (k: string) => { const v = Number(fd.get(k)); return Number.isFinite(v) && v > 0 ? v : undefined; };
  const str = (k: string) => (String(fd.get(k) ?? "").trim() || undefined);
  await repo.saveCheckIn(clientId, { weekOf: String(fd.get("weekOf")), energy: num("energy"), sleepQuality: num("sleepQuality"), stress: num("stress"), wins: str("wins"), challenges: str("challenges"), supportNeeded: str("supportNeeded") });
  revalidatePath("/my-tab", "layout");
  return { ok: true };
}

export async function submitFormAction(slug: string, answers: Record<string, unknown>, final: boolean) {
  const { clientId, repo } = await requireClient();
  await repo.submitForm(clientId, slug, answers, final);
  revalidatePath("/my-tab", "layout");
  return { ok: true };
}

export async function setConsentAction(type: Consent["type"], granted: boolean) {
  const { clientId, repo } = await requireClient();
  await repo.setConsent(clientId, type, granted);
  revalidatePath("/my-tab/profile");
}

export async function updateContactAction(_prev: unknown, fd: FormData) {
  const { clientId, repo } = await requireClient();
  await repo.updateContact(clientId, { preferredName: String(fd.get("preferredName") ?? "").trim(), phone: String(fd.get("phone") ?? "").trim() });
  revalidatePath("/my-tab", "layout");
  return { ok: true };
}

export async function addNoteAction(clientId: string, _prev: unknown, fd: FormData) {
  const { viewer, repo } = await requireStaff();
  const body = String(fd.get("body") ?? "").trim();
  if (!body) return { ok: false, error: "Write a note first." };
  await repo.addNote(clientId, viewer, { body, visibility: fd.get("visibility") === "shared" ? "shared" : "internal", service: (fd.get("service") || undefined) as ServiceSlug | undefined });
  revalidatePath(`/practice/clients/${clientId}`);
  return { ok: true };
}

/**
 * Progress Review (Step 14 §14.4.5). A stage change is the practitioner's decision, agreed with the client, so it needs
 * the "discussed with the client" confirmation. When the stage changes the client is emailed (design §5.2).
 */
export async function recordProgressReviewAction(clientId: string, _prev: unknown, fd: FormData) {
  const { viewer, repo } = await requireStaff();
  const client = await repo.getClient(clientId);
  if (!client) return { ok: false, error: "Client not found." };
  const text = (k: string, max = 4000) => String(fd.get(k) ?? "").trim().slice(0, max) || undefined;
  const outcome = reviewOutcomes.find((o) => o.value === fd.get("outcome"))?.value as ReviewOutcome | undefined;
  if (!outcome) return { ok: false, error: "Choose whether the current approach still fits." };
  const stage = STAGES.find((s) => s.key === fd.get("stage"))?.key as MethodStage | undefined;
  const newStage = stage && stage !== client.methodStage ? stage : undefined;
  if (newStage && fd.get("discussed") !== "on") return { ok: false, error: "Confirm you've discussed the stage change with the client." };
  const share = fd.get("share") === "on";
  const summaryForClient = text("summary");
  if (share && !summaryForClient) return { ok: false, error: "Write a summary for the client, or don't share this review." };
  const circumstances = fd.getAll("circumstances").map(String).filter((c) => (circumstanceOptions as readonly string[]).includes(c));
  const { stageChanged } = await repo.recordProgressReview(clientId, viewer, {
    outcome, share, newStage, summaryForClient, nextSteps: text("nextSteps"),
    reflections: { changed: text("changed"), difficult: text("difficult"), learned: text("learned"), circumstances },
  });
  const email = stageChanged ? await sendStageUpdatedEmail(client.email, client.preferredName ?? client.fullName, { demo: isMock() }) : undefined;
  revalidatePath(`/practice/clients/${clientId}`);
  revalidatePath("/my-tab", "layout");
  redirect(`/practice/clients/${clientId}?review=saved${stageChanged ? `&email=${email}` : ""}`);
}

const PLAN_STATUSES: Plan["status"][] = ["draft", "active", "completed", "archived"];
const isoDate = (v: FormDataEntryValue | null) => (/^\d{4}-\d{2}-\d{2}$/.test(String(v ?? "")) ? String(v) : undefined);

/**
 * Creates or updates a plan (design §2.4). Sections are kept to the type's schema; practitioner-only sections go to
 * plan_private_details. Nutrition plans need the nutrition credential (the database enforces the same).
 */
export async function savePlanAction(clientId: string, planId: string | null, planType: PlanType, _prev: unknown, fd: FormData) {
  const { viewer, repo } = await requireStaff();
  if (!(planType in planTypes)) return { ok: false, error: "Unknown plan type." };
  if (!canUsePlanType(planType, viewer.capabilities)) return { ok: false, error: `${planTypes[planType].label}s need the matching credential on your practitioner profile.` };
  const existing = planId ? (await repo.listPlans(clientId, { staff: true })).find((p) => p.id === planId) : undefined;
  if (planId && !existing) return { ok: false, error: "Plan not found." };
  const title = String(fd.get("title") ?? "").trim().slice(0, 200);
  if (!title) return { ok: false, error: "Give the plan a title." };
  const status = PLAN_STATUSES.find((s) => s === fd.get("status")) ?? "draft";
  const sections: Record<string, string> = {};
  for (const [k, v] of fd.entries()) if (k.startsWith("section:")) sections[k.slice(8)] = String(v);
  const { shared, priv } = splitSections(planType, sections);
  let goals: GoalInput[] | undefined;
  if (planType === "wellness") {
    const knownIds = new Set(existing?.goals.map((g) => g.id));
    const txt = (k: string, i: number) => String(fd.get(`goal.${i}.${k}`) ?? "").trim().slice(0, 500) || undefined;
    goals = [];
    for (let i = 0; i < MAX_PLAN_GOALS; i++) {
      const t = txt("title", i);
      if (!t) continue;
      const id = String(fd.get(`goal.${i}.id`) ?? "");
      goals.push({ id: knownIds.has(id) ? id : undefined, title: t, whyItMatters: txt("why", i), measure: txt("measure", i), target: txt("target", i),
        status: (["active", "achieved", "paused", "dropped"] as const).find((s) => s === fd.get(`goal.${i}.status`)) ?? "active" });
    }
  }
  let id: string;
  try {
    id = await repo.savePlan(clientId, viewer, {
      id: planId ?? undefined, planType, title, status, focus: String(fd.get("focus") ?? "").trim().slice(0, 2000) || undefined,
      visibleToClient: fd.get("visible") === "on", startDate: isoDate(fd.get("startDate")), reviewDate: isoDate(fd.get("reviewDate")),
      details: shared, privateDetails: priv, goals,
    });
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "The plan couldn't be saved." };
  }
  revalidatePath(`/practice/clients/${clientId}`);
  revalidatePath("/my-tab", "layout");
  redirect(`/practice/clients/${clientId}/plans/${id}?saved=1`);
}

/**
 * Assigns a published program to a client, or updates an assignment (design §2.4 step 3). Personalization is read
 * against the program's own activities and prescription keys only (lib/portal/programs.ts).
 */
export async function saveClientProgramAction(clientId: string, templateId: string, programId: string | null, _prev: unknown, fd: FormData) {
  const { viewer, repo } = await requireStaff();
  const existing = programId ? await repo.getClientProgram(clientId, programId) : null;
  if (programId && (!existing || existing.template.id !== templateId)) return { ok: false, error: "Program not found." };
  const template = existing?.template ?? (await repo.listProgramTemplates()).find((t) => t.id === templateId);
  if (!template) return { ok: false, error: "Program not found." };
  if (!existing && template.status !== "published") return { ok: false, error: "Only published programs can be assigned." };
  const planId = String(fd.get("planId") ?? "") || undefined;
  if (planId && !(await repo.listPlans(clientId, { staff: true })).some((p) => p.id === planId)) return { ok: false, error: "Choose one of this client’s plans." };
  const status = programStatuses.find((s) => s.value === fd.get("status"))?.value ?? "active";
  const personalization = readPersonalization(template, (name) => { const v = fd.get(name); return v === null ? null : String(v); });
  const custom = parseClientActivities(fd);
  if (!custom.ok) return custom;
  let id: string;
  try {
    id = await repo.saveClientProgram(clientId, viewer, {
      id: programId ?? undefined, templateId, startedAt: isoDate(fd.get("startedAt")) ?? new Date().toISOString().slice(0, 10), status, planId, personalization,
      customActivities: custom.items,
    });
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "The program couldn't be saved." };
  }
  revalidatePath(`/practice/clients/${clientId}`);
  revalidatePath("/my-tab", "layout");
  redirect(`/practice/clients/${clientId}/programs/${id}?saved=1`);
}

const INVITE_MESSAGE: Record<InviteResult, string> = {
  sent: "Invitation sent. They'll get an email with a link to set up My TAB.",
  has_account: "They already have a My TAB login. Ask them to sign in at My TAB with their email address.",
  already_active: "They're already using My TAB.",
  skipped: "Marked as invited. No email was sent (demo mode, or email isn't set up yet).",
  failed: "Marked as invited, but the email couldn't be sent. Try again, or let them know directly.",
};

/** Invites the client to My TAB (C4). Only their care team can (RLS on clients); the database stamps who and when. */
export async function inviteClientAction(clientId: string, _prev: unknown, _fd: FormData) {
  const { viewer, repo } = await requireStaff();
  let result: InviteResult;
  try {
    result = await repo.inviteClient(clientId, viewer);
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "The invitation couldn't be sent." };
  }
  revalidatePath(`/practice/clients/${clientId}`);
  return { ok: result !== "failed", message: INVITE_MESSAGE[result] };
}

/** Assigns a published form, optionally with a due date (C4). */
export async function assignFormAction(clientId: string, _prev: unknown, fd: FormData) {
  const { viewer, repo } = await requireStaff();
  const templateId = String(fd.get("templateId") ?? "");
  if (!(await repo.listFormTemplates()).some((t) => t.id === templateId)) return { ok: false, message: "Choose a form." };
  const pending = (await repo.listForms(clientId)).some((f) => f.template.id === templateId && (f.status === "not_started" || f.status === "draft"));
  if (pending) return { ok: false, message: "That form is already waiting for this client." };
  try {
    await repo.assignForm(clientId, viewer, { templateId, dueOn: isoDate(fd.get("dueOn")) });
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "The form couldn't be assigned." };
  }
  revalidatePath(`/practice/clients/${clientId}`);
  revalidatePath("/my-tab", "layout");
  return { ok: true, message: "Form assigned. It's waiting in their My TAB." };
}

export async function withdrawFormAction(clientId: string, assignmentId: string, _prev: unknown, _fd: FormData) {
  const { repo } = await requireStaff();
  try {
    await repo.withdrawForm(clientId, assignmentId);
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "The form couldn't be withdrawn." };
  }
  revalidatePath(`/practice/clients/${clientId}`);
  revalidatePath("/my-tab", "layout");
  return { ok: true, message: "Withdrawn." };
}

/** Shares a resource: a page on this site or an https link, with an optional note (C4). */
export async function assignResourceAction(clientId: string, _prev: unknown, fd: FormData) {
  const { viewer, repo } = await requireStaff();
  const txt = (k: string, max: number) => String(fd.get(k) ?? "").trim().slice(0, max);
  const title = txt("title", 160);
  const href = txt("href", 500) || "/resources";
  if (!title) return { ok: false, message: "Give the resource a title." };
  if (!isSafeResourceHref(href)) return { ok: false, message: "Use a page on this site (starting with /) or a link starting with https://." };
  const kind = resourceKinds.find((k) => k === fd.get("kind"));
  try {
    await repo.assignResource(clientId, viewer, { title, href, kind, note: txt("note", 500) || undefined });
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "The resource couldn't be shared." };
  }
  revalidatePath(`/practice/clients/${clientId}`);
  revalidatePath("/my-tab", "layout");
  return { ok: true, message: "Shared. It's in their My TAB resources." };
}

/** The client opened a resource someone shared with them (shown to the practitioner as viewed). */
export async function markResourceViewedAction(assignmentId: string) {
  const { clientId, repo } = await requireClient();
  await repo.markResourceViewed(clientId, assignmentId);
  revalidatePath("/my-tab", "layout");
}

export async function removeResourceAction(clientId: string, assignmentId: string, _prev: unknown, _fd: FormData) {
  const { repo } = await requireStaff();
  try {
    await repo.removeResource(clientId, assignmentId);
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "The resource couldn't be removed." };
  }
  revalidatePath(`/practice/clients/${clientId}`);
  revalidatePath("/my-tab", "layout");
  return { ok: true, message: "Removed." };
}

/** Moves a client's program to a newer published version of the same program (C7b, design §3.1 Versioning). */
export async function moveClientProgramAction(clientId: string, programId: string, targetId: string, _prev: unknown, _fd: FormData) {
  const { viewer, repo } = await requireStaff();
  const program = await repo.getClientProgram(clientId, programId);
  if (!program) return { ok: false, error: "Program not found." };
  if (!newerVersions(program, await repo.listProgramTemplates()).some((t) => t.id === targetId)) return { ok: false, error: "That isn't a newer published version of this program." };
  let carried: number;
  try {
    carried = await repo.moveClientProgram(clientId, programId, viewer, targetId);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "The program couldn't be moved." };
  }
  revalidatePath(`/practice/clients/${clientId}`, "layout");
  revalidatePath("/my-tab", "layout");
  redirect(`/practice/clients/${clientId}/programs/${programId}?moved=${carried}`);
}

/** Team (C7b): the owner grants the publishing permission and credentials that unlock gated plan types. */
export async function updatePractitionerAction(practitionerId: string, _prev: unknown, fd: FormData) {
  const { viewer, repo } = await requireStaff();
  if (viewer.role !== "owner") return { ok: false, error: "Only the owner can change this." };
  const current = (await repo.listPractitioners()).find((p) => p.id === practitionerId);
  if (!current) return { ok: false, error: "Practitioner not found." };
  const others = current.capabilities.filter((c) => c !== "nutrition");
  try {
    await repo.updatePractitioner(practitionerId, { canPublish: fd.get("canPublish") === "on", capabilities: fd.get("nutrition") === "on" ? [...others, "nutrition"] : others });
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "That couldn't be saved." };
  }
  revalidatePath("/practice/team");
  return { ok: true };
}

/** Program editor (C7, design §3.1): creates a draft program or saves a draft version. Any practitioner may edit drafts. */
export async function saveProgramDraftAction(programId: string | null, _prev: unknown, fd: FormData) {
  const { viewer, repo } = await requireStaff();
  const parsed = parseProgramDraft(fd);
  if (!parsed.ok) return parsed;
  if (programId) {
    const t = await repo.getProgramTemplate(programId);
    if (!t) return { ok: false, error: "Program not found." };
    if (t.status !== "draft") return { ok: false, error: "Published programs can't be edited; start a new version." };
  }
  let id: string;
  try {
    id = await repo.saveProgramDraft(viewer, { ...parsed.draft, id: programId ?? undefined });
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "The program couldn't be saved." };
  }
  revalidatePath("/practice/programs");
  redirect(`/practice/programs/${id}?done=saved`);
}

const PROGRAM_ACTIONS: ProgramAction[] = ["submit", "publish", "retire", "new_version", "discard"];

/** Submit for review, publish, retire, start a new version or discard a draft. Publishing and retiring need the permission. */
export async function programActionAction(programId: string, _prev: unknown, fd: FormData) {
  const { viewer, repo } = await requireStaff();
  const action = PROGRAM_ACTIONS.find((a) => a === fd.get("action"));
  if (!action) return { ok: false, error: "Unknown action." };
  if ((action === "publish" || action === "retire") && !(viewer.role === "owner" || viewer.canPublish)) {
    return { ok: false, error: "Publishing needs the publishing permission. Submit the draft for review instead." };
  }
  let next: string | null;
  try {
    next = await repo.runProgramAction(viewer, programId, action);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "That didn't work. Try again." };
  }
  revalidatePath("/practice/programs", "layout");
  revalidatePath("/practice/clients", "layout");
  redirect(next ? `/practice/programs/${next}?done=${action}` : "/practice/programs?done=discard");
}

/** Adds a dated entry to a plan's log. Shared entries appear in the client's My TAB when the plan is visible. */
export async function addPlanEntryAction(clientId: string, planId: string, _prev: unknown, fd: FormData) {
  const { viewer, repo } = await requireStaff();
  const body = String(fd.get("body") ?? "").trim().slice(0, 4000);
  if (!body) return { ok: false, error: "Write the entry first." };
  try {
    await repo.addPlanEntry(clientId, planId, viewer, { body, visibility: fd.get("visibility") === "shared" ? "shared" : "internal", date: isoDate(fd.get("date")) });
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "The entry couldn't be saved." };
  }
  revalidatePath(`/practice/clients/${clientId}/plans/${planId}`);
  revalidatePath("/my-tab", "layout");
  return { ok: true };
}

/** Start and contact submissions: only the owner records the next step and links client records (RLS enforces the same). */
async function requireOwner() {
  const staff = await requireStaff();
  if (staff.viewer.role !== "owner") throw new Error("Only the owner can manage submissions.");
  return staff;
}
const revalidateInquiry = (id: string) => { revalidatePath("/practice/inquiries"); revalidatePath(`/practice/inquiries/${id}`); };

export async function routeInquiryAction(id: string, fd: FormData) {
  const { repo } = await requireOwner();
  const raw = String(fd.get("outcome") ?? "");
  const outcome = routingOptions.some((o) => o.value === raw) ? (raw as RoutingOutcome) : null;
  const note = String(fd.get("note") ?? "").trim().slice(0, 2000) || undefined;
  await repo.routeInquiry(id, outcome, note);
  revalidateInquiry(id);
}

export async function linkInquiryAction(id: string, clientId: string) {
  const { repo } = await requireOwner();
  await repo.linkInquiries(id, clientId);
  revalidateInquiry(id);
  revalidatePath("/practice");
}

export async function createClientFromInquiryAction(id: string) {
  const { repo } = await requireOwner();
  await repo.createClientFromInquiry(id);
  revalidateInquiry(id);
  revalidatePath("/practice");
}

/** Demo only: switch between the client and practitioner views. */
export async function setDemoRoleAction(role: "client" | "owner") {
  if (!isMock()) return;
  (await cookies()).set("tab_demo_role", role, { path: "/", sameSite: "lax" });
  redirect(role === "owner" ? "/practice" : "/my-tab");
}

/**
 * The sign-in form sends email, so it gets the public-form defenses (SEC-013), cheapest first: honeypot, per-IP limit,
 * Turnstile, then a per-address limit. The address limit comes after the human check so a bot can't use up a real
 * client's sign-in allowance. Limits are per server instance, like the inquiry API's. None of the answers reveal
 * whether an address belongs to a client.
 */
const signInPerIp = limiter(5, 10 * 60_000);
const signInPerEmail = limiter(3, 60 * 60_000);

/** Passwordless sign-in (email link). Staff MFA enforcement is part of the portal security gate (SEC-015). */
export async function sendMagicLinkAction(_prev: unknown, fd: FormData) {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  if (email.length > 254 || !/^\S+@\S+\.\S+$/.test(email)) return { ok: false, error: "Enter a valid email address." };
  if (String(fd.get("website") ?? "")) return { ok: true }; // honeypot: the usual answer, nothing sent
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const tooMany = { ok: false, error: "Too many sign-in requests. Please wait a few minutes, then try again." };
  if (signInPerIp(ip)) return tooMany;
  const token = String(fd.get("turnstileToken") ?? "") || undefined;
  const human = await verifyHuman(token, { ip, action: "login", host: h.get("x-forwarded-host") ?? h.get("host") });
  if (human === "fail") return { ok: false, error: "We couldn’t confirm this is a real browser. Please try again." };
  if (signInPerEmail(email)) return tooMany;
  const { createSupabaseServerClient } = await import("@/lib/supabase/server");
  const sb = await createSupabaseServerClient();
  const { error } = await sb.auth.signInWithOtp({ email, options: { shouldCreateUser: false, emailRedirectTo: `${siteUrl}/my-tab/auth/callback` } });
  // Same response whether or not the account exists, to avoid revealing who is a client.
  if (error && !/not found|signups not allowed/i.test(error.message)) console.error("[auth]", error.message);
  return { ok: true };
}

export async function signOutAction() {
  if (isMock()) (await cookies()).delete("tab_demo_role");
  else {
    const { createSupabaseServerClient } = await import("@/lib/supabase/server");
    await (await createSupabaseServerClient()).auth.signOut();
  }
  redirect("/");
}
