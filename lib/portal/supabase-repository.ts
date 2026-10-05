/**
 * Supabase-backed repository (portal.dataSource = "supabase").
 * Every query runs as the signed-in user, so row-level security in the migration is the access control.
 * Status: implemented against the schema; verify against a live project before launch.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import { siteUrl } from "@/config/site";
import { safeResourceHref } from "./resources";
import type {
  Appointment, CheckIn, Client, ClientActivityInput, ClientProgram, Consent, Dashboard, Entitlement, FormAssignment, FormTemplate, Inquiry, MetricDefinition, PurchaseReview,
  Plan, PlanEntry, PortalRepository, Product, ProgramTemplate, ProgressEntry, ResourceAssignment, Review, SessionNote, StageChange, Viewer,
} from "./types";
import { currentWeekFor, personalizedModules } from "./programs";

type Row = Record<string, any>;
const db = () => createSupabaseServerClient();
const must = <T>(r: { data: T | null; error: { message: string } | null }): T => { if (r.error) throw new Error(r.error.message); return r.data as T; };
const today = () => new Date().toISOString().slice(0, 10);
const weekStart = () => { const d = new Date(); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d.toISOString().slice(0, 10); };

const CONSENT_LABELS: Record<Consent["type"], { label: string; required: boolean }> = {
  terms: { label: "Terms of service", required: true },
  privacy: { label: "Privacy policy", required: true },
  health_info_collection: { label: "Collect health information for safe care", required: true },
  care_coordination: { label: "Share updates with my healthcare providers when I ask", required: false },
  marketing_email: { label: "News, guides, and events by email", required: false },
  marketing_sms: { label: "Occasional text messages", required: false },
  photo_testimonial: { label: "Use my photo or story with permission", required: false },
};
const CONSENT_VERSION = "2026-10";

const myTabOf = (r: Row): Client["myTab"] => ({
  status: r.activated_at ? "active" : r.invited_at || r.profile_id ? "invited" : "not_invited",
  invitedAt: r.invited_at ?? undefined, activatedAt: r.activated_at ?? undefined,
});

const mapClient = (r: Row): Client => ({
  id: r.id, fullName: r.full_name, preferredName: r.preferred_name ?? undefined, email: r.email ?? undefined, phone: r.phone ?? undefined,
  status: r.status, methodStage: r.method_stage, services: (r.practitioner_assignments ?? []).map((a: Row) => a.service).filter(Boolean),
  primaryPractitioner: r.practitioners?.display_name, lastCheckIn: r.check_ins?.[0]?.week_of, myTab: myTabOf(r),
});

const mapInquiry = (r: Row): Inquiry => ({
  id: r.id, reference: r.reference, kind: r.kind, receivedAt: r.created_at, name: r.name, email: r.email, phone: r.phone ?? undefined,
  contactPreference: r.contact_preference ?? undefined, journey: r.journey ?? undefined, help: r.help ?? [], serviceInterest: r.service_interest ?? undefined,
  outcomes: r.outcomes ?? [], considerations: r.considerations ?? [], delivery: r.delivery ?? undefined,
  availability: r.availability ?? [], foundVia: r.found_via ?? undefined, topic: r.topic ?? undefined, message: r.message ?? undefined, flags: r.flags ?? [], marketingOptIn: r.marketing_opt_in,
  clientId: r.client_id ?? undefined, clientName: r.clients?.full_name ?? undefined, routingOutcome: r.routing_outcome ?? undefined,
  routingNote: r.routing_note ?? undefined, routedAt: r.routed_at ?? undefined,
});
/** Case-insensitive exact match on an email address (escapes LIKE wildcards). */
const likeExact = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

const mapTemplate = (t: Row): ProgramTemplate => ({
  id: t.id, familyId: t.family_id, slug: t.slug, title: t.title, summary: t.summary ?? undefined, service: t.service, durationWeeks: t.duration_weeks ?? undefined,
  status: t.status, version: t.version, submittedAt: t.submitted_at ?? undefined, publishedAt: t.published_at ?? undefined,
  modules: (t.program_modules ?? []).sort((a: Row, b: Row) => a.week - b.week || a.sort - b.sort).map((m: Row) => ({
    id: m.id, week: m.week, title: m.title, body: m.body_md ?? undefined,
    activities: (m.program_activities ?? []).sort((a: Row, b: Row) => a.sort - b.sort).map((a: Row) => ({
      id: a.id, kind: a.kind, title: a.title, instructions: a.instructions ?? undefined, prescription: a.prescription, sourceActivityId: a.source_activity_id ?? undefined,
    })),
  })),
});

const TEMPLATE_SELECT = "*, program_modules(*, program_activities(*))";

const CLIENT_PROGRAM_SELECT = `*, program_templates(${TEMPLATE_SELECT}), client_program_activities(*)`;

async function mapClientProgram(r: Row, sb: Awaited<ReturnType<typeof db>>): Promise<ClientProgram> {
  const logs = must(await sb.from("activity_logs").select("activity_id, client_activity_id").eq("client_program_id", r.id).eq("completed", true)) as Row[];
  const template = mapTemplate(r.program_templates);
  return {
    id: r.id, clientId: r.client_id, template, templateVersion: r.template_version, source: r.source, status: r.status, startedAt: r.started_at,
    completedAt: r.completed_at ?? undefined, currentWeek: currentWeekFor(r.started_at, template.durationWeeks), completedActivityIds: logs.map((l) => l.activity_id ?? l.client_activity_id).filter(Boolean),
    planId: r.plan_id ?? undefined, personalization: r.personalization ?? {},
    customActivities: (r.client_program_activities ?? []).sort((a: Row, b: Row) => a.sort - b.sort)
      .map((c: Row) => ({ id: c.id, week: c.week, kind: c.kind, title: c.title, instructions: c.instructions ?? undefined })),
  };
}

/** Saves a program's client-only activities in one transaction (save_client_activities, C7b). */
async function saveCustom(sb: Awaited<ReturnType<typeof db>>, programId: string, items: ClientActivityInput[]) {
  must(await sb.rpc("save_client_activities", { program: programId, items: items.map((c) => ({ ...c, instructions: c.instructions ?? "" })) }));
}

const mapPlan = (r: Row, priv?: Row): Plan => ({
  id: r.id, clientId: r.client_id, planType: r.plan_type, parentPlanId: r.parent_plan_id ?? undefined, visibleToClient: r.visible_to_client,
  details: r.details ?? {}, privateDetails: priv?.details, title: r.title, focus: r.focus ?? undefined, services: r.services, status: r.status,
  startDate: r.start_date ?? undefined, reviewDate: r.review_date ?? undefined, practitionerName: r.practitioners?.display_name ?? r.profiles?.full_name,
  goals: (r.plan_goals ?? []).sort((a: Row, b: Row) => a.sort - b.sort).map((g: Row) => ({ id: g.id, title: g.title, whyItMatters: g.why_it_matters ?? undefined, measure: g.measure ?? undefined, metricKey: g.metric_key ?? undefined, target: g.target ?? undefined, status: g.status })),
});
const PLAN_SELECT = "*, plan_goals(*), profiles:created_by(full_name), practitioners(display_name)";

const mapReview = (r: Row): Review => ({
  id: r.id, date: r.review_date, summary: r.summary_for_client ?? "", nextSteps: r.next_steps ?? undefined, stage: r.method_stage ?? undefined,
  shared: r.shared, outcome: r.outcome ?? undefined, reflections: r.reflections ?? undefined, author: r.practitioners?.display_name ?? undefined,
});

const mapForm = (t: Row): FormTemplate => ({ id: t.id, slug: t.slug, title: t.title, description: t.description ?? undefined, sensitivity: t.sensitivity, sections: t.schema?.sections ?? [] });

export const supabaseRepository: PortalRepository = {
  async getDashboard(clientId) {
    const [client, plan, programs, appointments, resources, forms, reviews, checkIns, stageChanges] = await Promise.all([
      this.getClient(clientId), this.getPlan(clientId), this.listClientPrograms(clientId), this.listAppointments(clientId),
      this.listResources(clientId), this.listForms(clientId), this.listSharedReviews(clientId), this.listCheckIns(clientId),
      this.listStageChanges(clientId),
    ]);
    if (!client) throw new Error("Client not found");
    const active = programs.filter((p) => p.status === "active");
    return {
      client, plan: plan ?? undefined, programs: active,
      nextAppointment: appointments.find((a) => a.startsAt > new Date().toISOString()),
      todaysActivities: active.flatMap((p) => {
        const modules = personalizedModules(p);
        const mod = modules.find((m) => m.week === p.currentWeek) ?? modules.at(-1);
        return (mod?.activities ?? []).filter((a) => a.kind !== "check_in").slice(0, 4).map((activity) => ({ program: p, activity, done: p.completedActivityIds.includes(activity.id) }));
      }),
      checkInDue: !checkIns.some((c) => c.weekOf === weekStart()),
      resources: resources.slice(0, 3),
      pendingForms: forms.filter((f) => f.status === "not_started" || f.status === "draft"),
      latestSharedReview: reviews[0], latestStageChange: stageChanges[0],
    } satisfies Dashboard;
  },
  async getClient(id) {
    const sb = await db();
    const r = must(await sb.from("clients").select("*, practitioners(display_name), practitioner_assignments(service), check_ins(week_of)").eq("id", id).order("week_of", { referencedTable: "check_ins", ascending: false }).limit(1, { referencedTable: "check_ins" }).maybeSingle()) as Row | null;
    return r ? mapClient(r) : null;
  },
  async getPlan(clientId) {
    const sb = await db();
    const r = must(await sb.from("wellness_plans").select(PLAN_SELECT).eq("client_id", clientId).eq("plan_type", "wellness").eq("status", "active").order("created_at", { ascending: false }).limit(1).maybeSingle()) as Row | null;
    return r ? mapPlan(r) : null;
  },
  async listClientPrograms(clientId) {
    const sb = await db();
    const rows = must(await sb.from("client_programs").select(CLIENT_PROGRAM_SELECT).eq("client_id", clientId).order("started_at", { ascending: false })) as Row[];
    return Promise.all(rows.map((r) => mapClientProgram(r, sb)));
  },
  async getClientProgram(clientId, id) {
    const sb = await db();
    const r = must(await sb.from("client_programs").select(CLIENT_PROGRAM_SELECT).eq("client_id", clientId).eq("id", id).maybeSingle()) as Row | null;
    return r ? mapClientProgram(r, sb) : null;
  },
  async toggleActivity(clientId, programId, activityId, done) {
    const sb = await db();
    // An activity added for this client (C7b) is logged by client_activity_id; guard_activity_log checks either kind.
    const custom = must(await sb.from("client_program_activities").select("id").eq("id", activityId).eq("client_program_id", programId).maybeSingle());
    const col = custom ? "client_activity_id" : "activity_id";
    if (done) must(await sb.from("activity_logs").insert({ client_id: clientId, client_program_id: programId, [col]: activityId, completed: true }));
    else must(await sb.from("activity_logs").delete().eq("client_id", clientId).eq("client_program_id", programId).eq(col, activityId));
  },
  async listMetrics() {
    const sb = await db();
    const rows = must(await sb.from("metric_definitions").select("*").eq("active", true)) as Row[];
    return rows.map((m): MetricDefinition => ({ key: m.key, label: m.label, unit: m.unit ?? undefined, category: m.category, sensitive: m.sensitive, higherIsBetter: m.higher_is_better ?? undefined, min: m.scale_min ?? undefined, max: m.scale_max ?? undefined }));
  },
  async listProgress(clientId) {
    const sb = await db();
    const rows = must(await sb.from("progress_entries").select("metric_key, value, recorded_on, source").eq("client_id", clientId).order("recorded_on")) as Row[];
    return rows.map((r): ProgressEntry => ({ metricKey: r.metric_key, value: Number(r.value), recordedOn: r.recorded_on, source: r.source }));
  },
  async addProgress(clientId, e) {
    const sb = await db();
    must(await sb.from("progress_entries").insert({ client_id: clientId, metric_key: e.metricKey, value: e.value, recorded_on: e.recordedOn, source: "client" }));
  },
  async listCheckIns(clientId) {
    const sb = await db();
    const rows = must(await sb.from("check_ins").select("*").eq("client_id", clientId).order("week_of", { ascending: false }).limit(12)) as Row[];
    return rows.map((r): CheckIn => ({ weekOf: r.week_of, energy: r.energy ?? undefined, sleepQuality: r.sleep_quality ?? undefined, stress: r.stress ?? undefined, wins: r.wins ?? undefined, challenges: r.challenges ?? undefined, supportNeeded: r.support_needed ?? undefined }));
  },
  async saveCheckIn(clientId, c) {
    const sb = await db();
    must(await sb.from("check_ins").upsert({ client_id: clientId, week_of: c.weekOf, energy: c.energy, sleep_quality: c.sleepQuality, stress: c.stress, wins: c.wins, challenges: c.challenges, support_needed: c.supportNeeded }, { onConflict: "client_id,week_of" }));
    const entries = [["energy", c.energy], ["stress", c.stress]].filter(([, v]) => v != null).map(([k, v]) => ({ client_id: clientId, metric_key: k, value: v, recorded_on: c.weekOf, source: "client" }));
    if (entries.length) must(await sb.from("progress_entries").insert(entries));
  },
  async listAppointments(clientId) {
    const sb = await db();
    const rows = must(await sb.from("appointment_refs").select("*").eq("client_id", clientId).gte("starts_at", new Date(Date.now() - 86400000).toISOString()).order("starts_at")) as Row[];
    return rows.map((r): Appointment => ({ id: r.id, service: r.service, startsAt: r.starts_at, location: r.location ?? "", status: r.status }));
  },
  async listResources(clientId) {
    const sb = await db();
    const rows = must(await sb.from("resource_assignments").select("*").eq("client_id", clientId).order("assigned_at", { ascending: false })) as Row[];
    return rows.map((r): ResourceAssignment => ({ id: r.id, title: r.title, kind: r.kind ?? undefined, note: r.note ?? undefined, href: safeResourceHref(r.resource_ref), assignedAt: r.assigned_at, viewedAt: r.viewed_at ?? undefined }));
  },
  async listForms(clientId) {
    const sb = await db();
    const assignments = must(await sb.from("form_assignments").select("*, form_templates(*)").eq("client_id", clientId)) as Row[];
    const subs = must(await sb.from("form_submissions").select("*").eq("client_id", clientId)) as Row[];
    return assignments.map((a): FormAssignment => {
      const s = subs.find((x) => x.template_id === a.template_id);
      return { id: a.id, template: mapForm(a.form_templates), dueOn: a.due_on ?? undefined, status: s ? s.status : "not_started", submittedAt: s?.submitted_at ?? undefined, answers: s?.answers };
    });
  },
  async getForm(clientId, slug) { return (await this.listForms(clientId)).find((f) => f.template.slug === slug) ?? null; },
  async submitForm(clientId, slug, answers, final) {
    const form = await this.getForm(clientId, slug);
    if (!form) throw new Error("Form not assigned");
    const sb = await db();
    const existing = must(await sb.from("form_submissions").select("id").eq("client_id", clientId).eq("template_id", form.template.id).maybeSingle()) as Row | null;
    const payload = { client_id: clientId, template_id: form.template.id, answers, status: final ? "submitted" : "draft", submitted_at: final ? new Date().toISOString() : null };
    if (existing) must(await sb.from("form_submissions").update(payload).eq("id", existing.id));
    else must(await sb.from("form_submissions").insert(payload));
  },
  async listSharedReviews(clientId) {
    const sb = await db();
    const rows = must(await sb.from("progress_reviews").select("*, practitioners(display_name)").eq("client_id", clientId).eq("shared", true).order("created_at", { ascending: false })) as Row[];
    return rows.map(mapReview);
  },
  async listConsents(clientId) {
    const sb = await db();
    const rows = must(await sb.from("consents").select("*").eq("client_id", clientId).order("granted_at", { ascending: false })) as Row[];
    return (Object.keys(CONSENT_LABELS) as Consent["type"][]).map((type) => {
      const r = rows.find((x) => x.type === type);
      return { type, ...CONSENT_LABELS[type], granted: !!r?.granted && !r?.revoked_at, updatedAt: r?.granted_at };
    });
  },
  async setConsent(clientId, type, granted) {
    if (CONSENT_LABELS[type].required) return;
    const sb = await db();
    // Consents are a history (SEC-016): each change is a new row, stamped by the database; the newest one counts.
    must(await sb.from("consents").insert({ client_id: clientId, type, version: CONSENT_VERSION, granted }));
  },
  async updateContact(clientId, data) {
    const sb = await db();
    must(await sb.from("clients").update({ preferred_name: data.preferredName, phone: data.phone }).eq("id", clientId));
  },
  async listProducts() {
    const sb = await db();
    const rows = must(await sb.from("products").select("*").eq("active", true)) as Row[];
    return rows.map((p): Product => ({ id: p.id, slug: p.slug, title: p.title, description: p.description ?? undefined, kind: p.kind, service: p.service ?? undefined, priceCents: p.price_cents ?? undefined, active: p.active }));
  },
  async listEntitlements(clientId) {
    const sb = await db();
    const rows = must(await sb.from("entitlements").select("*, products(*)").eq("client_id", clientId)) as Row[];
    return rows.map((e): Entitlement => ({ id: e.id, status: e.status, startsAt: e.starts_at, endsAt: e.ends_at ?? undefined, needsReview: e.needs_review, refundedCents: e.refunded_cents ?? undefined, product: { id: e.products.id, slug: e.products.slug, title: e.products.title, kind: e.products.kind, active: e.products.active, priceCents: e.products.price_cents ?? undefined } }));
  },
  async listPurchaseReviews() {
    const sb = await db();
    const rows = must(await sb.from("entitlements").select("id, client_id, refunded_cents, clients(full_name), products(title, price_cents)").eq("needs_review", true).order("updated_at")) as Row[];
    return rows.map((e): PurchaseReview => ({ entitlementId: e.id, clientId: e.client_id, clientName: e.clients?.full_name ?? "Client", product: e.products?.title ?? "Purchase", priceCents: e.products?.price_cents ?? undefined, refundedCents: e.refunded_cents ?? 0 }));
  },
  async resolvePurchaseReview(entitlementId, endAccess) {
    const sb = await db();
    // Owner only, checked in the database (resolve_purchase_review).
    must(await sb.rpc("resolve_purchase_review", { p_entitlement: entitlementId, p_end_access: endAccess }));
  },
  async listClients(_viewer: Viewer) {
    const sb = await db();
    const rows = must(await sb.from("clients").select("*, practitioners(display_name), practitioner_assignments(service), check_ins(week_of)").order("full_name")) as Row[];
    return rows.map((r) => ({ ...mapClient(r), lastCheckIn: (r.check_ins ?? []).map((c: Row) => c.week_of).sort().at(-1) }));
  },
  async listNotes(clientId, includeInternal) {
    const sb = await db();
    const shared = must(await sb.from("session_notes").select("*, practitioners(display_name)").eq("client_id", clientId).order("session_date", { ascending: false })) as Row[];
    const notes = shared.map((n): SessionNote => ({ id: n.id, date: n.session_date, service: n.service ?? undefined, visibility: "shared", body: n.body, author: n.practitioners?.display_name ?? "TAB" }));
    if (!includeInternal) return notes;
    // SEC-019: internal notes live in the private schema; the function checks the care team and audits the read.
    const internal = must(await sb.rpc("internal_notes", { p_client: clientId })) as Row[];
    return [...notes, ...internal.map((n): SessionNote => ({ id: n.id, date: n.session_date, service: n.service ?? undefined, visibility: "internal", body: n.body, author: n.author ?? "TAB" }))]
      .sort((a, b) => b.date.localeCompare(a.date));
  },
  async addNote(clientId, viewer, note) {
    if (!viewer.practitionerId) throw new Error("Only practitioners can add notes");
    const sb = await db();
    if (note.visibility === "internal") {
      must(await sb.rpc("add_internal_note", { p_client: clientId, p_body: note.body, p_service: note.service ?? null, p_session_date: today() }));
      return;
    }
    must(await sb.from("session_notes").insert({ client_id: clientId, practitioner_id: viewer.practitionerId, body: note.body, visibility: "shared", service: note.service, session_date: today() }));
  },
  async listReviews(clientId) {
    const sb = await db();
    const rows = must(await sb.from("progress_reviews").select("*, practitioners(display_name)").eq("client_id", clientId).order("created_at", { ascending: false })) as Row[];
    return rows.map(mapReview);
  },
  async recordProgressReview(clientId, _viewer, input) {
    const sb = await db();
    // One transaction in the database; RLS and guard triggers decide who may do it (record_progress_review).
    const changed = must(await sb.rpc("record_progress_review", {
      p_client: clientId, p_outcome: input.outcome, p_reflections: input.reflections, p_summary: input.summaryForClient ?? null,
      p_next_steps: input.nextSteps ?? null, p_shared: input.share, p_stage: input.newStage ?? null,
    })) as boolean;
    return { stageChanged: changed };
  },
  async listStageChanges(clientId) {
    const sb = await db();
    const rows = must(await sb.from("stage_changes").select("*, profiles:changed_by(full_name)").eq("client_id", clientId).order("created_at", { ascending: false })) as Row[];
    return rows.map((r): StageChange => ({ id: r.id, from: r.from_stage ?? undefined, to: r.to_stage, changedAt: r.created_at, changedBy: r.profiles?.full_name ?? undefined, reviewId: r.review_id ?? undefined }));
  },
  async listPlans(clientId, { staff }) {
    const sb = await db();
    const rows = must(await sb.from("wellness_plans").select(PLAN_SELECT).eq("client_id", clientId).neq("status", "archived").order("created_at")) as Row[];
    // Practitioner-only sections live in the private schema (SEC-019): staff read them through an audited function.
    const priv = staff ? (must(await sb.rpc("plan_private_details", { p_client: clientId })) as Row[]) : [];
    return rows.map((r) => mapPlan(r, priv.find((p) => p.plan_id === r.id)));
  },
  async savePlan(clientId, _viewer, input) {
    const sb = await db();
    // RLS and triggers enforce the rules: care team only, one active Performance Plan, service plans under it, nutrition gate.
    const fields = {
      title: input.title, focus: input.focus ?? null, status: input.status, visible_to_client: input.visibleToClient,
      start_date: input.startDate ?? null, review_date: input.reviewDate ?? null, details: input.details,
    };
    let id = input.id;
    if (id) {
      must(await sb.from("wellness_plans").update(fields).eq("id", id).eq("client_id", clientId));
    } else {
      const anchor = input.planType === "wellness" ? null
        : (must(await sb.from("wellness_plans").select("id").eq("client_id", clientId).eq("plan_type", "wellness").eq("status", "active").maybeSingle()) as Row | null);
      if (input.planType !== "wellness" && !anchor) throw new Error("Create the Performance Plan first.");
      const services = input.planType === "wellness" || input.planType === "nutrition" ? [] : [input.planType];
      id = (must(await sb.from("wellness_plans").insert({ ...fields, client_id: clientId, plan_type: input.planType, parent_plan_id: anchor?.id ?? null, services }).select("id").single()) as Row).id as string;
    }
    must(await sb.rpc("save_plan_private_details", { p_plan: id, p_client: clientId, p_details: input.privateDetails ?? {} }));
    if (input.planType === "wellness" && input.goals) {
      const keep = input.goals.map((g) => g.id).filter(Boolean) as string[];
      const del = sb.from("plan_goals").delete().eq("plan_id", id);
      must(await (keep.length ? del.not("id", "in", `(${keep.join(",")})`) : del));
      for (const [sort, g] of input.goals.entries()) {
        const row = { plan_id: id, title: g.title, why_it_matters: g.whyItMatters ?? null, measure: g.measure ?? null, target: g.target ?? null, status: g.status ?? "active", sort };
        must(await (g.id ? sb.from("plan_goals").update(row).eq("id", g.id).eq("plan_id", id) : sb.from("plan_goals").insert(row)));
      }
    }
    return id;
  },
  async listPlanEntries(clientId, planId, includeInternal) {
    const sb = await db();
    let q = sb.from("plan_entries").select("*, profiles:practitioner_id(full_name)").eq("client_id", clientId).eq("plan_id", planId).order("entry_date", { ascending: false });
    if (!includeInternal) q = q.eq("visibility", "shared");
    const rows = must(await q) as Row[];
    return rows.map((r): PlanEntry => ({ id: r.id, planId: r.plan_id, date: r.entry_date, body: r.body, visibility: r.visibility, author: r.profiles?.full_name ?? undefined }));
  },
  async addPlanEntry(clientId, planId, _viewer, entry) {
    const sb = await db();
    must(await sb.from("plan_entries").insert({ client_id: clientId, plan_id: planId, body: entry.body, visibility: entry.visibility, entry_date: entry.date ?? today() }));
  },
  async listProgramTemplates() {
    const sb = await db();
    const rows = must(await sb.from("program_templates").select(TEMPLATE_SELECT).order("title").order("version")) as Row[];
    return rows.map(mapTemplate);
  },
  async getProgramTemplate(id) {
    const sb = await db();
    const r = must(await sb.from("program_templates").select(TEMPLATE_SELECT).eq("id", id).maybeSingle()) as Row | null;
    return r ? mapTemplate(r) : null;
  },
  async saveProgramDraft(_viewer, input) {
    const sb = await db();
    // RLS (staff only) and the guard triggers (drafts only; version and slug set by the database) enforce the rules.
    let id = input.id;
    if (!id) {
      const base = input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "program";
      const slug = `${base}-${crypto.randomUUID().slice(0, 6)}`;
      id = (must(await sb.from("program_templates").insert({ slug, title: input.title, service: input.service, status: "draft" }).select("id").single()) as Row).id as string;
    }
    const details = { title: input.title, summary: input.summary ?? "", service: input.service, duration_weeks: input.durationWeeks ?? "" };
    const content = input.modules.map((m) => ({ id: m.id, week: m.week, title: m.title, body: m.body ?? "", activities: m.activities }));
    must(await sb.rpc("save_program_draft", { template: id, details, content }));
    return id;
  },
  async runProgramAction(_viewer, id, action) {
    const sb = await db();
    // Row-level security filters what a viewer can't change, so a missing row means "not allowed or not found".
    const one = async (q: PromiseLike<{ data: Row | null; error: { message: string } | null }>) => {
      const r = must(await q);
      if (!r) throw new Error("Program not found, or you can't make that change.");
      return r.id as string;
    };
    switch (action) {
      case "submit": return one(sb.from("program_templates").update({ submitted_at: new Date().toISOString() }).eq("id", id).eq("status", "draft").select("id").maybeSingle());
      case "publish": return one(sb.from("program_templates").update({ status: "published" }).eq("id", id).eq("status", "draft").select("id").maybeSingle());
      case "retire": return one(sb.from("program_templates").update({ status: "retired" }).eq("id", id).eq("status", "published").select("id").maybeSingle());
      case "new_version": return must(await sb.rpc("new_program_version", { template: id })) as string;
      case "discard": {
        const t = must(await sb.from("program_templates").select("family_id").eq("id", id).maybeSingle()) as Row | null;
        await one(sb.from("program_templates").delete().eq("id", id).eq("status", "draft").select("id").maybeSingle());
        const latest = must(await sb.from("program_templates").select("id").eq("family_id", t?.family_id).order("version", { ascending: false }).limit(1).maybeSingle()) as Row | null;
        return latest?.id ?? null;
      }
    }
  },
  async saveClientProgram(clientId, _viewer, input) {
    const sb = await db();
    // RLS (care team only) and client_programs_guard (published only, version pinned, client and program fixed) enforce the rules.
    const fields = { started_at: input.startedAt, status: input.status, plan_id: input.planId ?? null, personalization: input.personalization };
    if (input.id) {
      const r = must(await sb.from("client_programs").update(fields).eq("id", input.id).eq("client_id", clientId).eq("template_id", input.templateId).select("id").maybeSingle()) as Row | null;
      if (!r) throw new Error("Program not found");
      await saveCustom(sb, r.id, input.customActivities);
      return r.id;
    }
    const r = must(await sb.from("client_programs").insert({ ...fields, client_id: clientId, template_id: input.templateId, source: "assigned" }).select("id").single()) as Row;
    await saveCustom(sb, r.id, input.customActivities);
    return r.id;
  },
  async inviteClient(clientId) {
    const sb = await db();
    const c = must(await sb.from("clients").select("email, activated_at").eq("id", clientId).maybeSingle()) as Row | null;
    if (!c) throw new Error("Client not found");
    if (c.activated_at) return "already_active";
    if (!c.email) throw new Error("Add the client's email address first.");
    // Row-level security decides who may invite: only the care team can stamp the invitation (clients_invite_stamp).
    const ok = must(await sb.from("clients").update({ invited_at: new Date().toISOString() }).eq("id", clientId).select("id").maybeSingle());
    if (!ok) throw new Error("Only this client's care team can invite them.");
    // Then Supabase Auth sends the invitation (its email template is set up with C5; no personal details, guardrail 5).
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) { console.info("[invite] My TAB invitation: not sent (service role not configured)"); return "skipped"; }
    try {
      const admin = await createSupabaseServiceClient();
      const { error } = await admin.auth.admin.inviteUserByEmail(c.email, { redirectTo: `${siteUrl}/my-tab/auth/callback` });
      if (error) {
        if (/already|registered|exists/i.test(error.message)) return "has_account";
        throw error;
      }
      return "sent";
    } catch (err) {
      console.error("[invite] My TAB invitation: send failed", err);
      return "failed";
    }
  },
  async listFormTemplates() {
    const sb = await db();
    const rows = must(await sb.from("form_templates").select("*").eq("status", "published").order("title")) as Row[];
    return rows.map(mapForm);
  },
  async assignForm(clientId, _viewer, input) {
    const sb = await db();
    // RLS (care team) and form_assignments_guard (published forms only) enforce the rules; assigned_by is stamped.
    must(await sb.from("form_assignments").insert({ client_id: clientId, template_id: input.templateId, due_on: input.dueOn ?? null }));
  },
  async withdrawForm(clientId, assignmentId) {
    const sb = await db();
    const r = must(await sb.from("form_assignments").delete().eq("id", assignmentId).eq("client_id", clientId).select("id").maybeSingle());
    if (!r) throw new Error("Form not found, or you can't change it.");
  },
  async assignResource(clientId, _viewer, input) {
    const sb = await db();
    must(await sb.from("resource_assignments").insert({ client_id: clientId, resource_ref: input.href, title: input.title, kind: input.kind ?? null, note: input.note ?? null }));
  },
  async markResourceViewed(clientId, assignmentId) {
    const sb = await db();
    must(await sb.from("resource_assignments").update({ viewed_at: new Date().toISOString() }).eq("id", assignmentId).eq("client_id", clientId).is("viewed_at", null));
  },
  async removeResource(clientId, assignmentId) {
    const sb = await db();
    const r = must(await sb.from("resource_assignments").delete().eq("id", assignmentId).eq("client_id", clientId).select("id").maybeSingle());
    if (!r) throw new Error("Resource not found, or you can't change it.");
  },
  async moveClientProgram(clientId, programId, _viewer, targetTemplateId) {
    const sb = await db();
    // move_client_program runs as the caller: care team only (RLS), newer published version of the same program only (guard).
    const cp = must(await sb.from("client_programs").select("id").eq("id", programId).eq("client_id", clientId).maybeSingle());
    if (!cp) throw new Error("Program not found");
    return must(await sb.rpc("move_client_program", { program: programId, target: targetTemplateId })) as number;
  },
  async listPractitioners() {
    const sb = await db();
    const rows = must(await sb.from("practitioners").select("id, display_name, active, can_publish, capabilities, profiles(role)").order("display_name")) as Row[];
    return rows.map((r) => ({ id: r.id, name: r.display_name, role: r.profiles?.role ?? "practitioner", active: r.active, canPublish: r.can_publish, capabilities: r.capabilities ?? [] }));
  },
  async updatePractitioner(id, changes) {
    const sb = await db();
    // practitioners_owner: only the owner can change these (RLS); a missing row means not allowed or not found.
    const r = must(await sb.from("practitioners").update({ can_publish: changes.canPublish, capabilities: changes.capabilities }).eq("id", id).select("id").maybeSingle());
    if (!r) throw new Error("Practitioner not found, or you can't change it.");
  },
  async listInquiries() {
    const sb = await db();
    const rows = must(await sb.from("inquiries").select("*, clients(full_name)").order("created_at", { ascending: false })) as Row[];
    return rows.map(mapInquiry);
  },
  async getInquiry(id) {
    const sb = await db();
    const row = must(await sb.from("inquiries").select("*, clients(full_name)").eq("id", id).maybeSingle()) as Row | null;
    if (!row) return null;
    const inquiry = mapInquiry(row);
    const email = likeExact(inquiry.email);
    const [clients, related] = await Promise.all([
      sb.from("clients").select("*").ilike("email", email),
      sb.from("inquiries").select("*, clients(full_name)").ilike("email", email).neq("id", id).order("created_at", { ascending: false }),
    ]);
    return {
      inquiry,
      matches: (must(clients) as Row[]).filter((c) => c.id !== inquiry.clientId).map(mapClient),
      related: (must(related) as Row[]).map(mapInquiry),
    };
  },
  async routeInquiry(id, outcome, note) {
    const sb = await db();
    // The database stamps who routed it and when (guard_inquiry_update).
    must(await sb.from("inquiries").update({ routing_outcome: outcome, routing_note: note ?? null }).eq("id", id));
  },
  async linkInquiries(id, clientId) {
    const sb = await db();
    const row = must(await sb.from("inquiries").update({ client_id: clientId }).eq("id", id).select("email").maybeSingle()) as Row | null;
    if (!row) return 0;
    const others = must(await sb.from("inquiries").update({ client_id: clientId }).is("client_id", null).ilike("email", likeExact(row.email)).select("id")) as Row[];
    return 1 + others.length;
  },
  async createClientFromInquiry(id) {
    const sb = await db();
    const i = must(await sb.from("inquiries").select("*").eq("id", id).single()) as Row;
    const client = must(await sb.from("clients").insert({ full_name: i.name, email: i.email, phone: i.phone, status: "prospect", source: `${i.kind}-form` }).select("id").single()) as Row;
    await this.linkInquiries(id, client.id);
    return client.id as string;
  },
};
