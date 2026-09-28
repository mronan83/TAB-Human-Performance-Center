import { requireClient } from "@/lib/portal";
import { fmtDate } from "@/lib/portal/format";
import { clientLoginHref } from "@/lib/links";
import { PageTitle, Panel, Badge, EmptyState } from "@/components/portal/ui";
import { SmartLink } from "@/components/SmartLink";

/** D-052: appointments and packages are paid in Timely; digital programs and subscriptions through Stripe. */
export default async function BillingPage() {
  const { clientId, repo } = await requireClient();
  const ents = await repo.listEntitlements(clientId);
  const timely = clientLoginHref();
  return (
    <>
      <PageTitle eyebrow="Billing" title="Payments and memberships" />
      <div className="grid gap-6 md:grid-cols-2">
        <Panel title="Programs and memberships">
          {ents.length === 0 ? <EmptyState title="No active programs or memberships." body="Anything you join online will appear here." /> : (
            <ul className="divide-y divide-border">
              {ents.map((e) => (<li key={e.id} className="flex items-center justify-between py-3"><div><p className="font-medium">{e.product.title}</p><p className="text-sm text-text-secondary">Since {fmtDate(e.startsAt)}</p></div><Badge tone={e.status === "active" ? "success" : "neutral"}>{e.status}</Badge></li>))}
            </ul>
          )}
          <form action="/api/billing-portal" method="post" className="mt-5"><button className="btn btn-outline btn-sm">Manage payment methods and receipts</button></form>
        </Panel>
        <Panel title="Appointments, packages, and gift cards">
          <p className="text-text-secondary">These are handled in our booking system, where you can see packages, receipts, and saved cards.</p>
          <SmartLink href={timely.href} external={timely.external} className="btn btn-outline btn-sm mt-5">Open booking account</SmartLink>
        </Panel>
      </div>
    </>
  );
}
