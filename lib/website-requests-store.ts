import { siteConfig } from "@/config/site";
import type { Viewer } from "@/lib/portal/types";
import { isClosed, type Lane, type Priority, type RequestInput, type RequestNote, type RequestStatus, type WebsiteRequest } from "@/lib/website-requests";

/**
 * Where website requests are kept (proposed D-071): website_requests and website_request_notes in Supabase, read and
 * written in the signed-in person's session so row-level security applies. Previews and tests keep an in-memory copy
 * with two samples, like the demo settings. Server only.
 */
type Row = Record<string, unknown> & { id: string };
const fromRow = (r: Row): WebsiteRequest => ({
  id: r.id, number: r.number as number, lane: r.lane as Lane, pages: r.pages as string[], kind: r.kind as string, title: r.title as string,
  details: r.details as string, reason: (r.reason as string) ?? undefined, priority: r.priority as Priority, deadline: (r.deadline as string) ?? undefined,
  status: r.status as RequestStatus, previewUrl: (r.preview_url as string) ?? undefined, changeUrl: (r.change_url as string) ?? undefined,
  requestedBy: (r.requested_by as string) ?? undefined, requestedByName: r.requested_by_name as string,
  createdAt: r.created_at as string, updatedAt: r.updated_at as string, closedAt: (r.closed_at as string) ?? undefined,
});

/** Previews and tests: one in-memory store per server instance, with two sample requests to show the statuses. */
const usesDemo = () => !siteConfig.portal.realStaffSignIn;
const now = () => new Date().toISOString();
const demo: { requests: WebsiteRequest[]; notes: Map<string, RequestNote[]> } = {
  requests: [
    { id: "demo-req-1", number: 1, lane: "content", pages: ["FAQ"], kind: "Add something new (a paragraph, FAQ, card, technique)", title: "Add an FAQ about parking",
      details: "Several people have asked where to park. Add a question: “Where do I park?” Answer: free parking in front of the building.", priority: "whenever",
      status: "live", requestedByName: "Website admin", createdAt: "2026-10-01T14:00:00Z", updatedAt: "2026-10-02T16:00:00Z", closedAt: "2026-10-02T16:00:00Z" },
    { id: "demo-req-2", number: 2, lane: "design", pages: ["Holistic Life Coaching"], kind: "A new kind of section", title: "Compare coaching options side by side",
      details: "Visitors can't easily compare what each coaching option includes.", reason: "Fewer questions by phone before booking.", priority: "soon",
      status: "waiting_owner", requestedByName: "Your TAB practitioner", createdAt: "2026-10-05T15:00:00Z", updatedAt: "2026-10-06T10:00:00Z" },
  ],
  notes: new Map([["demo-req-2", [
    { id: "n1", authorName: "Claude", byClaude: true, createdAt: "2026-10-06T10:00:00Z",
      body: "Two options: (A) a comparison table under How we help, about half a day; (B) cards with a “What's included” list, about two hours. A is clearer on computers; B reads better on phones. Which would you like?" },
  ]]]),
};

async function db() {
  const { createSupabaseServerClient } = await import("@/lib/supabase/server");
  return createSupabaseServerClient();
}

export async function listRequests(): Promise<WebsiteRequest[]> {
  if (usesDemo()) return [...demo.requests].sort((a, b) => b.number - a.number);
  const { data, error } = await (await db()).from("website_requests").select("*").order("number", { ascending: false }).limit(500);
  if (error) throw new Error(error.message);
  return (data as Row[]).map(fromRow);
}

export async function getRequest(number: number): Promise<{ request: WebsiteRequest; notes: RequestNote[] } | null> {
  if (usesDemo()) {
    const request = demo.requests.find((r) => r.number === number);
    return request ? { request, notes: demo.notes.get(request.id) ?? [] } : null;
  }
  const sb = await db();
  const { data, error } = await sb.from("website_requests").select("*").eq("number", number).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const { data: notes, error: e2 } = await sb.from("website_request_notes").select("id, author_id, author_name, body, created_at").eq("request_id", (data as Row).id).order("created_at");
  if (e2) throw new Error(e2.message);
  return {
    request: fromRow(data as Row),
    notes: (notes as Row[]).map((n) => ({ id: n.id, authorName: n.author_name as string, body: n.body as string, createdAt: n.created_at as string, byClaude: !n.author_id })),
  };
}

/** Files a request as the signed-in staff member; the database stamps who asked, its number and its status. */
export async function createRequest(input: RequestInput, viewer: Viewer): Promise<number> {
  if (usesDemo()) {
    const number = Math.max(0, ...demo.requests.map((r) => r.number)) + 1;
    demo.requests.push({ ...input, id: `demo-req-${number}`, number, status: "new", requestedBy: viewer.userId, requestedByName: viewer.name, createdAt: now(), updatedAt: now() });
    return number;
  }
  const { data, error } = await (await db()).from("website_requests").insert({
    lane: input.lane, pages: input.pages, kind: input.kind, title: input.title, details: input.details, reason: input.reason ?? null,
    priority: input.priority, deadline: input.deadline ?? null,
  }).select("number").single();
  if (error) throw new Error(error.message);
  return (data as { number: number }).number;
}

export async function addNote(requestId: string, body: string, viewer: Viewer): Promise<void> {
  if (usesDemo()) {
    const list = demo.notes.get(requestId) ?? [];
    list.push({ id: `demo-note-${Date.now()}`, authorName: viewer.name, body, createdAt: now(), byClaude: false });
    demo.notes.set(requestId, list);
    const r = demo.requests.find((x) => x.id === requestId);
    if (r) r.updatedAt = now();
    return;
  }
  const { error } = await (await db()).from("website_request_notes").insert({ request_id: requestId, body });
  if (error) throw new Error(error.message);
}

/** The owner moves a request (approve, decline, reopen). The database refuses anyone else. */
export async function setStatus(requestId: string, status: RequestStatus): Promise<void> {
  if (usesDemo()) {
    const r = demo.requests.find((x) => x.id === requestId);
    if (r) { r.status = status; r.updatedAt = now(); r.closedAt = isClosed(status) ? now() : undefined; }
    return;
  }
  const { data, error } = await (await db()).from("website_requests").update({ status }).eq("id", requestId).select("id");
  if (error) throw new Error(error.message);
  if (!data?.length) throw new Error("Only the owner can change a request's status.");
}
