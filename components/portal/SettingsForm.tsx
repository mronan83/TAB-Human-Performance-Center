"use client";

import { useActionState } from "react";
import { saveSettingsAction } from "@/app/(portal)/actions";
import type { SettingsRecord } from "@/lib/settings";
import type { ServiceSlug } from "@/content/services";
import { fmtDate } from "@/lib/portal/format";

type Gate = { label: string; done: boolean }[];

function Switch({ name, label, hint, defaultChecked, locked = false }: { name: string; label: string; hint: string; defaultChecked: boolean; locked?: boolean }) {
  return (
    <label className={`flex items-start justify-between gap-6 border-t border-border py-5 first:border-t-0 first:pt-0 ${locked ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}>
      <span>
        <span className="block font-semibold">{label}</span>
        <span className="mt-1 block text-sm text-text-secondary">{hint}</span>
      </span>
      <input type="checkbox" name={name} defaultChecked={defaultChecked} disabled={locked} className="mt-1 h-6 w-6 shrink-0 accent-[var(--color-primary)]" />
    </label>
  );
}

export function SettingsForm({ settings, gate, canGoLive, services }: { settings: SettingsRecord; gate: Gate; canGoLive: boolean; services: { slug: ServiceSlug; name: string }[] }) {
  const [state, action, pending] = useActionState(saveSettingsAction, null);
  return (
    <form action={action} className="space-y-6">
      <section className="rounded-[20px] border border-border bg-white p-6" aria-labelledby="portal-heading">
        <h2 id="portal-heading" className="text-h4">Client portal (My TAB)</h2>
        <p className="mt-1 text-sm text-text-secondary">Off: the site shows no client sign-in; Book covers Timely. Live: “My TAB” appears in the site header and footer, and clients sign in.</p>
        <fieldset className="mt-4 grid gap-3 sm:grid-cols-2">
          <legend className="sr-only">Client portal</legend>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border-input p-4 has-[:checked]:border-primary has-[:checked]:bg-note-soft">
            <input type="radio" name="portalMode" value="off" defaultChecked={settings.portalMode !== "live" || !canGoLive} className="mt-1 accent-[var(--color-primary)]" />
            <span><span className="block font-semibold">Off</span><span className="text-sm text-text-secondary">Clients use Timely</span></span>
          </label>
          <label className={`flex items-start gap-3 rounded-xl border border-border-input p-4 has-[:checked]:border-primary has-[:checked]:bg-note-soft ${canGoLive ? "cursor-pointer" : "cursor-not-allowed opacity-70"}`}>
            <input type="radio" name="portalMode" value="live" disabled={!canGoLive} defaultChecked={settings.portalMode === "live" && canGoLive} className="mt-1 accent-[var(--color-primary)]" aria-describedby="gate" />
            <span><span className="block font-semibold">Live</span><span className="text-sm text-text-secondary">{canGoLive ? "Clients sign in to My TAB" : "Available when the checklist is complete"}</span></span>
          </label>
        </fieldset>
        <div id="gate" className="mt-5">
          <p className="text-label text-text-secondary">Go-live checklist</p>
          <ul className="mt-3 space-y-2 text-sm">
            {gate.map((g) => (
              <li key={g.label} className="flex items-start gap-3">
                <span aria-hidden="true" className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${g.done ? "bg-olive text-white" : "border border-border-input"}`}>{g.done ? "✓" : ""}</span>
                <span>{g.label}<span className="sr-only">{g.done ? " (done)" : " (not yet)"}</span></span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-text-secondary">The database, security and backup items are confirmed when you approve the go-live release.</p>
        </div>
      </section>

      <section className="rounded-[20px] border border-border bg-white p-6" aria-label="Website">
        <h2 className="text-h4 mb-4">Website</h2>
        <Switch name="transitionBanner" label="Name-change banner" hint="“TAB Massage & Fitness is becoming TAB Human Performance Center.” across the top of every page. It also ends on its own after June 2027." defaultChecked={settings.transitionBanner} />
        <Switch name="startFormOpen" label="Start Where You Are form" hint="When off, the Start page asks visitors to call, email or book instead of taking a new submission." defaultChecked={settings.startFormOpen} />
      </section>

      <section className="rounded-[20px] border border-border bg-white p-6" aria-labelledby="pages-heading">
        <h2 id="pages-heading" className="text-h4 mb-4">Pages</h2>
        <Switch name="feature_resources" label="Resources" hint="The Resources page, its menu entry and the homepage section." defaultChecked={settings.features.resources} />
        <Switch name="feature_team" label="Our Team" hint="The team page and its menu entries." defaultChecked={settings.features.team} />
        <Switch name="feature_events" label="Events & Workshops" hint="Available once there are events to list. Today the page would be empty." defaultChecked={false} locked />
        <Switch name="feature_testimonials" label="Testimonials" hint="Available once you have real testimonials with each client’s written permission. We never use made-up ones." defaultChecked={false} locked />
      </section>

      <section className="rounded-[20px] border border-border bg-white p-6" aria-labelledby="booking-heading">
        <h2 id="booking-heading" className="text-h4">Book buttons</h2>
        <p className="mt-1 text-sm text-text-secondary">A Timely link for each service’s Book buttons, for example the page for that service or category. Leave one blank to use the main booking page.</p>
        <div className="mt-4 grid gap-4">
          {services.map((s) => (
            <div key={s.slug}>
              <label htmlFor={`booking_${s.slug}`} className="field-label">{s.name}</label>
              <input id={`booking_${s.slug}`} name={`booking_${s.slug}`} type="url" inputMode="url" maxLength={500} placeholder="Main booking page" defaultValue={settings.bookingLinks[s.slug] ?? ""} className="field-input" pattern="https://\S+" aria-describedby="booking-hint" />
            </div>
          ))}
        </div>
        <p id="booking-hint" className="mt-3 text-xs text-text-secondary">Links must start with https://.</p>
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <button className="btn btn-primary" disabled={pending}>{pending ? "Saving…" : "Save settings"}</button>
        <p role="status" className="text-sm">
          {state?.ok ? <span className="font-semibold text-success">Saved. The website updates within a few seconds.</span>
            : state?.error ? <span className="font-semibold text-danger">{state.error}</span>
            : settings.updatedAt ? <span className="text-text-secondary">Last changed {fmtDate(settings.updatedAt.slice(0, 10))}</span> : null}
        </p>
      </div>
    </form>
  );
}
