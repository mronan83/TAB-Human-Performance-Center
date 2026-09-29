/** Domain types for My TAB. They mirror supabase/migrations/*_my_tab_core.sql. */
import type { ServiceSlug } from "@/content/services";
import type { RoutingOutcome } from "@/lib/inquiry";

export type Role = "owner" | "practitioner" | "client";
export type MethodStage = "start" | "transform" | "align" | "become" | "evolve";

/** `staffVerified` is false for a staff sign-in without two-step verification (SEC-015): the database then grants no staff access. */
export type Viewer = { userId: string; role: Role; name: string; clientId?: string; practitionerId?: string; staffVerified?: boolean };

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
};

export type Goal = { id: string; title: string; whyItMatters?: string; measure?: string; metricKey?: string; target?: string; status: "active" | "achieved" | "paused" | "dropped" };

export type Plan = {
  id: string;
  clientId: string;
  title: string;
  focus?: string;
  services: ServiceSlug[];
  status: "draft" | "active" | "completed" | "archived";
  startDate?: string;
  reviewDate?: string;
  goals: Goal[];
  practitionerName?: string;
};

export type Activity = { id: string; kind: "exercise" | "habit" | "reflection" | "reading" | "video" | "check_in"; title: string; instructions?: string; prescription?: Record<string, string | number> };
export type Module = { id: string; week: number; title: string; body?: string; activities: Activity[] };

export type ProgramTemplate = { id: string; slug: string; title: string; summary?: string; service: ServiceSlug; durationWeeks?: number; status: "draft" | "published" | "retired"; modules: Module[] };

export type ClientProgram = {
  id: string;
  clientId: string;
  template: ProgramTemplate;
  source: "assigned" | "purchased" | "cohort";
  status: "active" | "paused" | "completed" | "cancelled";
  startedAt: string;
  currentWeek: number;
  completedActivityIds: string[];
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
export type FormAssignment = { template: FormTemplate; dueOn?: string; status: "not_started" | "draft" | "submitted" | "reviewed"; submittedAt?: string; answers?: Record<string, unknown> };

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
export type Entitlement = { id: string; product: Product; status: "active" | "expired" | "cancelled" | "refunded"; startsAt: string; endsAt?: string };

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
  /** Every review for the client, shared or not (staff only; RLS enforces it). */
  listReviews(clientId: string): Promise<Review[]>;
  /** Saves a Progress Review; when `newStage` differs, changes the stage in the same transaction. Returns whether it changed. */
  recordProgressReview(clientId: string, viewer: Viewer, input: ProgressReviewInput): Promise<{ stageChanged: boolean }>;
  listStageChanges(clientId: string): Promise<StageChange[]>;
  // Start and contact submissions (owner: all; practitioners: only those linked to assigned clients)
  listInquiries(): Promise<Inquiry[]>;
  getInquiry(id: string): Promise<InquiryDetail | null>;
  routeInquiry(id: string, outcome: RoutingOutcome | null, note?: string): Promise<void>;
  /** Links this submission, and every unlinked one from the same email, to the client. Returns how many were linked. */
  linkInquiries(id: string, clientId: string): Promise<number>;
  /** Creates a prospect client record from the submission, then links by email. Returns the new client id. */
  createClientFromInquiry(id: string): Promise<string>;
}
