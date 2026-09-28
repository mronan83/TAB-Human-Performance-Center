"use client";

import { useState } from "react";
import { interestOptions } from "@/lib/inquiry";
import { siteConfig } from "@/config/site";

type Errors = Record<string, string[] | undefined>;

/** Start Where You Are (kind="start") and general contact (kind="contact") share one accessible form. */
export function InquiryForm({ kind }: { kind: "start" | "contact" }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const isStart = kind === "start";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      kind,
      name: fd.get("name"),
      email: fd.get("email"),
      phone: fd.get("phone") ?? "",
      contactPreference: fd.get("contactPreference") || undefined,
      interests: fd.getAll("interests"),
      delivery: fd.get("delivery") || undefined,
      message: fd.get("message"),
      availability: fd.get("availability") ?? "",
      referral: fd.get("referral") ?? "",
      consentContact: fd.get("consentContact") === "on",
      marketingOptIn: fd.get("marketingOptIn") === "on",
      company: fd.get("company") ?? "",
    };
    setStatus("sending"); setErrors({}); setFormError("");
    const res = await fetch("/api/inquiry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    if (res?.ok && data.ok) { setStatus("sent"); return; }
    setStatus("error");
    if (data.errors) setErrors(data.errors);
    setFormError(data.error ?? "Please check the highlighted fields and try again.");
  }

  if (status === "sent") {
    return (
      <div role="status" className="card p-8">
        <h2 className="text-h2">Thank you. We’ve got it.</h2>
        <p className="mt-4 text-body-lg text-text-secondary">
          We’ll read what you shared and reply within one to two business days with a suggested starting point.
        </p>
      </div>
    );
  }

  const err = (k: string) => errors[k]?.[0];

  return (
    <form onSubmit={onSubmit} noValidate className="card space-y-8 p-6 md:p-10" aria-describedby={formError ? "form-error" : undefined}>
      {formError && <p id="form-error" role="alert" className="rounded-xl bg-accent-soft p-4 font-medium text-danger">{formError}</p>}

      <div className="grid gap-6 md:grid-cols-2">
        <Field id="name" label="Your name" error={err("name")} required autoComplete="name" />
        <Field id="email" label="Email" type="email" error={err("email")} required autoComplete="email" />
        <Field id="phone" label="Phone (optional)" type="tel" autoComplete="tel" />
        <div>
          <label htmlFor="contactPreference" className="field-label">Best way to reach you</label>
          <select id="contactPreference" name="contactPreference" className="field-input" defaultValue="email">
            <option value="email">Email</option><option value="phone">Phone call</option><option value="text">Text message</option>
          </select>
        </div>
      </div>

      {isStart && (
        <fieldset>
          <legend className="field-label">What are you looking for? Choose any that fit.</legend>
          <div className="mt-2 grid gap-3">
            {interestOptions.map((o) => (
              <label key={o.value} className="flex items-start gap-3 rounded-xl border border-border p-4 hover:border-primary">
                <input type="checkbox" name="interests" value={o.value} className="mt-1 h-5 w-5 accent-[var(--color-primary)]" />
                <span>{o.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {isStart && (
        <fieldset>
          <legend className="field-label">In person, virtual, or either?</legend>
          <div className="mt-2 flex flex-wrap gap-3">
            {[["in-person", "In person"], ["virtual", "Virtual"], ["either", "Either"]].map(([v, l]) => (
              <label key={v} className="flex items-center gap-2 rounded-full border border-border px-4 py-2">
                <input type="radio" name="delivery" value={v} defaultChecked={v === "either"} className="accent-[var(--color-primary)]" /> {l}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div>
        <label htmlFor="message" className="field-label">
          {isStart ? "What would you like to change, or be able to do?" : "How can we help?"}
        </label>
        <textarea id="message" name="message" className="field-input" required aria-invalid={!!err("message")} aria-describedby="message-hint" />
        <p id="message-hint" className="field-hint">
          Please don’t include detailed medical information here. We’ll gather what’s relevant securely during intake.
        </p>
        {err("message") && <p className="mt-1 text-sm font-medium text-danger">{err("message")}</p>}
      </div>

      {isStart && (
        <div className="grid gap-6 md:grid-cols-2">
          <Field id="availability" label="Days or times that usually work (optional)" />
          <Field id="referral" label="How did you hear about TAB? (optional)" />
        </div>
      )}

      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <div className="space-y-3">
        <label className="flex items-start gap-3">
          <input type="checkbox" name="consentContact" className="mt-1 h-5 w-5 accent-[var(--color-primary)]" aria-invalid={!!err("consentContact")} />
          <span>I agree that {siteConfig.brand.name} may contact me about this inquiry.</span>
        </label>
        {err("consentContact") && <p className="text-sm font-medium text-danger">{err("consentContact")}</p>}
        <label className="flex items-start gap-3">
          <input type="checkbox" name="marketingOptIn" className="mt-1 h-5 w-5 accent-[var(--color-primary)]" />
          <span>Send me occasional news, guides, and events. (Optional; unsubscribe anytime.)</span>
        </label>
      </div>

      <button type="submit" className="btn btn-primary" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : isStart ? "Send and find my starting point" : "Send message"}
      </button>
    </form>
  );
}

function Field({ id, label, type = "text", error, required, autoComplete }: { id: string; label: string; type?: string; error?: string; required?: boolean; autoComplete?: string }) {
  return (
    <div>
      <label htmlFor={id} className="field-label">{label}</label>
      <input id={id} name={id} type={type} className="field-input" required={required} autoComplete={autoComplete} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} />
      {error && <p id={`${id}-err`} className="mt-1 text-sm font-medium text-danger">{error}</p>}
    </div>
  );
}
