import Link from "next/link";
import Image from "next/image";
import { requireClient } from "@/lib/portal";
import { fmtMoney, serviceName } from "@/lib/portal/format";
import { getService } from "@/content/services";
import { PageTitle, Panel, Badge, ProgressBar, EmptyState } from "@/components/portal/ui";

export default async function ProgramsPage() {
  const { clientId, repo } = await requireClient();
  const [programs, products, entitlements] = await Promise.all([repo.listClientPrograms(clientId), repo.listProducts(), repo.listEntitlements(clientId)]);
  const owned = new Set(entitlements.filter((e) => e.status === "active").map((e) => e.product.id));
  return (
    <>
      <PageTitle eyebrow="Programs" title="Your programs" lead="Programs from your practitioner, plus any you’ve joined on your own." />
      {programs.length === 0 ? <EmptyState title="No programs yet." body="Your practitioner will add programs as part of your plan." /> : (
        <div className="grid gap-6 md:grid-cols-2">
          {programs.map((p) => {
            const total = p.template.modules.reduce((n, m) => n + m.activities.length, 0);
            return (
              <Link key={p.id} href={`/my-tab/programs/${p.id}`} className="block rounded-[20px] border border-border bg-white p-6 transition-shadow hover:shadow-[var(--shadow-md)]">
                <div className="flex items-center gap-4">
                  <Image src={getService(p.template.service)?.icon ?? ""} alt="" width={52} height={52} />
                  <div><h2 className="text-h4">{p.template.title}</h2><p className="text-sm text-text-secondary">{serviceName(p.template.service)}</p></div>
                </div>
                <p className="mt-4 text-text-secondary">{p.template.summary}</p>
                <div className="mt-5 flex items-center gap-2"><Badge tone="brand">Week {p.currentWeek}</Badge>{p.source === "purchased" && <Badge tone="accent">Purchased</Badge>}</div>
                <div className="mt-4"><ProgressBar value={total ? p.completedActivityIds.length / total : 0} label="Completed" /></div>
              </Link>
            );
          })}
        </div>
      )}
      {products.length > 0 && (
        <section className="mt-12">
          <h2 className="text-h2">Join a program or group</h2>
          <p className="mt-2 text-text-secondary">Guided programs and small-group cohorts, in person or virtual.</p>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {products.map((pr) => (
              <Panel key={pr.id}>
                <div className="flex items-start justify-between gap-3"><h3 className="text-h4">{pr.title}</h3><Badge>{pr.kind === "cohort" ? "Group" : "Self-paced"}</Badge></div>
                <p className="mt-2 text-text-secondary">{pr.description}</p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="font-[family-name:var(--font-display)] text-3xl">{fmtMoney(pr.priceCents)}</span>
                  {owned.has(pr.id) ? <Badge tone="success">Enrolled</Badge> : (
                    <form action="/api/checkout" method="post"><input type="hidden" name="product" value={pr.slug} /><button className="btn btn-secondary btn-sm">Enroll</button></form>
                  )}
                </div>
              </Panel>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
