/**
 * Demo data for reviewing My TAB without a database (portal.dataSource = "mock").
 * Everything here is fictional. State lives in memory and resets when the server restarts.
 */
import type {
  Activity, Appointment, CheckIn, Client, ClientProgram, Consent, Dashboard, Entitlement, FormAssignment, FormTemplate,
  Inquiry, MetricDefinition, Plan, PlanEntry, PortalRepository, PractitionerSummary, Product, ProgramAssignmentInput, ProgramDraftInput, ProgramTemplate, ProgressEntry, ResourceAssignment, Review, SessionNote, StageChange, Viewer,
} from "./types";
import { activityMap, currentWeekFor, isActivityInProgram, personalizedModules } from "./programs";

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
  id: "tpl-strength-foundations", familyId: "tpl-strength-foundations", slug: "strength-foundations", title: "Strength Foundations", service: "personal-strength-training", durationWeeks: 8, status: "published", version: 1,
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
  id: "tpl-rest-reset", familyId: "tpl-rest-reset", slug: "rest-and-reset", title: "Rest & Reset", service: "womens-wellness-coaching", durationWeeks: 4, status: "published", version: 1,
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

/** A draft submitted for review, to show the program editor's workflow (C7). */
const deskDraft: ProgramTemplate = {
  id: "tpl-desk-reset", familyId: "tpl-desk-reset", slug: "desk-reset", title: "Desk Reset", service: "personal-strength-training", durationWeeks: 2, status: "draft", version: 1,
  summary: "Five-minute movement breaks for long days at a desk.", submittedAt: new Date(Date.now() - 86400000).toISOString(),
  modules: [
    { id: "d1", week: 1, title: "Week 1: Move every hour", activities: [
      act("d1a", "exercise", "Chin tucks", "Sit tall, draw your chin straight back, hold for a breath.", { reps: "10" }),
      act("d1b", "habit", "Stand up every hour", undefined, { frequency: "workdays" }),
    ]},
    { id: "d2", week: 2, title: "Week 2: Open the chest", activities: [
      act("d2a", "exercise", "Doorway stretch", "Forearms on the frame, step through gently.", { duration: "30 sec", sets: 2 }),
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

const routineForm: FormTemplate = {
  id: "form-routine", slug: "weekly-routine", title: "Your weekly routine", description: "A quick picture of your week so we can plan around it.", sensitivity: "general",
  sections: [{ title: "Your week", fields: [
    { id: "busy_days", type: "multi", label: "Which days are usually busiest?", options: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] },
    { id: "best_time", type: "choice", label: "When do you have the most energy?", options: ["Morning", "Midday", "Evening"] },
    { id: "minutes", type: "scale", label: "How many minutes a day could you realistically give to your plan?", min: 1, max: 5, minLabel: "5 or fewer", maxLabel: "30 or more" },
  ]}],
};
/** Published form templates a practitioner can assign in the demo. */
const formLibrary = [welcomeForm, goalsForm, routineForm];

const products: Product[] = [
  { id: "p1", slug: "midlife-cohort-pilot", title: "Midlife pilot cohort (8 weeks)", description: "Small-group coaching for strength, energy, and routines through midlife.", kind: "cohort", service: "womens-wellness-coaching", priceCents: 39700, active: true },
  { id: "p2", slug: "strength-foundations-self-paced", title: "Strength Foundations (self-paced)", description: "Eight weeks of guided strength sessions you can do at home.", kind: "program", service: "personal-strength-training", priceCents: 9700, active: true },
];

type Store = {
  /** Every version of every program (C7). */
  templates: ProgramTemplate[];
  practitioners: PractitionerSummary[];
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
  stageChanges: Record<string, StageChange[]>;
  planEntries: Record<string, PlanEntry[]>;
  consents: Record<string, Consent[]>;
  entitlements: Record<string, Entitlement[]>;
  inquiries: Inquiry[];
};

function seed(): Store {
  const dana: Client = { id: DEMO_CLIENT_ID, fullName: "Dana Whitfield", preferredName: "Dana", email: "dana@example.com", phone: "", status: "active", methodStage: "transform", services: ["personal-strength-training", "womens-wellness-coaching", "massage-bodywork"], primaryPractitioner: "Your TAB practitioner", delivery: "Either", lastCheckIn: weekStart(-1),
    myTab: { status: "active", invitedAt: day(-42), activatedAt: day(-41) } };
  const others: Client[] = [
    { id: "demo-client-marcus", fullName: "Marcus Lee", email: "marcus.lee@example.com", myTab: { status: "invited", invitedAt: day(-2) }, status: "active", methodStage: "align", services: ["personal-strength-training"], delivery: "In person", lastCheckIn: weekStart(0) },
    { id: "demo-client-ruth", fullName: "Ruth Alvarez", status: "active", methodStage: "start", services: ["massage-bodywork"], delivery: "In person" },
    { id: "demo-client-keisha", fullName: "Keisha Morgan", status: "paused", methodStage: "become", services: ["holistic-life-coaching"], delivery: "Virtual", lastCheckIn: weekStart(-4) },
    { id: "demo-client-tom", fullName: "Tom Brennan", email: "tom.brennan@example.com", status: "prospect", methodStage: "start", services: [], delivery: "Either" },
  ];
  const progress: ProgressEntry[] = [];
  const series: Record<string, number[]> = { strength_sessions: [1, 2, 2, 3, 2, 3], sleep_hours: [5.8, 6.0, 6.1, 6.4, 6.3, 6.7], energy: [2, 2, 3, 3, 3, 4], stress: [4, 4, 4, 3, 3, 3], comfort: [2, 3, 3, 3, 4, 4] };
  for (const [k, vals] of Object.entries(series)) vals.forEach((v, i) => progress.push({ metricKey: k, value: v, recordedOn: weekStart(i - vals.length + 1), source: "client" }));

  return {
    templates: [strengthTemplate, restTemplate, deskDraft],
    practitioners: [
      { id: DEMO_PRACTITIONER_ID, name: "Your TAB practitioner", role: "owner", active: true, canPublish: true, capabilities: ["nutrition"] },
      { id: "demo-practitioner-avery", name: "Avery Brooks (demo practitioner)", role: "practitioner", active: true, canPublish: false, capabilities: [] },
    ],
    clients: [dana, ...others],
    plans: [{
      id: "plan-dana", clientId: DEMO_CLIENT_ID, planType: "wellness", visibleToClient: true, details: {}, title: "Stronger, steadier, and back in routine", focus: "Build strength and energy through midlife with a routine that fits a busy week.",
      services: ["personal-strength-training", "womens-wellness-coaching", "massage-bodywork"], status: "active", startDate: day(-38), reviewDate: day(46), practitionerName: "Your TAB practitioner",
      goals: [
        { id: "g1", title: "Carry groceries and lift my grandson without back pain", whyItMatters: "I want to keep up with my family.", measure: "Comfort rating and how daily tasks feel", metricKey: "comfort", target: "4 of 5 most weeks", status: "active" },
        { id: "g2", title: "Strength train three times a week", measure: "Sessions logged per week", metricKey: "strength_sessions", target: "3 per week", status: "active" },
        { id: "g3", title: "Sleep closer to seven hours", measure: "Average hours per night", metricKey: "sleep_hours", target: "7 hours", status: "active" },
      ],
    }, {
      id: "plan-dana-massage", clientId: DEMO_CLIENT_ID, planType: "massage-bodywork", parentPlanId: "plan-dana", visibleToClient: true,
      title: "Ease upper back and hip tension", services: ["massage-bodywork"], status: "active", startDate: day(-30), reviewDate: day(30), practitionerName: "Your TAB practitioner", goals: [],
      details: { focus_areas: "Upper back, shoulders, and hips.", session_frequency: "Every three weeks.", techniques_pressure: "Medium pressure; slower work around the shoulders.", response_aftercare: "Doorway stretch twice a day; a short walk the evening after a session." },
      privateDetails: { contraindication_notes: "Prefers side-lying for hip work." },
    }, {
      id: "plan-dana-strength", clientId: DEMO_CLIENT_ID, planType: "personal-strength-training", parentPlanId: "plan-dana", visibleToClient: false,
      title: "Strength block 2 (draft)", services: ["personal-strength-training"], status: "draft", practitionerName: "Your TAB practitioner", goals: [],
      details: { training_focus: "Hinge and single-leg strength.", weekly_structure: "Three 30-minute sessions: two at home, one with a coach." }, privateDetails: { movement_notes: "Keep step-ups on the low box until week 4." },
    }],
    programs: [
      { id: "cp-strength", clientId: DEMO_CLIENT_ID, template: strengthTemplate, templateVersion: 1, planId: "plan-dana", source: "assigned", status: "active", startedAt: day(-15), currentWeek: 3, completedActivityIds: ["a1", "a2", "a3", "a4", "a5", "b1", "b2", "b4"],
        personalization: {
          note: "I’ve adjusted week 2 around how your knee felt on step-ups. Keep everything slow and controlled.",
          activities: { b3: { note: "Use the low box and hold the rail.", prescription: { reps: "4 each side" } } },
        },
        customActivities: [{ id: "cx1", week: 3, kind: "habit", title: "Calf stretch after your evening walk", instructions: "Thirty seconds each side, against a wall." }] },
      { id: "cp-rest", clientId: DEMO_CLIENT_ID, template: restTemplate, templateVersion: 1, planId: "plan-dana", source: "assigned", status: "active", startedAt: day(-8), currentWeek: 2, completedActivityIds: ["r1a", "r1c"], personalization: {}, customActivities: [] },
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
      { id: "fa-welcome", template: welcomeForm, status: "submitted", submittedAt: day(-40), answers: { goals: "Feel strong again and sleep better." } },
      { id: "fa-reflection", template: goalsForm, status: "not_started", dueOn: day(40) },
    ]},
    notes: { [DEMO_CLIENT_ID]: [
      { id: "n1", date: day(-5), service: "personal-strength-training", visibility: "shared", body: "Great session. Step-ups felt better with the lower box; keep that height this week and focus on slow lowering.", author: "Your TAB practitioner" },
      { id: "n2", date: day(-5), service: "personal-strength-training", visibility: "internal", body: "Mild left knee stiffness on step-ups; regress to lower box. Revisit at week 4.", author: "Your TAB practitioner" },
      { id: "n3", date: day(-19), service: "massage-bodywork", visibility: "shared", body: "Focused on upper back and hips. Try the doorway stretch twice a day.", author: "Your TAB practitioner" },
    ]},
    reviews: { [DEMO_CLIENT_ID]: [
      { id: "rv1", date: day(-10), summary: "Four weeks in, you’re training consistently and your comfort scores are climbing. Sleep is the next focus.", nextSteps: "Start Rest & Reset; keep three strength sessions.", stage: "transform",
        shared: true, outcome: "adjust", author: "Your TAB practitioner",
        reflections: { changed: "Training three times most weeks; carrying groceries feels easier.", difficult: "Sleep is still short on work nights.", learned: "Short sessions I can repeat beat long ones I skip.", circumstances: ["Schedule"] } },
    ]},
    planEntries: {
      "plan-dana-massage": [
        { id: "pe2", planId: "plan-dana-massage", date: day(-19), body: "Upper back much looser than last visit. Keep the doorway stretch going.", visibility: "shared", author: "Your TAB practitioner" },
        { id: "pe1", planId: "plan-dana-massage", date: day(-40), body: "Guarding around the right shoulder; lighter pressure there next time.", visibility: "internal", author: "Your TAB practitioner" },
      ],
    },
    stageChanges: { [DEMO_CLIENT_ID]: [
      { id: "sc1", from: "start", to: "transform", changedAt: at(-10, 10), changedBy: "Your TAB practitioner", reviewId: "rv1" },
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
    // Fictional Start and contact submissions for reviewing the owner workflow.
    inquiries: [
      { id: "inq-jordan", reference: "DEMO-3", kind: "start", receivedAt: at(-1, 19), name: "Jordan Price", email: "jordan.price@example.com", phone: "", contactPreference: "email",
        journey: "exploring", help: ["feel-better", "stronger", "not-sure"], serviceInterest: "not-sure", outcomes: ["energy", "strength", "keep-up"],
        considerations: ["talk-first", "schedule"], delivery: "either", availability: ["weekday-evenings"], foundVia: "search", marketingOptIn: true, flags: [] },
      { id: "inq-alex", reference: "DEMO-2", kind: "contact", receivedAt: at(-2, 13), name: "Alex Rivera", email: "alex.rivera@example.com", contactPreference: "phone",
        topic: "gift-cards", message: "Do you still offer gift cards? I’d like one for my sister’s birthday next month.", help: [], outcomes: [], considerations: [], availability: [], marketingOptIn: false, flags: [] },
      { id: "inq-flagged", reference: "DEMO-4", kind: "contact", receivedAt: at(-3, 3), name: "Pat Example", email: "pat.example@example.com", contactPreference: "email",
        topic: "partnerships", message: "Hello, we help wellness studios grow. See our offer at https://example.com/offer", help: [], outcomes: [], considerations: [], availability: [],
        marketingOptIn: false, flags: ["links"] },
      { id: "inq-tom", reference: "DEMO-1", kind: "start", receivedAt: at(-6, 10), name: "Tom Brennan", email: "tom.brennan@example.com", contactPreference: "phone",
        journey: "ready", help: ["stronger", "movement", "exercise"], serviceInterest: "personal-strength-training", outcomes: ["independence", "keep-up"],
        considerations: ["health-private"], delivery: "in-person", availability: ["weekday-mornings"], foundVia: "friend", marketingOptIn: false, flags: [],
        clientId: "demo-client-tom", clientName: "Tom Brennan", routingOutcome: "discovery", routingNote: "Call booked for Thursday.", routedAt: at(-5, 9) },
    ],
  };
}

// Persist across hot reloads in development.
const g = globalThis as unknown as { __tabMockStore?: Store };
const store = (g.__tabMockStore ??= seed());
store.stageChanges ??= {};
store.planEntries ??= {}; // a store created before stage history existed (dev hot reload)

const clone = <T>(v: T): T => structuredClone(v);
/** Client-only activities from the form: ids from this program are kept, new rows get an id (as save_client_activities). */
const withIds = (items: ProgramAssignmentInput["customActivities"], kept: Set<string>) =>
  items.map((c, i) => ({ ...c, id: c.id && kept.has(c.id) ? c.id : `cx${Date.now()}-${i}` }));
/** A draft's content from the editor: ids from this draft are kept, anything else gets a new id (as in save_program_draft). */
function buildModules(input: ProgramDraftInput["modules"], current: ProgramTemplate["modules"]): ProgramTemplate["modules"] {
  const moduleIds = new Set(current.map((m) => m.id));
  const existing = new Map(current.flatMap((m) => m.activities).map((a) => [a.id, a]));
  const activityIds = new Set(existing.keys());
  const n = Date.now();
  return input.map((m, i) => ({
    id: m.id && moduleIds.has(m.id) ? m.id : `m${n}-${i}`, week: m.week, title: m.title, body: m.body,
    activities: m.activities.map((a, j) => ({
      id: a.id && activityIds.has(a.id) ? a.id : `a${n}-${i}-${j}`, kind: a.kind, title: a.title, instructions: a.instructions,
      prescription: Object.keys(a.prescription).length ? a.prescription : undefined,
      sourceActivityId: a.id ? existing.get(a.id)?.sourceActivityId : undefined,
    })),
  }));
}
const withWeek = (p: ClientProgram): ClientProgram => ({ ...p, currentWeek: currentWeekFor(p.startedAt, p.template.durationWeeks) });
/** Practitioner-only sections are only ever returned to staff (plan_private_details in the database). */
const stripPrivate = (p: Plan | null) => (p ? { ...p, privateDetails: undefined } : p);

export const mockRepository: PortalRepository = {
  async getDashboard(clientId) {
    const client = (await this.getClient(clientId))!;
    const programs = (await this.listClientPrograms(clientId)).filter((p) => p.status === "active");
    const todaysActivities = programs.flatMap((p) => {
      const modules = personalizedModules(p);
      const mod = modules.find((m) => m.week === p.currentWeek) ?? modules.at(-1);
      return (mod?.activities ?? []).filter((a) => a.kind !== "check_in").slice(0, 4).map((activity) => ({ program: p, activity, done: p.completedActivityIds.includes(activity.id) }));
    });
    const checkIns = store.checkIns[clientId] ?? [];
    const appts = (store.appointments[clientId] ?? []).filter((a) => a.startsAt > new Date().toISOString()).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    const forms = (store.forms[clientId] ?? []).filter((f) => f.status === "not_started" || f.status === "draft");
    return clone({
      client, plan: (await this.getPlan(clientId)) ?? undefined, nextAppointment: appts[0], programs, todaysActivities,
      checkInDue: !checkIns.some((c) => c.weekOf === weekStart(0)), resources: (store.resources[clientId] ?? []).slice(0, 3), pendingForms: forms,
      latestSharedReview: (store.reviews[clientId] ?? []).find((r) => r.shared),
      latestStageChange: (store.stageChanges[clientId] ?? [])[0],
    } satisfies Dashboard);
  },
  async getClient(id) { return clone(store.clients.find((c) => c.id === id) ?? null); },
  async getPlan(clientId) { return clone(stripPrivate(store.plans.find((p) => p.clientId === clientId && p.planType === "wellness" && p.status === "active") ?? null)); },
  async listClientPrograms(clientId) { return clone(store.programs.filter((p) => p.clientId === clientId).map(withWeek)); },
  async getClientProgram(clientId, id) { const p = store.programs.find((x) => x.clientId === clientId && x.id === id); return clone(p ? withWeek(p) : null); },
  async toggleActivity(clientId, programId, activityId, done) {
    const p = store.programs.find((x) => x.clientId === clientId && x.id === programId);
    if (!p) return;
    if (done && !isActivityInProgram(p, activityId)) throw new Error("That activity is not part of this program");
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
  async listSharedReviews(clientId) { return clone((store.reviews[clientId] ?? []).filter((r) => r.shared)); },
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
  async listProgramTemplates() { return clone(store.templates); },
  async getProgramTemplate(id) { return clone(store.templates.find((t) => t.id === id) ?? null); },
  // The rules below mirror guard_program_template and save_program_draft (20261003000000_program_editor.sql).
  async saveProgramDraft(_viewer, input) {
    const details = { title: input.title, summary: input.summary, service: input.service, durationWeeks: input.durationWeeks };
    if (!input.id) {
      const id = `tpl-${Date.now()}`;
      const base = input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "program";
      const slug = store.templates.some((t) => t.slug === base) ? `${base}-${id.slice(-4)}` : base;
      store.templates.push({ id, familyId: id, slug, version: 1, status: "draft", ...details, modules: buildModules(input.modules, []) });
      return id;
    }
    const t = store.templates.find((x) => x.id === input.id);
    if (!t) throw new Error("Program not found");
    if (t.status !== "draft") throw new Error("Published programs can't be edited; start a new version");
    Object.assign(t, details, { modules: buildModules(input.modules, t.modules) });
    return t.id;
  },
  async runProgramAction(viewer, id, action) {
    const t = store.templates.find((x) => x.id === id);
    if (!t) throw new Error("Program not found");
    const family = store.templates.filter((x) => x.familyId === t.familyId);
    const needPublish = () => { if (!(viewer.role === "owner" || viewer.canPublish)) throw new Error("Publishing needs the publishing permission"); };
    const needDraft = () => { if (t.status !== "draft") throw new Error("Published programs can't be edited; start a new version"); };
    switch (action) {
      case "submit": needDraft(); t.submittedAt = new Date().toISOString(); return t.id;
      case "publish":
        needPublish(); needDraft();
        family.filter((x) => x.status === "published").forEach((x) => { x.status = "retired"; });
        Object.assign(t, { status: "published", publishedAt: new Date().toISOString(), submittedAt: undefined });
        return t.id;
      case "retire":
        needPublish();
        if (t.status !== "published") throw new Error("Only a published program can be retired");
        t.status = "retired";
        return t.id;
      case "new_version": {
        const draft = family.find((x) => x.status === "draft");
        if (draft) return draft.id;
        const latest = family.reduce((a, b) => (b.version > a.version ? b : a));
        const n = Date.now();
        const copy: ProgramTemplate = {
          ...clone(latest), id: `tpl-${n}`, version: latest.version + 1, status: "draft", submittedAt: undefined, publishedAt: undefined,
          modules: latest.modules.map((m, i) => ({ ...clone(m), id: `m${n}-${i}`, activities: m.activities.map((a, j) => ({ ...clone(a), id: `a${n}-${i}-${j}`, sourceActivityId: a.id })) })),
        };
        store.templates.push(copy);
        return copy.id;
      }
      case "discard": {
        needDraft();
        store.templates.splice(store.templates.indexOf(t), 1);
        const rest = family.filter((x) => x !== t);
        return rest.length ? rest.reduce((a, b) => (b.version > a.version ? b : a)).id : null;
      }
    }
  },
  async saveClientProgram(clientId, _viewer, input) {
    // Mirrors client_programs_guard: published templates only, version pinned, client and template fixed.
    if (input.id) {
      const p = store.programs.find((x) => x.clientId === clientId && x.id === input.id);
      if (!p) throw new Error("Program not found");
      if (p.template.id !== input.templateId) throw new Error("An assigned program keeps its client, program and version");
      const kept = new Set(p.customActivities.map((c) => c.id));
      const customActivities = withIds(input.customActivities, kept);
      // Removing a client-only activity removes its completion too (as the database's cascade does).
      const remaining = new Set([...p.template.modules.flatMap((m) => m.activities.map((a) => a.id)), ...customActivities.map((c) => c.id)]);
      Object.assign(p, { startedAt: input.startedAt, status: input.status, planId: input.planId, personalization: input.personalization, customActivities,
        completedActivityIds: p.completedActivityIds.filter((id) => remaining.has(id)),
        completedAt: input.status === "completed" ? (p.completedAt ?? day(0)) : undefined });
      return p.id;
    }
    const found = store.templates.find((t) => t.id === input.templateId);
    if (found?.status !== "published") throw new Error("Only published programs can be assigned");
    const template = clone(found);
    const id = `cp${Date.now()}`;
    store.programs.unshift({ id, clientId, template, templateVersion: template.version, source: "assigned", status: input.status, startedAt: input.startedAt,
      completedAt: input.status === "completed" ? day(0) : undefined, currentWeek: 1, completedActivityIds: [], planId: input.planId, personalization: input.personalization,
      customActivities: withIds(input.customActivities, new Set()) });
    return id;
  },
  async moveClientProgram(clientId, programId, _viewer, targetTemplateId) {
    // Mirrors move_client_program and guard_client_program (20261004000000_program_moves_custom_activities.sql).
    const p = store.programs.find((x) => x.clientId === clientId && x.id === programId);
    if (!p) throw new Error("Program not found");
    const target = store.templates.find((t) => t.id === targetTemplateId);
    if (!target || target.status !== "published" || target.familyId !== p.template.familyId || target.version <= p.templateVersion) {
      throw new Error("A program can only move to a newer published version of itself");
    }
    const map = activityMap(p.template, target, store.templates);
    const old = p.personalization.activities ?? {};
    const activities = Object.fromEntries(Object.entries(old).flatMap(([id, adj]) => (map.has(id) ? [[map.get(id)!, adj]] : [])));
    const personalization = { ...(p.personalization.note && { note: p.personalization.note }), ...(Object.keys(activities).length && { activities }) };
    const custom = new Set(p.customActivities.map((c) => c.id));
    const carried = p.completedActivityIds.filter((id) => map.has(id) && !activities[map.get(id)!]?.skip).map((id) => map.get(id)!);
    Object.assign(p, { template: clone(target), templateVersion: target.version, personalization,
      completedActivityIds: [...carried, ...p.completedActivityIds.filter((id) => custom.has(id))] });
    return carried.length;
  },
  async listPractitioners() { return clone(store.practitioners); },
  async updatePractitioner(id, changes) {
    const x = store.practitioners.find((p) => p.id === id);
    if (!x) throw new Error("Practitioner not found");
    Object.assign(x, changes);
  },
  async listReviews(clientId) { return clone(store.reviews[clientId] ?? []); },
  async recordProgressReview(clientId, viewer, input) {
    const client = store.clients.find((c) => c.id === clientId);
    if (!client) throw new Error("Client not found");
    const id = `rv${Date.now()}`;
    const newStage = input.newStage && input.newStage !== client.methodStage ? input.newStage : undefined;
    (store.reviews[clientId] ??= []).unshift({
      id, date: day(0), summary: input.summaryForClient ?? "", nextSteps: input.nextSteps, stage: newStage ?? client.methodStage,
      shared: input.share, outcome: input.outcome, reflections: input.reflections, author: viewer.name,
    });
    if (!newStage) return { stageChanged: false };
    (store.stageChanges[clientId] ??= []).unshift({ id: `sc${Date.now()}`, from: client.methodStage, to: newStage, changedAt: new Date().toISOString(), changedBy: viewer.name, reviewId: id });
    client.methodStage = newStage;
    return { stageChanged: true };
  },
  async listStageChanges(clientId) { return clone(store.stageChanges[clientId] ?? []); },
  async listPlans(clientId, { staff }) {
    const plans = store.plans.filter((p) => p.clientId === clientId && p.status !== "archived" && (staff || p.visibleToClient));
    return clone(staff ? plans : plans.map((p) => stripPrivate(p)!));
  },
  async savePlan(clientId, viewer, input) {
    const client = store.clients.find((c) => c.id === clientId);
    if (!client) throw new Error("Client not found");
    const existing = input.id ? store.plans.find((p) => p.id === input.id && p.clientId === clientId) : undefined;
    if (input.id && !existing) throw new Error("Plan not found");
    // The same rules the database enforces (typed_plans migration).
    const nutrition = input.planType === "nutrition" || existing?.planType === "nutrition";
    if (nutrition && !viewer.capabilities?.includes("nutrition")) throw new Error("Nutrition plans need the nutrition coaching credential.");
    const anchor = store.plans.find((p) => p.clientId === clientId && p.planType === "wellness" && p.status === "active" && p.id !== input.id);
    if (input.planType === "wellness" && input.status === "active" && anchor) throw new Error("This client already has an active Wellness Plan.");
    if (input.planType !== "wellness" && !anchor && !existing?.parentPlanId) throw new Error("Create the Wellness Plan first.");
    const plan: Plan = {
      id: existing?.id ?? `plan-${Date.now()}`, clientId, planType: input.planType, parentPlanId: input.planType === "wellness" ? undefined : existing?.parentPlanId ?? anchor?.id,
      visibleToClient: input.visibleToClient, details: input.details, privateDetails: input.privateDetails, title: input.title, focus: input.focus,
      services: input.planType === "wellness" || input.planType === "nutrition" ? existing?.services ?? [] : [input.planType], status: input.status,
      startDate: input.startDate ?? existing?.startDate, reviewDate: input.reviewDate, practitionerName: existing?.practitionerName ?? viewer.name,
      goals: input.planType === "wellness" && input.goals
        ? input.goals.map((g, i) => ({ id: g.id || `g${Date.now()}-${i}`, title: g.title, whyItMatters: g.whyItMatters, measure: g.measure, target: g.target, status: g.status ?? "active",
            metricKey: existing?.goals.find((x) => x.id === g.id)?.metricKey }))
        : existing?.goals ?? [],
    };
    if (existing) Object.assign(existing, plan); else store.plans.push(plan);
    return plan.id;
  },
  async listPlanEntries(clientId, planId, includeInternal) {
    const plan = store.plans.find((p) => p.id === planId && p.clientId === clientId);
    if (!plan || (!includeInternal && !plan.visibleToClient)) return [];
    return clone((store.planEntries[planId] ?? []).filter((e) => includeInternal || e.visibility === "shared"));
  },
  async addPlanEntry(clientId, planId, viewer, entry) {
    const plan = store.plans.find((p) => p.id === planId && p.clientId === clientId);
    if (!plan) throw new Error("Plan not found");
    if (plan.planType === "nutrition" && !viewer.capabilities?.includes("nutrition")) throw new Error("Nutrition plans need the nutrition coaching credential.");
    (store.planEntries[planId] ??= []).unshift({ id: `pe${Date.now()}`, planId, date: entry.date ?? day(0), body: entry.body, visibility: entry.visibility, author: viewer.name });
  },
  async listInquiries() { return clone([...store.inquiries].sort((a, b) => b.receivedAt.localeCompare(a.receivedAt))); },
  async getInquiry(id) {
    const inquiry = store.inquiries.find((i) => i.id === id);
    if (!inquiry) return null;
    const email = inquiry.email.toLowerCase();
    return clone({
      inquiry,
      matches: store.clients.filter((c) => c.email?.toLowerCase() === email && c.id !== inquiry.clientId),
      related: store.inquiries.filter((i) => i.id !== id && i.email.toLowerCase() === email),
    });
  },
  async routeInquiry(id, outcome, note) {
    const i = store.inquiries.find((x) => x.id === id);
    if (!i) return;
    if (i.routingOutcome !== (outcome ?? undefined)) i.routedAt = outcome ? new Date().toISOString() : undefined;
    i.routingOutcome = outcome ?? undefined;
    i.routingNote = note;
  },
  async linkInquiries(id, clientId) {
    const inquiry = store.inquiries.find((x) => x.id === id);
    const client = store.clients.find((c) => c.id === clientId);
    if (!inquiry || !client) return 0;
    const email = inquiry.email.toLowerCase();
    const targets = store.inquiries.filter((i) => i.id === id || (!i.clientId && i.email.toLowerCase() === email));
    targets.forEach((i) => { i.clientId = client.id; i.clientName = client.fullName; });
    return targets.length;
  },
  async inviteClient(clientId) {
    // Mirrors clients_invite_stamp: the care team invites; demo mode never sends email (lib/email.ts does the same).
    const c = store.clients.find((x) => x.id === clientId);
    if (!c) throw new Error("Client not found");
    if (c.myTab?.status === "active") return "already_active";
    if (!c.email) throw new Error("Add the client's email address first.");
    c.myTab = { status: "invited", invitedAt: new Date().toISOString() };
    console.info("[invite] My TAB invitation: not sent (demo mode)");
    return "skipped";
  },
  async listFormTemplates() { return clone(formLibrary); },
  async assignForm(clientId, _viewer, input) {
    const template = formLibrary.find((t) => t.id === input.templateId);
    if (!template) throw new Error("Only published forms can be assigned");
    const list = (store.forms[clientId] ??= []);
    if (list.some((f) => f.template.id === template.id && f.status !== "submitted" && f.status !== "reviewed")) throw new Error("That form is already waiting for this client.");
    list.push({ id: `fa${Date.now()}`, template: clone(template), dueOn: input.dueOn, status: "not_started" });
  },
  async withdrawForm(clientId, assignmentId) {
    const list = store.forms[clientId] ?? [];
    const f = list.find((x) => x.id === assignmentId);
    if (!f) throw new Error("Form not found");
    if (f.status !== "not_started") throw new Error("A form the client has started stays assigned");
    list.splice(list.indexOf(f), 1);
  },
  async assignResource(clientId, _viewer, input) {
    (store.resources[clientId] ??= []).unshift({ id: `rs${Date.now()}`, title: input.title, kind: input.kind, note: input.note, href: input.href, assignedAt: day(0) });
  },
  async markResourceViewed(clientId, assignmentId) {
    const r = (store.resources[clientId] ?? []).find((x) => x.id === assignmentId);
    if (r && !r.viewedAt) r.viewedAt = day(0);
  },
  async removeResource(clientId, assignmentId) {
    store.resources[clientId] = (store.resources[clientId] ?? []).filter((r) => r.id !== assignmentId);
  },
  async createClientFromInquiry(id) {
    const inquiry = store.inquiries.find((x) => x.id === id);
    if (!inquiry) throw new Error("Submission not found");
    const client: Client = { id: `demo-client-${Date.now()}`, fullName: inquiry.name, email: inquiry.email, phone: inquiry.phone, status: "prospect", methodStage: "start", services: [] };
    store.clients.push(client);
    await this.linkInquiries(id, client.id);
    return client.id;
  },
};
