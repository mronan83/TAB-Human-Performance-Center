import Link from "next/link";
import { requireStaffViewer, isDemoSignIn } from "@/lib/portal";
import { isClosed, statusOf, LANES, type WebsiteRequest } from "@/lib/website-requests";
import { listRequests } from "@/lib/website-requests-store";
import { siteConfig } from "@/config/site";
import { Badge, EmptyState, PageTitle, Panel } from "@/components/portal/ui";

export const metadata = { title: "Website changes" };

const date = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/Detroit" });

function RequestRow({ r }: { r: WebsiteRequest }) {
  const st = statusOf(r.status);
  return (
    <li>
      <Link href={`/practice/website/${r.number}`} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 py-4 hover:bg-bone">
        <span className="min-w-0">
          <span className="block font-semibold"><span className="text-text-secondary">#{r.number}</span> {r.title}</span>
          <span className="mt-0.5 block text-sm text-text-secondary">{LANES.find((l) => l.value === r.lane)!.label} · {r.pages.join(", ")} · {r.requestedByName}, {date(r.createdAt)}</span>
        </span>
        <span className="whitespace-nowrap"><Badge tone={st.tone}>{st.label}</Badge></span>
      </Link>
    </li>
  );
}

/**
 * Website changes (owner rulings 2026-10-07, proposed D-071): file a content or design request and follow it to the
 * live site. Every staff role sees every request; only the owner changes a status (Claude does too, by the service role).
 */
export default async function WebsiteChangesPage() {
  const viewer = await requireStaffViewer();
  const all = await listRequests();
  const open = all.filter((r) => !isClosed(r.status)), closed = all.filter((r) => isClosed(r.status));
  const yours = viewer.role === "owner" ? open.filter((r) => r.status === "waiting_owner" || r.status === "in_review") : [];
  return (
    <>
      <PageTitle eyebrow="TAB Practice" title="Website changes" lead="Ask for a change to the public website and follow it through to the live site. Content help covers what a page says; a design change covers how the site looks or works."
        action={<div className="flex flex-wrap gap-3"><Link href="/practice/website/new" className="btn btn-primary">New request</Link><a href={siteConfig.websiteChanges.guide} target="_blank" rel="noopener noreferrer" className="btn btn-outline">Content guide<span className="sr-only"> (opens in a new tab)</span></a></div>} />
      {isDemoSignIn() && <p className="mb-6 rounded-xl bg-note-soft p-4 text-sm">Demo: requests here are samples and reset when the preview restarts.</p>}
      {yours.length > 0 && (
        <p className="mb-6 rounded-xl bg-accent-soft p-4 text-sm"><strong>{yours.length === 1 ? "One request needs" : `${yours.length} requests need`} you: </strong>{yours.map((r) => `#${r.number}`).join(", ")}.</p>
      )}
      <Panel title={`Open (${open.length})`} className="mb-6 overflow-hidden">
        {open.length ? <ul className="-mx-6 -mb-6 divide-y divide-border border-t border-border">{open.map((r) => <RequestRow key={r.id} r={r} />)}</ul>
          : <div><EmptyState title="No open requests" body="When you need something changed on the website, start a new request." /></div>}
      </Panel>
      {closed.length > 0 && (
        <Panel title={`Done or declined (${closed.length})`} className="overflow-hidden">
          <ul className="-mx-6 -mb-6 divide-y divide-border border-t border-border">{closed.map((r) => <RequestRow key={r.id} r={r} />)}</ul>
        </Panel>
      )}
    </>
  );
}
