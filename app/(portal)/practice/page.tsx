import Link from "next/link";
import { requireStaff } from "@/lib/portal";
import { fmtDate, serviceName, STAGES, weekStartISO } from "@/lib/portal/format";
import { PageTitle, Badge } from "@/components/portal/ui";

export default async function PracticeHome({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { viewer, repo } = await requireStaff();
  const { status } = await searchParams;
  const all = await repo.listClients(viewer);
  const clients = status ? all.filter((c) => c.status === status) : all;
  const week = weekStartISO();
  const stats = [
    { label: "Active clients", value: all.filter((c) => c.status === "active").length },
    { label: "Checked in this week", value: all.filter((c) => c.lastCheckIn === week).length },
    { label: "Need follow-up", value: all.filter((c) => c.status === "active" && c.lastCheckIn !== week).length },
    { label: "Prospects", value: all.filter((c) => c.status === "prospect").length },
  ];
  const filters = [["", "All"], ["active", "Active"], ["prospect", "Prospects"], ["paused", "Paused"], ["alumni", "Alumni"]];
  return (
    <>
      <PageTitle eyebrow="Practice workspace" title="Clients" />
      <dl className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (<div key={s.label} className="rounded-[20px] border border-border bg-white p-5"><dt className="text-sm text-text-secondary">{s.label}</dt><dd className="mt-1 font-[family-name:var(--font-display)] text-4xl">{s.value}</dd></div>))}
      </dl>
      <nav aria-label="Filter clients" className="mb-4 flex flex-wrap gap-2">
        {filters.map(([v, l]) => (
          <Link key={l} href={v ? `/practice?status=${v}` : "/practice"} aria-current={(status ?? "") === v ? "page" : undefined}
            className={(status ?? "") === v ? "rounded-full bg-olive px-4 py-1.5 text-sm font-semibold text-white" : "rounded-full border border-border-input bg-white px-4 py-1.5 text-sm font-semibold"}>{l}</Link>
        ))}
      </nav>
      <div className="overflow-x-auto rounded-[20px] border border-border bg-white">
        <table className="w-full min-w-[720px] text-left">
          <thead className="border-b border-border text-sm text-text-secondary"><tr><th className="px-5 py-3 font-semibold">Client</th><th className="px-5 py-3 font-semibold">Status</th><th className="px-5 py-3 font-semibold">Stage</th><th className="px-5 py-3 font-semibold">Services</th><th className="px-5 py-3 font-semibold">Last check-in</th></tr></thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-cream">
                <td className="px-5 py-4"><Link href={`/practice/clients/${c.id}`} className="font-semibold text-primary underline-offset-4 hover:underline">{c.fullName}</Link><p className="text-sm text-text-secondary">{c.delivery}</p></td>
                <td className="px-5 py-4"><Badge tone={c.status === "active" ? "success" : c.status === "prospect" ? "accent" : "neutral"}>{c.status}</Badge></td>
                <td className="px-5 py-4 text-sm">{STAGES.find((s) => s.key === c.methodStage)?.label}</td>
                <td className="px-5 py-4 text-sm">{c.services.map(serviceName).join(", ") || "—"}</td>
                <td className="px-5 py-4 text-sm">{c.lastCheckIn ? (c.lastCheckIn === week ? <Badge tone="success">This week</Badge> : fmtDate(c.lastCheckIn)) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
