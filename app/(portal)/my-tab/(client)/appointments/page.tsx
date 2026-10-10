import Image from "next/image";
import { requireClient } from "@/lib/portal";
import { fmtDateTime, serviceName } from "@/lib/portal/format";
import { bookingHref, clientLoginHref } from "@/lib/links";
import { getService } from "@/content/services";
import { PageTitle, Panel, EmptyState } from "@/components/portal/ui";
import { SmartLink } from "@/components/SmartLink";

/** Timely remains the scheduling system of record (D-003); this page shows upcoming visits and links to Timely. */
export default async function AppointmentsPage() {
  const { clientId, repo } = await requireClient();
  const appts = await repo.listAppointments(clientId);
  const book = bookingHref(), manage = clientLoginHref();
  return (
    <>
      <PageTitle eyebrow="Appointments" title="Your schedule"
        action={<div className="flex gap-2"><SmartLink href={book.href} external={book.external} className="btn btn-primary btn-sm">Book</SmartLink><SmartLink href={manage.href} external={manage.external} className="btn btn-outline btn-sm">Reschedule or cancel</SmartLink></div>} />
      {appts.length === 0 ? <EmptyState title="No upcoming appointments." /> : (
        <ul className="space-y-4">
          {appts.map((a) => (
            <li key={a.id}>
              <Panel>
                <div className="flex items-center gap-4">
                  <Image src={getService(a.service)?.icon ?? ""} alt="" width={56} height={56} />
                  <div className="flex-1"><p className="font-semibold">{serviceName(a.service)}</p><p className="text-sm text-text-secondary">{fmtDateTime(a.startsAt)} · {a.location}</p></div>
                </div>
              </Panel>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-8 text-sm text-text-secondary">Appointments, packages, and gift cards are managed in our booking system. Changes there can take a little while to appear here.</p>
    </>
  );
}
