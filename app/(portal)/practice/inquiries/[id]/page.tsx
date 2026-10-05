import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/portal";
import { fmtDate, fmtDateTime } from "@/lib/portal/format";
import { PageTitle, Panel, Badge } from "@/components/portal/ui";
import {
  availabilityOptions, considerationOptions, contactOptions, deliveryOptions, foundViaOptions, helpOptions, journeyOptions, labelFor, labelsFor,
  outcomeOptions, routingOptions, serviceOptions, topicOptions,
} from "@/lib/inquiry";
import { createClientFromInquiryAction, linkInquiryAction, routeInquiryAction } from "@/app/(portal)/actions";
import { flagLabels, type SpamFlag } from "@/lib/spam";

export default async function InquiryDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { viewer, repo } = await requireStaff();
  const detail = await repo.getInquiry(id);
  if (!detail) notFound();
  const { inquiry: i, matches, related } = detail;
  const isOwner = viewer.role === "owner";
  const isStart = i.kind === "start";

  // Every answer is one of our options (proposed D-059), shown by its label.
  const answers: [string, string[]][] = isStart
    ? [
        ["Where are you starting from?", labelsFor(journeyOptions, i.journey ? [i.journey] : [])],
        ["What would you most like help with?", labelsFor(helpOptions, i.help)],
        ["Which service are you interested in?", labelsFor(serviceOptions, i.serviceInterest ? [i.serviceInterest] : [])],
        ["If things improved, what would you like to feel, do, or experience differently?", labelsFor(outcomeOptions, i.outcomes)],
        ["Anything we should know before finding the right starting point?", labelsFor(considerationOptions, i.considerations)],
      ]
    : [["What can we help with?", labelsFor(topicOptions, i.topic ? [i.topic] : [])]];
  const message = i.kind === "contact" ? i.message : undefined;
  const healthFlag = i.considerations.includes("health-private");
  const practical: [string, string | undefined][] = [
    ["Email", i.email],
    ["Phone", i.phone],
    ["Best way to reach", i.contactPreference && labelFor(contactOptions, i.contactPreference)],
    ["In person or virtual", i.delivery && labelFor(deliveryOptions, i.delivery)],
    ["Days or times", labelsFor(availabilityOptions, i.availability).join("; ") || undefined],
    ["How they found TAB", i.foundVia && labelFor(foundViaOptions, i.foundVia)],
    ["News and events by email", i.marketingOptIn ? "Yes" : "No"],
  ];

  return (
    <>
      <PageTitle
        eyebrow={isStart ? "Start Where You Are" : "Contact message"}
        title={i.name}
        lead={`Received ${fmtDateTime(i.receivedAt)} · Reference ${i.reference}`}
        action={i.routingOutcome ? <Badge tone="success">{labelFor(routingOptions, i.routingOutcome)}</Badge> : isStart ? <Badge tone="accent">Needs a next step</Badge> : undefined}
      />
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <Panel title="What they told us">
            {i.flags.length > 0 && (
              <p className="mb-5 rounded-xl bg-linen p-4">
                <span className="font-semibold">Possible spam:</span> {i.flags.map((f) => flagLabels[f as SpamFlag] ?? f).join("; ")}. No copy was emailed to this address.
              </p>
            )}
            {healthFlag && (
              <p className="mb-5 rounded-xl bg-accent-soft p-4 font-medium">
                They’d like to discuss something health-related privately. Follow up before anything is booked.
              </p>
            )}
            <dl className="space-y-5">
              {answers.map(([q, a]) => (
                <div key={q}>
                  <dt className="text-sm font-semibold text-text-secondary">{q}</dt>
                  <dd className="mt-1">
                    {a.length === 0 ? "—" : a.length === 1 ? a[0] : <ul className="list-disc space-y-1 pl-5">{a.map((v) => <li key={v}>{v}</li>)}</ul>}
                  </dd>
                </div>
              ))}
              {message && (
                <div>
                  <dt className="text-sm font-semibold text-text-secondary">Message</dt>
                  <dd className="mt-1 whitespace-pre-wrap">{message}</dd>
                </div>
              )}
            </dl>
          </Panel>
          <Panel title="Contact and practical details">
            <dl className="grid gap-4 sm:grid-cols-2">
              {practical.map(([k, v]) => (
                <div key={k}><dt className="text-sm text-text-secondary">{k}</dt><dd className="mt-0.5 font-medium">{v || "—"}</dd></div>
              ))}
            </dl>
          </Panel>
        </div>

        <div className="space-y-6">
          {isOwner && (
            <Panel title="Next step">
              <form action={routeInquiryAction.bind(null, i.id)} className="space-y-4">
                <fieldset>
                  <legend className="field-label">Choose one</legend>
                  <div className="grid gap-2">
                    {routingOptions.map((o) => (
                      <label key={o.value} className="flex items-start gap-3 rounded-xl border border-border p-3 hover:border-primary">
                        <input type="radio" name="outcome" value={o.value} defaultChecked={i.routingOutcome === o.value} className="mt-1 h-5 w-5 accent-[var(--color-primary)]" />
                        <span>{o.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div>
                  <label htmlFor="note" className="field-label">Internal note (optional)</label>
                  <textarea id="note" name="note" defaultValue={i.routingNote} className="field-input min-h-24" aria-describedby="note-hint" />
                  <p id="note-hint" className="field-hint">Only TAB staff see this.</p>
                </div>
                <button className="btn btn-primary btn-sm">Save next step</button>
                {i.routedAt && <p className="text-sm text-text-secondary">Last recorded {fmtDateTime(i.routedAt)}</p>}
              </form>
            </Panel>
          )}
          {!isOwner && i.routingNote && <Panel title="Internal note"><p className="whitespace-pre-wrap">{i.routingNote}</p></Panel>}

          <Panel title="Client record">
            {i.clientId ? (
              <p>Linked to <Link href={`/practice/clients/${i.clientId}`} className="font-semibold text-primary underline underline-offset-4">{i.clientName ?? "client record"}</Link>.</p>
            ) : isOwner ? (
              <div className="space-y-4">
                <p className="text-sm text-text-secondary">
                  Linking uses the email address: every unlinked submission from {i.email} joins the same client record. When they
                  activate My TAB with this email and confirm it, their account links to that record too.
                </p>
                {matches.map((c) => (
                  <form key={c.id} action={linkInquiryAction.bind(null, i.id, c.id)}>
                    <button className="btn btn-outline btn-sm w-full justify-center">Link to {c.fullName} ({c.status})</button>
                  </form>
                ))}
                <form action={createClientFromInquiryAction.bind(null, i.id)}>
                  <button className="btn btn-primary btn-sm w-full justify-center">Create a client record</button>
                </form>
              </div>
            ) : (
              <p className="text-text-secondary">Not linked yet.</p>
            )}
          </Panel>

          {related.length > 0 && (
            <Panel title="Other submissions from this email">
              <ul className="space-y-2">
                {related.map((r) => (
                  <li key={r.id}>
                    <Link href={`/practice/inquiries/${r.id}`} className="text-primary underline underline-offset-4">{r.kind === "start" ? "Start Where You Are" : "Contact message"}</Link>
                    <span className="text-sm text-text-secondary"> · {fmtDate(r.receivedAt)}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>
      </div>
    </>
  );
}
