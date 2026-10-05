/** Domain types for My TAB. They mirror supabase/migrations/*_my_tab_core.sql. */
import type { ServiceSlug } from "@/content/services";
import type { RoutingOutcome } from "@/lib/inquiry";

export type Role = "owner" | "practitioner" | "client";
export type MethodStage = "start" | "transform" | "adapt" | "balance" | "evolve";

/** `staffVerified` is false for a staff sign-in without two-step verification (SEC-015): the database then grants no staff access. */
export type Viewer = { userId: string; role: Role; name: string; clientId?: string; practitionerId?: string; staffVerified?: boolean; capabilities?: string[];
  /** May publish and retire program versions (owners, and practitioners with the publishing permission). */
  canPublish?: boolean };

export type Client = {
  id: string;
  fullName: string;
  preferredName?: string;
  email?: string;
  phone?: string;
  status: "prospect" | "active" | "paused" | "alumni";
  methodStage: MethodStage;
  services: ServiceSlug[];
  primaryPractitioner?: string;
  delivery?: "In person" | "Virtual" | "Either";
  lastCheckIn?: string;
  /** My TAB access (C4): invited by the care team, then active from the client's first sign-in. */
  myTab?: { status: "not_invited" | "invited" | "active"; invitedAt?: string; activatedAt?: string };
};
/** What happened when a practitioner invited a client to My TAB (C4). */
export type InviteResult = "sent" | "has_account" | "already_active" | "skipped" | "failed";

export type Goal = { id: string; title: string; whyItMatters?: string; measure?: string; metricKey?: string; target?: string; status: "active" | "achieved" | "paused" | "dropped" };

/** `wellness` is the anchor plan; the rest are service plans under it (design §2). */
export type PlanType = "wellness" | "personal-strength-training" | "massage-bodywork" | "womens-wellness-coaching" | "holistic-life-coaching" | "nutrition";

export type Plan = {
  id: string;
  clientId: string;
  planType: PlanType;
  parentPlanId?: string;
  visibleToClient: boolean;
  /** Type sections shared with the client when the plan is visible. */
  details: Record<string, string>;
  /** Practitioner-only sections. Only ever loaded for staff. */
  privateDetails?: Record<string, string>;
  title: string;
  focus?: string;
  services: ServiceSlug[];
  status: "draft" | "active" | "completed" | "archived";
  startDate?: string;
  reviewDate?: string;
  goals: Goal[];
  practitionerName?: string;
};

export type PlanEntry = { id: string; planId: string; date: string; body: string; visibility: "internal" | "shared"; author?: string };
export type GoalInput = { id?: string; title: string; whyItMatters?: string; measure?: string; target?: string; status?: Goal["status"] };
export type PlanInput = {
  id?: string;
  planType: PlanType;
  title: string;
  focus?: string;
  status: Plan["status"];
  visibleToClient: boolean;
  startDate?: string;
  reviewDate?: string;
  details: Record<string, string>;
  privateDetails: Record<string, string>;
  /** Performance Plan only: the full goal list (goals not listed are removed). */
  goals?: GoalInput[];
};

export type Activity = {
  id: string; kind: "exercise" | "habit" | "reflection" | "reading" | "video" | "check_in"; title: string; instructions?: string; prescription?: Record<string, string | number>;
  /** Set on a personalized activity only: the practitioner's note for this client, and whether its prescription changed. */
  personalNote?: string; adjusted?: boolean;
  /** Added for this client only (client_program_activities), not part of the library program (C7b). */
  custom?: boolean;
  /** The activity in the previous version this one was copied from (C7); used to carry progress to a newer version. */
  sourceActivityId?: string;
};
/** An activity a practitioner added to one client's program (C7b). */
export type ClientActivity = { id: string; week: number; kind: Activity["kind"]; title: string; instructions?: string };
export type ClientActivityInput = Omit<ClientActivity, "id"> & { id?: string };
/** A practitioner as the owner manages them on the Team page (C7b). */
export type PractitionerSummary = { id: string; name: string; role: Role; active: boolean; canPublish: boolean; capabilities: string[] };
export type Module = { id: string; week: number; title: string; body?: string; activities: Activity[] };

/** One version of a program. Versions of the same program share `familyId` (C7, design §3.1). */
export type ProgramTemplate = {
  id: string; familyId: string; slug: string; title: string; summary?: string; service: ServiceSlug; durationWeeks?: number;
  status: "draft" | "published" | "retired"; version: number; modules: Module[];
  /** Draft only: when it was submitted for review by someone without the publishing permission. */
  submittedAt?: string; publishedAt?: string;
};

export type ProgramActivityInput = { id?: string; kind: Activity["kind"]; title: string; instructions?: string; prescription: Record<string, string> };
export type ProgramModuleInput = { id?: string; week: number; title: string; body?: string; activities: ProgramActivityInput[] };
/** A draft program: details and the whole content, in order. Rows without an id are new; rows left out are removed. */
export type ProgramDraftInput = { id?: string; title: string; summary?: string; service: ServiceSlug; durationWeeks?: number; modules: ProgramModuleInput[] };
export type ProgramAction = "submit" | "publish" | "retire" | "new_version" | "discard";

/** One client's changes to one activity (C4c). Prescription values replace the template's for the same keys. */
export type ActivityAdjustment = { skip?: boolean; note?: string; prescription?: Record<string, string> };
/** Per-client personalization of an assigned program; the template itself never changes (design §2.4). */
export type Personalization = { note?: string; activities?: Record<string, ActivityAdjustment> };

export type ClientProgram = {
  id: string;
  clientId: string;
  /** The template as published. Use `personalizedModules()` (lib/portal/programs.ts) for what the client sees. */
  template: ProgramTemplate;
  /** The template version pinned at assignment. */
  templateVersion: number;
  source: "assigned" | "purchased" | "cohort";
  status: "active" | "paused" | "completed" | "cancelled";
  startedAt: string;
  completedAt?: string;
  currentWeek: number;
  completedActivityIds: string[];
  /** The plan this program supports, if any. */
  planId?: string;
  personalization: Personalization;
  /** Activities added for this client only (C7b). */
  customActivities: ClientActivity[];
};

export type ProgramAssignmentInput = {
  /** Set to update an existing assignment; omit to assign. */
  id?: string;
  templateId: string;
  startedAt: string;
  status: ClientProgram["status"];
  planId?: string;
  personalization: Personalization;
  /** The full list of client-only activities; omitted ones are removed. */
  customActivities: ClientActivityInput[];
};

export type MetricDefinition = { key: string; label: string; unit?: string; category: "physical" | "habit" | "wellbeing" | "health"; sensitive: boolean; higherIsBetter?: boolean; min?: number; max?: number };
export type ProgressEntry = { metricKey: string; value: number; recordedOn: string; source: "client" | "practitioner" };

export type CheckIn = { weekOf: string; energy?: number; sleepQuality?: number; stress?: number; wins?: string; challenges?: string; supportNeeded?: string };

export type Appointment = { id: string; service: ServiceSlug; startsAt: string; location: string; status: string };

export type ResourceAssignment = { id: string; title: string; kind?: string; note?: string; href: string; assignedAt: string; viewedAt?: string };

export type FormField =
  | { id: string; type: "text"; label: string; required?: boolean }
  | { id: string; type: "textarea"; label: string; required?: boolean }
  | { id: string; type: "scale"; label: string; min: number; max: number; minLabel?: string; maxLabel?: string; required?: boolean }
  | { id: string; type: "choice"; label: string; options: string[]; required?: boolean }
  | { id: string; type: "multi"; label: string; options: string[]; required?: boolean };
export type FormTemplate = { id: string; slug: string; title: string; description?: string; sensitivity: "general" | "sensitive"; sections: { title: string; fields: FormField[] }[] };
export type FormAssignment = { id?: string; template: FormTemplate; dueOn?: string; status: "not_started" | "draft" | "submitted" | "reviewed"; submittedAt?: string; answers?: Record<string, unknown> };

export type SessionNote = { id: string; date: string; service?: ServiceSlug; visibility: "internal" | "shared"; body: string; author: string };
export type Review = { id: string; date: string; summary: string; nextSteps?: string; stage?: MethodStage; shared?: boolean; outcome?: ReviewOutcome; reflections?: ReviewReflections; author?: string };

/** Step 14 §14.4.5: "Does the current approach still fit?" */
export type ReviewOutcome = "continue" | "adjust" | "increase_support" | "reduce_frequency" | "maintenance";
/** The Progress Review conversation, in the client's words (Step 14 §14.4.5). */
export type ReviewReflections = { changed?: string; difficult?: string; learned?: string; circumstances?: string[] };
export type ProgressReviewInput = {
  outcome: ReviewOutcome;
  reflections: ReviewReflections;
  summaryForClient?: string;
  nextSteps?: string;
  share: boolean;
  /** Set only when the practitioner confirms a stage change agreed with the client. */
  newStage?: MethodStage;
};
/** One entry in a client's stage history. Written by the database whenever the stage changes. */
export type StageChange = { id: string; from?: MethodStage; to: MethodStage; changedAt: string; changedBy?: string; reviewId?: string };

export type Consent = { type: "terms" | "privacy" | "health_info_collection" | "care_coordination" | "marketing_email" | "marketing_sms" | "photo_testimonial"; label: string; granted: boolean; required: boolean; updatedAt?: string };

export type Product = { id: string; slug: string; title: string; description?: string; kind: "program" | "cohort" | "membership" | "package"; service?: ServiceSlug; priceCents?: number; active: boolean };
export type Entitlement = {
  id: string; product: Product; status: "active" | "pending" | "past_due" | "expired" | "cancelled" | "refunded"; startsAt: string; endsAt?: string;
  /** Set by a partial Stripe refund: access stays until the owner decides (owner ruling 2026-10-03). */
  needsReview?: boolean; refundedCents?: number;
};
/** A purchase a partial refund flagged for the owner's decision (C3b). */
export type PurchaseReview = { entitlementId: string; clientId: string; clientName: string; product: string; priceCents?: number; refundedCents: number };

export type Dashboard = {
  client: Client;
  plan?: Plan;
  nextAppointment?: Appointment;
  programs: ClientProgram[];
  todaysActivities: { program: ClientProgram; activity: Activity; done: boolean }[];
  checkInDue: boolean;
  resources: ResourceAssignment[];
  pendingForms: FormAssignment[];
  latestSharedReview?: Review;
  /** The most recent stage change, for the "your stage was updated" notice. */
  latestStageChange?: StageChange;
};

/** A Start Where You Are or contact submission (supabase/migrations/*_inquiries.sql). Answers are option values. */
export type Inquiry = {
  id: string;
  reference: string;
  kind: "start" | "contact";
  receivedAt: string;
  name: string;
  email: string;
  phone?: string;
  contactPreference?: string;
  journey?: string;
  help: string[];
  serviceInterest?: string;
  outcomes: string[];
  considerations: string[];
  delivery?: string;
  availability: string[];
  foundVia?: string;
  topic?: string;
  /** Contact form only. */
  message?: string;
  /** Spam signals recorded when it arrived (lib/spam.ts). */
  flags: string[];
  marketingOptIn: boolean;
  clientId?: string;
  clientName?: string;
  routingOutcome?: RoutingOutcome;
  routingNote?: string;
  routedAt?: string;
};

export type InquiryDetail = {
  inquiry: Inquiry;
  /** Client records with the same email that this submission isn't linked to yet. */
  matches: Client[];
  /** Other submissions from the same email address. */
  related: Inquiry[];
};

export interface PortalRepository {
  // Client-facing
  getDashboard(clientId: string): Promise<Dashboard>;
  getClient(clientId: string): Promise<Client | null>;
  getPlan(clientId: string): Promise<Plan | null>;
  listClientPrograms(clientId: string): Promise<ClientProgram[]>;
  getClientProgram(clientId: string, programId: string): Promise<ClientProgram | null>;
  toggleActivity(clientId: string, programId: string, activityId: string, done: boolean): Promise<void>;
  listMetrics(): Promise<MetricDefinition[]>;
  listProgress(clientId: string): Promise<ProgressEntry[]>;
  addProgress(clientId: string, entry: Omit<ProgressEntry, "source">): Promise<void>;
  listCheckIns(clientId: string): Promise<CheckIn[]>;
  saveCheckIn(clientId: string, checkIn: CheckIn): Promise<void>;
  listAppointments(clientId: string): Promise<Appointment[]>;
  listResources(clientId: string): Promise<ResourceAssignment[]>;
  listForms(clientId: string): Promise<FormAssignment[]>;
  getForm(clientId: string, slug: string): Promise<FormAssignment | null>;
  submitForm(clientId: string, slug: string, answers: Record<string, unknown>, final: boolean): Promise<void>;
  listSharedReviews(clientId: string): Promise<Review[]>;
  listConsents(clientId: string): Promise<Consent[]>;
  setConsent(clientId: string, type: Consent["type"], granted: boolean): Promise<void>;
  updateContact(clientId: string, data: { preferredName?: string; phone?: string }): Promise<void>;
  listProducts(): Promise<Product[]>;
  listEntitlements(clientId: string): Promise<Entitlement[]>;
  // Practice workspace
  listClients(viewer: Viewer): Promise<Client[]>;
  listNotes(clientId: string, includeInternal: boolean): Promise<SessionNote[]>;
  addNote(clientId: string, viewer: Viewer, note: { body: string; visibility: "internal" | "shared"; service?: ServiceSlug }): Promise<void>;
  listProgramTemplates(): Promise<ProgramTemplate[]>;
  getProgramTemplate(id: string): Promise<ProgramTemplate | null>;
  /** Creates a draft program (version 1) or saves a draft version. Returns its id. */
  saveProgramDraft(viewer: Viewer, input: ProgramDraftInput): Promise<string>;
  /** Moves a program version through its life cycle. Returns the id to show next (null after discarding). */
  runProgramAction(viewer: Viewer, id: string, action: ProgramAction): Promise<string | null>;
  /** Moves an assigned program to a newer published version of the same program. Returns how many completed activities carried over. */
  moveClientProgram(clientId: string, programId: string, viewer: Viewer, targetTemplateId: string): Promise<number>;
  /** Invites the client to My TAB (care team only) and sends the invitation (C4). */
  inviteClient(clientId: string, viewer: Viewer): Promise<InviteResult>;
  /** Published form templates a practitioner can assign. */
  listFormTemplates(): Promise<FormTemplate[]>;
  assignForm(clientId: string, viewer: Viewer, input: { templateId: string; dueOn?: string }): Promise<void>;
  /** Withdraws a form the client hasn't started. */
  withdrawForm(clientId: string, assignmentId: string): Promise<void>;
  /** The client opened a shared resource (SEC-016: the only column a client may change on it). */
  markResourceViewed(clientId: string, assignmentId: string): Promise<void>;
  assignResource(clientId: string, viewer: Viewer, input: { title: string; kind?: string; href: string; note?: string }): Promise<void>;
  removeResource(clientId: string, assignmentId: string): Promise<void>;
  /** Owner only: practitioners with their publishing permission and credentials (C7b). */
  listPractitioners(): Promise<PractitionerSummary[]>;
  updatePractitioner(id: string, changes: { canPublish: boolean; capabilities: string[] }): Promise<void>;
  /** Assigns a published program to the client, or updates an assignment (status, plan link, personalization). Returns its id. */
  saveClientProgram(clientId: string, viewer: Viewer, input: ProgramAssignmentInput): Promise<string>;
  /** Every review for the client, shared or not (staff only; RLS enforces it). */
  listReviews(clientId: string): Promise<Review[]>;
  /** Saves a Progress Review; when `newStage` differs, changes the stage in the same transaction. Returns whether it changed. */
  recordProgressReview(clientId: string, viewer: Viewer, input: ProgressReviewInput): Promise<{ stageChanged: boolean }>;
  listStageChanges(clientId: string): Promise<StageChange[]>;
  /** Every plan for the client: staff get drafts and practitioner-only sections; clients get what RLS shows them. */
  listPlans(clientId: string, opts: { staff: boolean }): Promise<Plan[]>;
  /** Creates or updates a plan. Service plans are attached to the client's Performance Plan. Returns the plan id. */
  savePlan(clientId: string, viewer: Viewer, input: PlanInput): Promise<string>;
  listPlanEntries(clientId: string, planId: string, includeInternal: boolean): Promise<PlanEntry[]>;
  addPlanEntry(clientId: string, planId: string, viewer: Viewer, entry: { body: string; visibility: "internal" | "shared"; date?: string }): Promise<void>;
  /** Owner only: purchases a partial refund flagged for a decision (C3b). */
  listPurchaseReviews(): Promise<PurchaseReview[]>;
  /** Owner only: end access (counts as refunded) or keep it. */
  resolvePurchaseReview(entitlementId: string, endAccess: boolean): Promise<void>;
  // Start and contact submissions (owner: all; practitioners: only those linked to assigned clients)
  listInquiries(): Promise<Inquiry[]>;
  getInquiry(id: string): Promise<InquiryDetail | null>;
  routeInquiry(id: string, outcome: RoutingOutcome | null, note?: string): Promise<void>;
  /** Links this submission, and every unlinked one from the same email, to the client. Returns how many were linked. */
  linkInquiries(id: string, clientId: string): Promise<number>;
  /** Creates a prospect client record from the submission, then links by email. Returns the new client id. */
  createClientFromInquiry(id: string): Promise<string>;
}
