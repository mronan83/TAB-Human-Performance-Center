/**
 * Demo data for reviewing My TAB without a database (portal.dataSource = "mock").
 * Everything here is fictional. State lives in memory and resets when the server restarts.
 */
import type {
  Activity, Appointment, CheckIn, Client, ClientProgram, Consent, Dashboard, Entitlement, FormAssignment, FormTemplate,
  MetricDefinition, Plan, PortalRepository, Product, ProgramTemplate, ProgressEntry, ResourceAssignment, Review, SessionNote, Viewer,
} from "./types";

const day = (offset: number) => { const d = new Date(); d.setDate(d.getDate() + offset); return d.toISOString().slice(0, 10); };
// Demo appointment times are Michigan local time (EDT, UTC-4).
const at = (offset: number, hour: number) => { const d = new Date(); d.setUTCDate(d.getUTCDate() + offset); d.setUTCHours(hour + 4, 0, 0, 0); return d.toISOString(); };
const weekStart = (offset = 0) => { const d = new Date(); d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + offset * 7); return d.toISOString().slice(0, 10); };

export const DEMO_CLIENT_ID = "demo-client-dana";
export const DEMO_PRACTITIONER_ID = "demo-practitioner";

const metrics: MetricDefinition[] = [
  { key: "strength_sessions", label: "Strength sessions", unit: "per week", category: "habit", sensitive: false, higherIsBetter: true, min: 0, max: 7 },
  { key: "sleep_hours", label: "Sleep", unit: "hours per night", category: "wellbeing", sensitive: false, higherIsBetter: true, min: 0, max: 12 },
  { key: "energy", label: "Energy", unit: "1–5", category: "wellbeing", sensitive: false, higherIsBetter: true, min: 1, max: 5 },
  { key: "stress", label: "Stress", unit: "1–5", category: "wellbeing", sensitive: false, higherIsBetter: false, min: 1, max: 5 },
  { key: "comfort", label: "Physical comfort", unit: "1–5", category: "physical", sensitive: false, higherIsBetter: true, min: 1, max: 5 },
];

const act = (id: string, kind: Activity["kind"], title: string, instructions?: string, prescription?: Activity["prescription"]): Activity => ({ id, kind, title, instructions, prescription });

const strengthTemplate: ProgramTemplate = {
  id: "tpl-strength-foundations", slug: "strength-foundations", title: "Strength Foundations", service: "personal-strength-training", durationWeeks: 8, status: "published",
  summary: "Build full-body strength, balance, and confidence with three short sessions a week.",
  modules: [
    { id: "m1", week: 1, title: "Week 1: Learn the patterns", body: "This week is about learning how the movements should feel. Go slower than you think you need to.", activities: [
      act("a1", "exercise", "Sit-to-stand", "From a sturdy chair, stand fully, then sit with control.", { sets: 3, reps: "8–10" }),
      act("a2", "exercise", "Wall push-up", "Hands at shoulder height, body in one line.", { sets: 3, reps: "8–10" }),
      act("a3", "exercise", "Supported single-leg balance", "Hold a counter lightly. Switch sides.", { sets: 2, reps: "20–30 sec" }),
      act("a4", "habit", "Walk 10 minutes after dinner", undefined, { frequency: "4x this week" }),
      act("a5", "reflection", "What felt easier than expected?"),
    ]},
    { id: "m2", week: 2, title: "Week 2: Add load gently", body: "Keep the same movements and add a little challenge where it feels right.", activities: [
      act("b1", "exercise", "Goblet squat to chair", "Hold a light weight at your chest.", { sets: 3, reps: "8" }),
      act("b2", "exercise", "Band row", "Squeeze shoulder blades; control the return.", { sets: 3, reps: "10" }),
      act("b3", "exercise", "Step-up", "Low step, hold a rail if needed.", { sets: 2, reps: "6 each side" }),
      act("b4", "video", "Watch: breathing and bracing (6 min)"),
      act("b5", "habit", "Protein at breakfast", undefined, { frequency: "5 days" }),
    ]},
    { id: "m3", week: 3, title: "Week 3: Build consistency", body: "Aim for three sessions. Consistency matters more than intensity.", activities: [
      act("c1", "exercise", "Romanian deadlift", "Hinge at hips, soft knees, light dumbbells.", { sets: 3, reps: "8" }),
      act("c2", "exercise", "Incline push-up", "Use a counter or bench.", { sets: 3, reps: "8–10" }),
      act("c3", "check_in", "Weekly check-in"),
    ]},
  ],
};

const restTemplate: ProgramTemplate = {
  id: "tpl-rest-reset", slug: "rest-and-reset", title: "Rest & Reset", service: "womens-wellness-coaching", durationWeeks: 4, status: "published",
  summary: "Small, realistic changes for better sleep and steadier energy.",
  modules: [
    { id: "r1", week: 1, title: "Week 1: Notice your evenings", activities: [
      act("r1a", "reflection", "Note when you start winding down each evening"),
      act("r1b", "habit", "Screens off 30 minutes before bed", undefined, { frequency: "3 nights" }),
      act("r1c", "reading", "Read: Why sleep changes in midlife"),
    ]},
    { id: "r2", week: 2, title: "Week 2: A steadier wind-down", activities: [
      act("r2a", "habit", "Same bedtime, within 30 minutes", undefined, { frequency: "5 nights" }),
      act("r2b", "reflection", "What got in the way this week?"),
    ]},
  ],
};

const welcomeForm: FormTemplate = {
  id: "form-welcome", slug: "welcome-intake", title: "Welcome to TAB", description: "Tell us about your goals, routines, and preferences.", sensitivity: "general",
  sections: [
    { title: "What brings you to TAB", fields: [
      { id: "goals", type: "textarea", label: "What would you like to change, or be able to do?", required: true },
      { id: "why_now", type: "textarea", label: "Why is this important to you now?" },
    ]},
    { title: "Your life right now", fields: [
      { id: "routine", type: "textarea", label: "Describe a typical week (work, family, movement, rest)." },
      { id: "stress", type: "scale", label: "How would you rate your stress lately?", min: 1, max: 5, minLabel: "Low", maxLabel: "High" },
    ]},
    { title: "Preferences", fields: [
      { id: "delivery", type: "choice", label: "How would you like to work with us?", options: ["In person", "Virtual", "Either"] },
      { id: "communication", type: "multi", label: "How should we reach you between sessions?", options: ["Email", "Text", "Phone"] },
    ]},
  ],
};

const goalsForm: FormTemplate = {
  id: "form-review", slug: "twelve-week-reflection", title: "12-week reflection", description: "Look back before your progress review.", sensitivity: "general",
  sections: [{ title: "Looking back", fields: [
    { id: "proud", type: "textarea", label: "What are you most proud of?", required: true },
    { id: "harder", type: "textarea", label: "What was harder than expected?" },
    { id: "confidence", type: "scale", label: "How confident do you feel continuing on your own?", min: 1, max: 5, minLabel: "Not yet", maxLabel: "Very" },
  ]}],
};

const products: Product[] = [
  { id: "p1", slug: "midlife-cohort-pilot", title: "Midlife pilot cohort (8 weeks)", description: "Small-group coaching for strength, energy, and routines through midlife.", kind: "cohort", service: "womens-wellness-coaching", priceCents: 39700, active: true },
  { id: "p2", slug: "strength-foundations-self-paced", title: "Strength Foundations (self-paced)", description: "Eight weeks of guided strength sessions you can do at home.", kind: "program", service: "personal-strength-training", priceCents: 9700, active: true },
];

type Store = {
  clients: Client[];
  plans: Plan[];
  programs: ClientProgram[];
  progress: Record<string, ProgressEntry[]>;
  checkIns: Record<string, CheckIn[]>;
  appointments: Record<string, Appointment[]>;
  resources: Record<string, ResourceAssignment[]>;
  forms: Record<string, FormAssignment[]>;
  notes: Record<string, SessionNote[]>;
  reviews: Record<string, Review[]>;
  consents: Record<string, Consent[]>;
  entitlements: Record<string, Entitlement[]>;
};

function seed(): Store {
  const dana: Client = { id: DEMO_CLIENT_ID, fullName: "Dana Whitfield", preferredName: "Dana", email: "dana@example.com", phone: "", status: "active", methodStage: "transform", services: ["personal-strength-training", "womens-wellness-coaching", "massage-bodywork"], primaryPractitioner: "Your TAB practitioner", delivery: "Either", lastCheckIn: weekStart(-1) };
  const others: Client[] = [
    { id: "demo-client-marcus", fullName: "Marcus Lee", status: "active", methodStage: "align", services: ["personal-strength-training"], delivery: "In person", lastCheckIn: weekStart(0) },
    { id: "demo-client-ruth", fullName: "Ruth Alvarez", status: "active", methodStage: "start", services: ["massage-bodywork"], delivery: "In person" },
    { id: "demo-client-keisha", fullName: "Keisha Morgan", status: "paused", methodStage: "become", services: ["holistic-life-coaching"], delivery: "Virtual", lastCheckIn: weekStart(-4) },
    { id: "demo-client-tom", fullName: "Tom Brennan", status: "prospect", methodStage: "start", services: [], delivery: "Either" },
  ];
  const progress: ProgressEntry[] = [];
  const series: Record<string, number[]> = { strength_sessions: [1, 2, 2, 3, 2, 3], sleep_hours: [5.8, 6.0, 6.1, 6.4, 6.3, 6.7], energy: [2, 2, 3, 3, 3, 4], stress: [4, 4, 4, 3, 3, 3], comfort: [2, 3, 3, 3, 4, 4] };
  for (const [k, vals] of Object.entries(series)) vals.forEach((v, i) => progress.push({ metricKey: k, value: v, recordedOn: weekStart(i - vals.length + 1), source: "client" }));

  return {
    clients: [dana, ...others],
    plans: [{
      id: "plan-dana", clientId: DEMO_CLIENT_ID, title: "Stronger, steadier, and back in routine", focus: "Build strength and energy through midlife with a routine that fits a busy week.",
      services: ["personal-strength-training", "womens-wellness-coaching", "massage-bodywork"], status: "active", startDate: day(-38), reviewDate: day(46), practitionerName: "Your TAB practitioner",
      goals: [
        { id: "g1", title: "Carry groceries and lift my grandson without back pain", whyItMatters: "I want to keep up with my family.", measure: "Comfort rating and how daily tasks feel", metricKey: "comfort", target: "4 of 5 most weeks", status: "active" },
        { id: "g2", title: "Strength train three times a week", measure: "Sessions logged per week", metricKey: "strength_sessions", target: "3 per week", status: "active" },
        { id: "g3", title: "Sleep closer to seven hours", measure: "Average hours per night", metricKey: "sleep_hours", target: "7 hours", status: "active" },
      ],
    }],
    programs: [
      { id: "cp-strength", clientId: DEMO_CLIENT_ID, template: strengthTemplate, source: "assigned", status: "active", startedAt: day(-15), currentWeek: 3, completedActivityIds: ["a1", "a2", "a3", "a4", "a5", "b1", "b2", "b4"] },
      { id: "cp-rest", clientId: DEMO_CLIENT_ID, template: restTemplate, source: "assigned", status: "active", startedAt: day(-8), currentWeek: 2, completedActivityIds: ["r1a", "r1c"] },
    ],
    progress: { [DEMO_CLIENT_ID]: progress },
    checkIns: { [DEMO_CLIENT_ID]: [
      { weekOf: weekStart(-1), energy: 3, sleepQuality: 3, stress: 3, wins: "Hit three strength sessions for the first time.", challenges: "Late nights with work." },
      { weekOf: weekStart(-2), energy: 3, sleepQuality: 2, stress: 4, wins: "Walked after dinner four times.", challenges: "Knee felt stiff on step-ups." },
    ]},
    appointments: { [DEMO_CLIENT_ID]: [
      { id: "ap1", service: "personal-strength-training", startsAt: at(2, 9), location: "In person", status: "booked" },
      { id: "ap2", service: "massage-bodywork", startsAt: at(9, 14), location: "In person", status: "booked" },
      { id: "ap3", service: "womens-wellness-coaching", startsAt: at(12, 12), location: "Virtual", status: "booked" },
    ]},
    resources: { [DEMO_CLIENT_ID]: [
      { id: "rs1", title: "Strength after 40: what changes and what doesn’t", kind: "Article", note: "A quick read before our next session.", href: "/resources", assignedAt: day(-6) },
      { id: "rs2", title: "A five-minute evening wind-down", kind: "Guide", href: "/resources", assignedAt: day(-3), viewedAt: day(-2) },
    ]},
    forms: { [DEMO_CLIENT_ID]: [
      { template: welcomeForm, status: "submitted", submittedAt: day(-40), answers: { goals: "Feel strong again and sleep better." } },
      { template: goalsForm, status: "not_started", dueOn: day(40) },
    ]},
    notes: { [DEMO_CLIENT_ID]: [
      { id: "n1", date: day(-5), service: "personal-strength-training", visibility: "shared", body: "Great session. Step-ups felt better with the lower box; keep that height this week and focus on slow lowering.", author: "Your TAB practitioner" },
      { id: "n2", date: day(-5), service: "personal-strength-training", visibility: "internal", body: "Mild left knee stiffness on step-ups; regress to lower box. Revisit at week 4.", author: "Your TAB practitioner" },
      { id: "n3", date: day(-19), service: "massage-bodywork", visibility: "shared", body: "Focused on upper back and hips. Try the doorway stretch twice a day.", author: "Your TAB practitioner" },
    ]},
    reviews: { [DEMO_CLIENT_ID]: [
      { id: "rv1", date: day(-10), summary: "Four weeks in, you’re training consistently and your comfort scores are climbing. Sleep is the next focus.", nextSteps: "Start Rest & Reset; keep three strength sessions.", stage: "transform" },
    ]},
    consents: { [DEMO_CLIENT_ID]: [
      { type: "terms", label: "Terms of service", granted: true, required: true, updatedAt: day(-40) },
      { type: "privacy", label: "Privacy policy", granted: true, required: true, updatedAt: day(-40) },
      { type: "health_info_collection", label: "Collect health information for safe care", granted: true, required: true, updatedAt: day(-40) },
      { type: "care_coordination", label: "Share updates with my healthcare providers when I ask", granted: false, required: false },
      { type: "marketing_email", label: "News, guides, and events by email", granted: true, required: false, updatedAt: day(-40) },
      { type: "marketing_sms", label: "Occasional text messages", granted: false, required: false },
    ]},
    entitlements: { [DEMO_CLIENT_ID]: [] },
  };
}

// Persist across hot reloads in development.
const g = globalThis as unknown as { __tabMockStore?: Store };
const store = (g.__tabMockStore ??= seed());

const clone = <T>(v: T): T => structuredClone(v);

export const mockRepository: PortalRepository = {
  async getDashboard(clientId) {
    const client = (await this.getClient(clientId))!;
    const programs = await this.listClientPrograms(clientId);
    const todaysActivities = programs.flatMap((p) => {
      const mod = p.template.modules.find((m) => m.week === p.currentWeek) ?? p.template.modules.at(-1);
      return (mod?.activities ?? []).filter((a) => a.kind !== "check_in").slice(0, 4).map((activity) => ({ program: p, activity, done: p.completedActivityIds.includes(activity.id) }));
    });
    const checkIns = store.checkIns[clientId] ?? [];
    const appts = (store.appointments[clientId] ?? []).filter((a) => a.startsAt > new Date().toISOString()).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    const forms = (store.forms[clientId] ?? []).filter((f) => f.status === "not_started" || f.status === "draft");
    return clone({
      client, plan: (await this.getPlan(clientId)) ?? undefined, nextAppointment: appts[0], programs, todaysActivities,
      checkInDue: !checkIns.some((c) => c.weekOf === weekStart(0)), resources: (store.resources[clientId] ?? []).slice(0, 3), pendingForms: forms,
      latestSharedReview: (store.reviews[clientId] ?? [])[0],
    } satisfies Dashboard);
  },
  async getClient(id) { return clone(store.clients.find((c) => c.id === id) ?? null); },
  async getPlan(clientId) { return clone(store.plans.find((p) => p.clientId === clientId && p.status === "active") ?? null); },
  async listClientPrograms(clientId) { return clone(store.programs.filter((p) => p.clientId === clientId)); },
  async getClientProgram(clientId, id) { return clone(store.programs.find((p) => p.clientId === clientId && p.id === id) ?? null); },
  async toggleActivity(clientId, programId, activityId, done) {
    const p = store.programs.find((x) => x.clientId === clientId && x.id === programId);
    if (!p) return;
    p.completedActivityIds = done ? [...new Set([...p.completedActivityIds, activityId])] : p.completedActivityIds.filter((a) => a !== activityId);
  },
  async listMetrics() { return clone(metrics); },
  async listProgress(clientId) { return clone(store.progress[clientId] ?? []); },
  async addProgress(clientId, e) { (store.progress[clientId] ??= []).push({ ...e, source: "client" }); },
  async listCheckIns(clientId) { return clone(store.checkIns[clientId] ?? []); },
  async saveCheckIn(clientId, c) {
    const list = (store.checkIns[clientId] ??= []);
    const i = list.findIndex((x) => x.weekOf === c.weekOf);
    if (i >= 0) list[i] = c; else list.unshift(c);
    const client = store.clients.find((x) => x.id === clientId);
    if (client) client.lastCheckIn = c.weekOf;
    const push = (k: string, v?: number) => v != null && (store.progress[clientId] ??= []).push({ metricKey: k, value: v, recordedOn: c.weekOf, source: "client" });
    push("energy", c.energy); push("stress", c.stress);
  },
  async listAppointments(clientId) { return clone((store.appointments[clientId] ?? []).sort((a, b) => a.startsAt.localeCompare(b.startsAt))); },
  async listResources(clientId) { return clone(store.resources[clientId] ?? []); },
  async listForms(clientId) { return clone(store.forms[clientId] ?? []); },
  async getForm(clientId, slug) { return clone((store.forms[clientId] ?? []).find((f) => f.template.slug === slug) ?? null); },
  async submitForm(clientId, slug, answers, final) {
    const f = (store.forms[clientId] ?? []).find((x) => x.template.slug === slug);
    if (!f) return;
    f.answers = answers; f.status = final ? "submitted" : "draft"; if (final) f.submittedAt = day(0);
  },
  async listSharedReviews(clientId) { return clone(store.reviews[clientId] ?? []); },
  async listConsents(clientId) { return clone(store.consents[clientId] ?? []); },
  async setConsent(clientId, type, granted) {
    const c = (store.consents[clientId] ?? []).find((x) => x.type === type);
    if (c && !c.required) { c.granted = granted; c.updatedAt = day(0); }
  },
  async updateContact(clientId, data) { const c = store.clients.find((x) => x.id === clientId); if (c) Object.assign(c, data); },
  async listProducts() { return clone(products.filter((p) => p.active)); },
  async listEntitlements(clientId) { return clone(store.entitlements[clientId] ?? []); },
  async listClients(_viewer: Viewer) { return clone(store.clients); },
  async listNotes(clientId, includeInternal) { return clone((store.notes[clientId] ?? []).filter((n) => includeInternal || n.visibility === "shared")); },
  async addNote(clientId, viewer, note) { (store.notes[clientId] ??= []).unshift({ id: `n${Date.now()}`, date: day(0), author: viewer.name, ...note }); },
  async listProgramTemplates() { return clone([strengthTemplate, restTemplate]); },
};
