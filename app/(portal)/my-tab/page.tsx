import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { requireClient } from "@/lib/portal";
import { clientLoginHref, bookingHref } from "@/lib/links";
import { fmtDate, fmtDateTime, serviceName, daysUntil } from "@/lib/portal/format";
import { Panel, TextLink, StageTracker, ProgressBar, Badge } from "@/components/portal/ui";
import { ActivityCheck } from "@/components/portal/interactive";
import { SmartLink } from "@/components/SmartLink";
import { PageHero } from "@/components/PageHero";
import { getService } from "@/content/services";

/** Step 19.14 interim page when the portal is not enabled: My TAB links to Timely Client Login. */
function InterimMyTab() {
  const login = clientLoginHref();
  return (
    <>
      <PageHero eyebrow="Client Login" title="Manage your appointments." lead="Book, reschedule, and manage packages and payment details through our online booking system.">
        <SmartLink href={login.href} external={login.external} className="btn btn-primary">Client login</SmartLink>
        <Link href="/book" className="btn btn-outline">Book</Link>
      </PageHero>
    </>
  );
}

export default async function MyTabHome() {
  if (!siteConfig.portal.enabled) return <InterimMyTab />;
  const { viewer, clientId, repo } = await requireClient();
  const d = await repo.getDashboard(clientId);
  const hour = new Date().toLocaleString("en-US", { hour: "numeric", hour12: false, timeZone: "America/Detroit" });
  const greeting = Number(hour) < 12 ? "Good morning" : Number(hour) < 17 ? "Good afternoon" : "Good evening";
  const open = d.todaysActivities.filter((a) => !a.done).length;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-label text-secondary">My TAB</p>
        <h1 className="text-h1 mt-2">{greeting}, {viewer.name}.</h1>
        <p className="mt-2 text-text-secondary">{open > 0 ? `You have ${open} thing${open === 1 ? "" : "s"} to focus on this week.` : "You’re all caught up this week. Nice work."}</p>
      </div>

      {d.checkInDue && (
        <div className="flex flex-col items-start justify-between gap-4 on-dark rounded-[20px] bg-olive p-6 text-white md:flex-row md:items-center">
          <div><p className="text-h4">Your weekly check-in is ready</p><p className="text-white/85">Two minutes to reflect on energy, sleep, stress, and wins.</p></div>
          <Link href="/my-tab/progress#check-in" className="btn bg-white text-olive hover:bg-cream">Check in</Link>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Panel title="This week" action={<TextLink href="/my-tab/programs">All programs</TextLink>}>
          <div className="space-y-3">
            {d.todaysActivities.map(({ program, activity, done }) => (
              <ActivityCheck key={program.id + activity.id} programId={program.id} activityId={activity.id} title={activity.title} done={done}
                detail={[program.template.title, activity.prescription && Object.values(activity.prescription).join(" × ")].filter(Boolean).join(" · ")} />
            ))}
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel title="Next appointment" action={<TextLink href="/my-tab/appointments">All</TextLink>}>
            {d.nextAppointment ? (
              <div className="flex items-center gap-4">
                <Image src={getService(d.nextAppointment.service)?.icon ?? "/brand/symbol-512.png"} alt="" width={56} height={56} />
                <div>
                  <p className="font-semibold">{serviceName(d.nextAppointment.service)}</p>
                  <p className="text-sm text-text-secondary">{fmtDateTime(d.nextAppointment.startsAt)} · {d.nextAppointment.location}</p>
                </div>
              </div>
            ) : (
              <SmartLink href={bookingHref().href} external={bookingHref().external} className="btn btn-primary btn-sm">Book a session</SmartLink>
            )}
          </Panel>

          {d.plan && (
            <Panel title="Your journey" action={<TextLink href="/my-tab/plan">My plan</TextLink>}>
              <StageTracker stage={d.client.methodStage} />
              <p className="mt-5 font-semibold">{d.plan.title}</p>
              {d.plan.reviewDate && <p className="mt-1 text-sm text-text-secondary">Progress review {fmtDate(d.plan.reviewDate, { month: "long", day: "numeric" })} · in {daysUntil(d.plan.reviewDate)} days</p>}
            </Panel>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Panel title="Programs">
          <div className="space-y-5">
            {d.programs.map((p) => {
              const total = p.template.modules.reduce((n, m) => n + m.activities.length, 0);
              return (
                <Link key={p.id} href={`/my-tab/programs/${p.id}`} className="block rounded-xl p-2 -m-2 hover:bg-cream">
                  <div className="mb-2 flex items-center justify-between"><span className="font-semibold">{p.template.title}</span><Badge>Week {p.currentWeek}{p.template.durationWeeks ? ` of ${p.template.durationWeeks}` : ""}</Badge></div>
                  <ProgressBar value={total ? p.completedActivityIds.length / total : 0} label="Completed" />
                </Link>
              );
            })}
          </div>
        </Panel>
        <Panel title="For you" action={<TextLink href="/my-tab/resources">All resources</TextLink>}>
          <ul className="divide-y divide-border">
            {d.pendingForms.map((f) => (
              <li key={f.template.slug} className="flex items-center justify-between gap-3 py-3">
                <div><p className="font-medium">{f.template.title}</p>{f.dueOn && <p className="text-sm text-text-secondary">Before {fmtDate(f.dueOn)}</p>}</div>
                <Link href={`/my-tab/forms/${f.template.slug}`} className="btn btn-secondary btn-sm">Start</Link>
              </li>
            ))}
            {d.resources.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 py-3">
                <div><p className="font-medium">{r.title}</p><p className="text-sm text-text-secondary">{r.kind}{r.note ? ` · ${r.note}` : ""}</p></div>
                {!r.viewedAt && <Badge tone="accent">New</Badge>}
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {d.latestSharedReview && (
        <Panel title="From your practitioner">
          <p className="text-sm text-text-secondary">Progress review · {fmtDate(d.latestSharedReview.date, { month: "long", day: "numeric" })}</p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-2xl leading-snug">“{d.latestSharedReview.summary}”</p>
          {d.latestSharedReview.nextSteps && <p className="mt-3"><span className="font-semibold">Next: </span>{d.latestSharedReview.nextSteps}</p>}
        </Panel>
      )}
    </div>
  );
}
