"use client";

import { useEffect, useId, useRef, useState } from "react";
import { siteConfig } from "@/config/site";
import { useTurnstile } from "@/components/Turnstile";

/**
 * A document that asks for an email address first (C35), as a line in its topic's list: the subject is a button that
 * opens a short form under it (owner request 2026-10-08). A name and an email address only; it posts to /api/inquiry
 * with the same spam layers as the other forms (SEC-013), and the link arrives by email. An expired emailed link comes
 * back here (/resources?link=expired&r=<slug>) with the form already open.
 */
export function ResourceRequest({ slug, title, label, meta, children }: { slug: string; title: string; label: string; meta: string; children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const [formError, setFormError] = useState("");
  const mountedAt = useRef(0);
  const doneRef = useRef<HTMLParagraphElement>(null);
  const firstRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const turnstile = useTurnstile("resource");
  const id = useId();
  const f = (k: string) => `${id}-${k}`;

  useEffect(() => {
    mountedAt.current = Date.now();
    if (new URLSearchParams(window.location.search).get("r") === slug) setOpen(true);
  }, [slug]);
  useEffect(() => {
    if (open && status === "idle") firstRef.current?.focus();
    if (status === "sent") doneRef.current?.focus();
  }, [open, status]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (turnstile.enabled && !turnstile.token) {
      setStatus("error");
      setFormError(turnstile.blocked ? `Our spam check couldn’t load. Please email ${siteConfig.contact.email} and we’ll send it.` : "Just a moment: we’re checking this is a real browser. Please try again in a few seconds.");
      return;
    }
    const fd = new FormData(e.currentTarget);
    setStatus("sending");
    setErrors({});
    setFormError("");
    const res = await fetch("/api/inquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "resource", resource: slug, name: fd.get("name") ?? "", email: fd.get("email") ?? "",
        consentContact: fd.get("consentContact") === "on", marketingOptIn: fd.get("marketingOptIn") === "on",
        website: fd.get("website") ?? "", elapsedMs: Math.min(Date.now() - mountedAt.current, 86_400_000), turnstileToken: turnstile.token || undefined,
      }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    if (res?.ok && data.ok) {
      setSent(data.sent !== false);
      setStatus("sent");
      return;
    }
    turnstile.reset();
    setStatus("error");
    setErrors(data.errors ?? {});
    setFormError(data.error ?? "Please check the highlighted fields and try again.");
    requestAnimationFrame(() => {
      const bad = ["name", "email", "consentContact"].find((k) => data.errors?.[k]?.length);
      (bad ? formRef.current?.querySelector<HTMLElement>(`[name="${bad}"]`) : formRef.current?.querySelector<HTMLElement>("[role=alert]"))?.focus();
    });
  }

  const err = (k: string) => errors[k]?.[0];
  return (
    <div>
      <button
        type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls={f("panel")}
        aria-label={`${label}: ${meta}, we’ll email you the link`}
        className="text-left font-semibold text-primary underline decoration-border-strong underline-offset-4 hover:decoration-primary"
      >
        {label}
      </button>
      <p className="mt-1 text-sm text-text-secondary">{meta} · we’ll email you the link</p>
      {children}
      <div id={f("panel")} hidden={!open}>
        {status === "sent" ? (
          <p ref={doneRef} tabIndex={-1} role="status" className="mt-4 rounded-xl bg-linen p-4 outline-none">
            {sent ? "Check your inbox: we’ve emailed you the link." : "Thank you. We’ll email you the link shortly."}
          </p>
        ) : open && (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="mt-4 space-y-4 rounded-xl border border-border p-4" aria-label={`Email me ${title}`}>
      {formError && <p role="alert" tabIndex={-1} className="rounded-xl bg-accent-soft p-3 text-sm font-medium text-danger">{formError}</p>}
      <div>
        <label htmlFor={f("name")} className="field-label">Your name</label>
        <input ref={firstRef} id={f("name")} name="name" className="field-input" autoComplete="name" maxLength={80} required aria-invalid={!!err("name")} aria-describedby={err("name") ? f("name-err") : undefined} />
        {err("name") && <p id={f("name-err")} className="mt-1 text-sm font-medium text-danger">{err("name")}</p>}
      </div>
      <div>
        <label htmlFor={f("email")} className="field-label">Email</label>
        <input id={f("email")} name="email" type="email" className="field-input" autoComplete="email" maxLength={200} required aria-invalid={!!err("email")} aria-describedby={err("email") ? f("email-err") : undefined} />
        {err("email") && <p id={f("email-err")} className="mt-1 text-sm font-medium text-danger">{err("email")}</p>}
      </div>
      <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
        <label htmlFor={f("website")}>Leave this field empty</label>
        <input id={f("website")} type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      {turnstile.widget}
      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" name="consentContact" className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-primary)]" aria-invalid={!!err("consentContact")} aria-describedby={err("consentContact") ? f("consent-err") : undefined} />
        <span>Email me the link, and let {siteConfig.brand.name} know I asked for it.</span>
      </label>
      {err("consentContact") && <p id={f("consent-err")} className="text-sm font-medium text-danger">Please confirm we can email you the link.</p>}
      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" name="marketingOptIn" className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-primary)]" />
        <span>Also send me occasional news, guides and events. (Optional; unsubscribe anytime.)</span>
      </label>
      <button type="submit" className="btn btn-primary" disabled={status === "sending"}>{status === "sending" ? "Sending…" : "Send me the link"}</button>
    </form>
        )}
      </div>
    </div>
  );
}

/** Shown when someone opens an expired emailed link: /resources/download sends them back here to ask again. */
export function ExpiredLinkNotice() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    setShow(new URLSearchParams(window.location.search).get("link") === "expired");
  }, []);
  if (!show) return null;
  return <p role="status" className="mb-10 max-w-2xl rounded-xl bg-linen p-4">That download link has expired. We’ve opened the guide’s form below: ask again and we’ll email you a fresh link.</p>;
}
