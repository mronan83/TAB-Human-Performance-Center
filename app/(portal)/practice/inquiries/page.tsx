import Link from "next/link";
import { requireStaff } from "@/lib/portal";
import { fmtDate } from "@/lib/portal/format";
import { PageTitle, Badge, EmptyState } from "@/components/portal/ui";
import { labelFor, routingOptions, serviceOptions } from "@/lib/inquiry";

/** Start Where You Are and contact submissions (DIV-05). The owner sees all; practitioners only linked, assigned ones. */
export default async function InquiriesPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const { repo } = await requireStaff();
  const { view } = await searchParams;
  const all = await repo.listInquiries();
  const needsStep = all.filter((i) => i.kind === "start" && !i.routingOutcome);
  const list = view === "open" ? needsStep : view === "contact" ? all.filter((i) => i.kind === "contact") : all;
  const filters = [["", `All (${all.length})`], ["open", `Needs a next step (${needsStep.length})`], ["contact", "Contact messages"]];
  return (
    <>
      <PageTitle eyebrow="Practice workspace" title="Submissions" lead="Start Where You Are and contact form submissions. Each Start submission ends with one next step." />
      <nav aria-label="Filter submissions" className="mb-4 flex flex-wrap gap-2">
        {filters.map(([v, l]) => (
          <Link key={v} href={v ? `/practice/inquiries?view=${v}` : "/practice/inquiries"} aria-current={(view ?? "") === v ? "page" : undefined}
            className={(view ?? "") === v ? "rounded-full bg-olive px-4 py-1.5 text-sm font-semibold text-white" : "rounded-full border border-border-input bg-white px-4 py-1.5 text-sm font-semibold"}>{l}</Link>
        ))}
      </nav>
      {list.length === 0 ? (
        <EmptyState title="Nothing here yet" body="New submissions appear here as soon as they arrive." />
      ) : (
        <div className="overflow-x-auto rounded-[20px] border border-border bg-white">
          <table className="w-full min-w-[760px] text-left">
            <thead className="border-b border-border text-sm text-text-secondary">
              <tr><th className="px-5 py-3 font-semibold">From</th><th className="px-5 py-3 font-semibold">Received</th><th className="px-5 py-3 font-semibold">Interested in</th><th className="px-5 py-3 font-semibold">Next step</th><th className="px-5 py-3 font-semibold">Client record</th></tr>
            </thead>
            <tbody>
              {list.map((i) => (
                <tr key={i.id} className="border-b border-border last:border-0 hover:bg-cream">
                  <td className="px-5 py-4">
                    <Link href={`/practice/inquiries/${i.id}`} className="font-semibold text-primary underline-offset-4 hover:underline">{i.name}</Link>
                    <p className="text-sm text-text-secondary">{i.kind === "start" ? "Start Where You Are" : "Contact message"}</p>
                  </td>
                  <td className="px-5 py-4 text-sm">{fmtDate(i.receivedAt)}</td>
                  <td className="px-5 py-4 text-sm">{i.serviceInterest ? labelFor(serviceOptions, i.serviceInterest) : "—"}</td>
                  <td className="px-5 py-4 text-sm">
                    {i.routingOutcome ? <Badge tone="success">{labelFor(routingOptions, i.routingOutcome)}</Badge> : i.kind === "start" ? <Badge tone="accent">Needs a next step</Badge> : "—"}
                  </td>
                  <td className="px-5 py-4 text-sm">{i.clientId ? <Link href={`/practice/clients/${i.clientId}`} className="text-primary underline underline-offset-4">{i.clientName ?? "Open"}</Link> : "Not linked"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
