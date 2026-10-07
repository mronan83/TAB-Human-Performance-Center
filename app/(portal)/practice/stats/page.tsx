import { requireStaffViewer, isDemoSignIn } from "@/lib/portal";
import { getSiteStats, pageName } from "@/lib/site-stats";
import { PageTitle, Panel } from "@/components/portal/ui";
import { ViewsChart } from "@/components/portal/ViewsChart";
import { loadLibrary } from "@/lib/resources";

export const metadata = { title: "Website stats" };

/**
 * Website counts for the owner and admins (owner ruling A4: "Let's build our own"; proposed D-071): daily totals from our own counter
 * (lib/site-stats.ts). Visits to My TAB, TAB Practice and /contact are never counted, and nothing identifies a visitor,
 * so there are no "unique visitors": these are page views and actions.
 */
export default async function StatsPage() {
  const viewer = await requireStaffViewer();
  if (viewer.role !== "owner" && viewer.role !== "admin") {
    return (<><PageTitle eyebrow="TAB Practice" title="Website stats" /><Panel><p>Only the owner and website admins can see the website stats.</p></Panel></>);
  }
  const s = await getSiteStats(30);
  const titles = new Map(loadLibrary().resources.map((r) => [r.slug, r.title]));
  const started = s.totals["Start Form: Started"], submitted = s.totals["Start Form: Submitted"];
  const tiles = [
    { label: "Page views", value: s.totals.views, note: "last 30 days" },
    { label: "Book clicks", value: s.totals["Booking: Clicked"], note: "to Timely" },
    { label: "Start forms begun", value: started, note: "first answer chosen" },
    { label: "Start forms sent", value: submitted, note: started ? `${Math.round((submitted / started) * 100)}% of those begun` : "—" },
  ];
  return (
    <>
      <PageTitle eyebrow="TAB Practice" title="Website stats" lead="Counted by our own site: no cookies, no tracking companies, nothing that identifies a visitor. My TAB, TAB Practice and the contact page are never counted." />
      {(s.demo || isDemoSignIn()) && <p className="mb-6 rounded-xl bg-note-soft p-4 text-sm">Demo: these numbers are a fixed sample. The live site counts real visits once it’s public.</p>}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-[20px] border border-border bg-white p-5">
            <p className="text-sm text-text-secondary">{t.label}</p>
            <p className="mt-1 text-[2rem] font-semibold tabular-nums leading-tight">{t.value.toLocaleString()}</p>
            <p className="mt-1 text-xs text-text-secondary">{t.note}</p>
          </div>
        ))}
      </div>
      <Panel title="Page views per day" className="mb-6"><ViewsChart days={s.days} /></Panel>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Most viewed pages">
          {s.pages.length ? <Table rows={s.pages.map((p) => ({ name: pageName(p.key), count: p.count }))} head="Page" /> : <p className="text-sm text-text-secondary">No visits counted yet.</p>}
        </Panel>
        <Panel title="Sites that sent visitors">
          {s.referrers.length ? <Table rows={s.referrers.map((r) => ({ name: r.key, count: r.count }))} head="Site" /> : <p className="text-sm text-text-secondary">None yet. Visitors who type the address or use a bookmark aren’t listed.</p>}
        </Panel>
        <Panel title="Resources opened" className="lg:col-span-2">
          {s.resources.length ? <Table rows={s.resources.map((r) => ({ name: titles.get(r.key) ?? r.key, count: r.count }))} head="Resource" countHead="Opened" /> : <p className="text-sm text-text-secondary">None yet. Each link followed or document downloaded from the Resources page counts once.</p>}
        </Panel>
      </div>
    </>
  );
}

function Table({ rows, head, countHead = "Views" }: { rows: { name: string; count: number }[]; head: string; countHead?: string }) {
  return (
    <table className="w-full text-left text-sm">
      <thead><tr><th className="py-1 font-semibold">{head}</th><th className="py-1 text-right font-semibold">{countHead}</th></tr></thead>
      <tbody>{rows.map((r) => <tr key={r.name} className="border-t border-border"><td className="py-2">{r.name}</td><td className="py-2 text-right tabular-nums">{r.count.toLocaleString()}</td></tr>)}</tbody>
    </table>
  );
}
