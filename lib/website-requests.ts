import { services } from "@/content/services";

/**
 * Website change requests (owner ruling 2026-10-07, proposed D-071): the owner, practitioners and admins ask for a
 * content or design change in TAB Practice → Website changes and follow its status there. Claude reads the requests,
 * replies in the notes and moves the status (docs/CONTENT-GUIDE.md). Stored in website_requests and
 * website_request_notes (supabase/migrations/20261013000000_website_requests.sql); row-level security decides who
 * may read, add and change them. This module holds the rules and labels (safe in the browser); the storage is
 * lib/website-requests-store.ts.
 *
 * Requests are about the website, never a client: no field links to a client record, and the form says not to name one.
 */

export type Lane = "content" | "design";
export type Priority = "whenever" | "soon" | "urgent";
export type RequestStatus = "new" | "questions" | "waiting_owner" | "in_progress" | "in_review" | "live" | "declined";

export type WebsiteRequest = {
  id: string;
  number: number;
  lane: Lane;
  pages: string[];
  kind: string;
  title: string;
  details: string;
  reason?: string;
  priority: Priority;
  deadline?: string;
  status: RequestStatus;
  previewUrl?: string;
  changeUrl?: string;
  requestedBy?: string;
  requestedByName: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
};
export type RequestNote = { id: string; authorName: string; body: string; createdAt: string; byClaude: boolean };
export type RequestInput = Pick<WebsiteRequest, "lane" | "pages" | "kind" | "title" | "details" | "reason" | "priority" | "deadline">;

export const LANES: { value: Lane; label: string; hint: string }[] = [
  { value: "content", label: "Content help", hint: "What a page says: words, FAQs, cards, photos, the order of sections." },
  { value: "design", label: "Design change", hint: "How the site looks or works: a new kind of section, layout, menus, forms, a new page." },
];

/** The steps a request moves through, in order; the last two close it. */
export const STATUSES: { value: RequestStatus; label: string; tone: "neutral" | "brand" | "accent" | "warning" | "success"; means: string }[] = [
  { value: "new", label: "New", tone: "accent", means: "Waiting for Claude to read it." },
  { value: "questions", label: "Questions or options", tone: "brand", means: "Claude has replied with questions, or options to choose from." },
  { value: "waiting_owner", label: "Waiting on you", tone: "warning", means: "Needs the owner: an answer, a choice or an approval." },
  { value: "in_progress", label: "In progress", tone: "brand", means: "Being built." },
  { value: "in_review", label: "In review", tone: "warning", means: "A preview is ready to check before it goes live." },
  { value: "live", label: "Live", tone: "success", means: "On the website." },
  { value: "declined", label: "Declined", tone: "neutral", means: "Not going ahead; the notes say why." },
];
export const statusOf = (s: RequestStatus) => STATUSES.find((x) => x.value === s)!;
export const isClosed = (s: RequestStatus) => s === "live" || s === "declined";

export const PRIORITIES: { value: Priority; label: string }[] = [
  { value: "whenever", label: "Whenever convenient" },
  { value: "soon", label: "Soon (this week)" },
  { value: "urgent", label: "Urgent: something on the site is wrong" },
];

export const CONTENT_KINDS = ["Update existing text", "Add something new (a paragraph, FAQ, card, technique)", "Remove something", "Reorder or hide a section", "Swap or add a photo", "Search title or description"];
export const DESIGN_KINDS = ["A new kind of section", "Layout, spacing or phone layout", "A new page", "Menus or footer", "A form (Start Where You Are, contact)", "My TAB or TAB Practice", "Something else"];

/** The pages a request can name: every public page, then the areas only the design lane changes. */
export const PAGE_OPTIONS = [
  "Home", "Services overview", ...services.map((s) => s.name), "Massage techniques", "The TAB Method", "About", "Our Story", "Our Team",
  "Resources", "Events", "FAQ", "Book", "Start Where You Are", "Contact", "Client policies", "Privacy, terms or accessibility",
  "Header, menus or footer", "My TAB or TAB Practice", "Several or all pages",
];

export const LIMITS = { title: 120, details: 4000, reason: 2000, note: 4000 } as const;

/** Reads and checks the request form. Pure, so the rules are tested in e2e/guardrails.spec.ts. */
export function parseRequest(fd: FormData): { ok: true; input: RequestInput } | { ok: false; error: string } {
  const str = (k: string) => String(fd.get(k) ?? "").trim();
  const lane = str("lane");
  if (lane !== "content" && lane !== "design") return { ok: false, error: "Choose content help or a design change." };
  const pages = fd.getAll("pages").map(String).filter((p) => PAGE_OPTIONS.includes(p));
  if (!pages.length) return { ok: false, error: "Choose at least one page." };
  const kind = str("kind");
  if (!(lane === "content" ? CONTENT_KINDS : DESIGN_KINDS).includes(kind)) return { ok: false, error: "Choose what kind of change it is." };
  const title = str("title");
  if (title.length < 3 || title.length > LIMITS.title) return { ok: false, error: `Give the request a short title (3 to ${LIMITS.title} characters).` };
  const details = str("details");
  if (!details) return { ok: false, error: "Describe the change." };
  if (details.length > LIMITS.details) return { ok: false, error: `Keep the description under ${LIMITS.details} characters.` };
  const reason = str("reason");
  if (reason.length > LIMITS.reason) return { ok: false, error: `Keep the reason under ${LIMITS.reason} characters.` };
  const priority = str("priority") as Priority;
  if (!PRIORITIES.some((p) => p.value === priority)) return { ok: false, error: "Choose how soon it's needed." };
  const deadline = str("deadline");
  if (deadline && !/^\d{4}-\d{2}-\d{2}$/.test(deadline)) return { ok: false, error: "Enter the deadline as a date." };
  return { ok: true, input: { lane, pages, kind, title, details, reason: reason || undefined, priority, deadline: deadline || undefined } };
}

