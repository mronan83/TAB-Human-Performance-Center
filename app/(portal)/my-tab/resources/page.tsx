import Link from "next/link";
import { requireClient } from "@/lib/portal";
import { fmtDate } from "@/lib/portal/format";
import { PageTitle, Badge, EmptyState } from "@/components/portal/ui";

export default async function PortalResources() {
  const { clientId, repo } = await requireClient();
  const items = await repo.listResources(clientId);
  return (
    <>
      <PageTitle eyebrow="Resources" title="Picked for you" lead="Guides and reading your practitioner has shared with you." />
      {items.length === 0 ? <EmptyState title="Nothing here yet." /> : (
        <ul className="grid gap-4 md:grid-cols-2">
          {items.map((r) => (
            <li key={r.id}>
              <Link href={r.href} className="block h-full rounded-[20px] border border-border bg-white p-6 hover:shadow-[var(--shadow-md)]">
                <div className="flex items-center justify-between"><span className="text-label text-secondary">{r.kind}</span>{!r.viewedAt && <Badge tone="accent">New</Badge>}</div>
                <h2 className="text-h4 mt-2">{r.title}</h2>
                {r.note && <p className="mt-2 text-text-secondary">“{r.note}”</p>}
                <p className="mt-3 text-sm text-text-secondary">Shared {fmtDate(r.assignedAt)}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
