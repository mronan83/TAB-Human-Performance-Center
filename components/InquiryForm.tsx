"use client";

import { useEffect, useRef, useState } from "react";
import { contactOptions, deliveryOptions, foundViaOptions, helpOptions, serviceOptions } from "@/lib/inquiry";
import { siteConfig } from "@/config/site";

type Errors = Record<string, string[] | undefined>;

/** Field order for moving focus to the first problem after a failed submit. */
const FIELD_ORDER = ["name", "email", "phone", "message", "help", "service", "improved", "considerations", "delivery", "availability", "foundVia", "consentContact"];
const PRACTICAL = ["delivery", "availability", "foundVia"];
/** R-027 / D-054: submissions travel by email, so free-text fields ask for no medical details. */
const NO_MEDICAL = "Please don’t include medical details. We’ll ask for anything health-related securely, when it’s needed.";

/**
 * Start Where You Are (kind="start", GS-001: the S14 §14.4.1 Get Started form) and general contact
 * (kind="contact") share one accessible form. Optional practical details are progressively disclosed (GS-003).
 */
export function InquiryForm({ kind }: { kind: "start" | "contact" }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [practicalOpen, setPracticalOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);
  const isStart = kind === "start";

  useEffect(() => {
    if (status === "sent") doneRef.current?.focus();
  }, [status]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const text = (k: string) => (fd.get(k) as string | null) ?? "";
    const payload = {
      kind,
      name: text("name"),
      email: text("email"),
      phone: text("phone"),
      contactPreference: text("contactPreference") || undefined,
      message: text("message"),
      help: fd.getAll("help"),
      service: text("service") || undefined,
      improved: text("improved"),
      considerations: text("considerations"),
      delivery: text("delivery") || undefined,
      availability: text("availability"),
      foundVia: text("foundVia") || undefined,
      consentContact: fd.get("consentContact") === "on",
      marketingOptIn: fd.get("marketingOptIn") === "on",
      company: text("company"),
    };
    setStatus("sending");
    setErrors({});
    setFormError("");
    const res = await fetch("/api/inquiry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    if (res?.ok && data.ok) {
      setStatus("sent");
      return;
    }
    const fieldErrors: Errors = data.errors ?? {};
    setStatus("error");
    setErrors(fieldErrors);
    setFormError(data.error ?? "Please check the highlighted fields and try again.");
    const first = FIELD_ORDER.find((k) => fieldErrors[k]?.length);
    if (first && PRACTICAL.includes(first)) setPracticalOpen(true);
    // Focus the first invalid field (or the summary) once any disclosure has opened.
    requestAnimationFrame(() => {
      const target = first ? formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`) : null;
      (target ?? formRef.current?.querySelector<HTMLElement>("#form-error"))?.focus();
    });
  }

  if (status === "sent") {
    return (
      <div className="card p-8">
        <h2 ref={doneRef} tabIndex={-1} className="text-h2 outline-none">Thank you. We’ve got it.</h2>
        <p className="mt-4 text-body-lg text-text-secondary">
          {isStart
            ? "We’ll read what you shared and reply with a suggested starting point: booking directly, a short conversation, the right intake, or another resource if TAB isn’t the best fit."
            : "We’ll read your message and get back to you soon."}
        </p>
      </div>
    );
  }

  const err = (k: string) => errors[k]?.[0];

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="card space-y-10 p-6 md:p-10">
      {formError && (
        <p id="form-error" role="alert" tabIndex={-1} className="rounded-xl bg-accent-soft p-4 font-medium text-danger">
          {formError}
        </p>
      )}

      <Section title="About you">
        <div className="grid gap-6 md:grid-cols-2">
          <Field id="name" label="Your name" error={err("name")} required autoComplete="name" />
          <Field id="email" label="Email" type="email" error={err("email")} required autoComplete="email" />
          <Field id="phone" label="Phone (optional)" type="tel" error={err("phone")} autoComplete="tel" />
          <div>
            <label htmlFor="contactPreference" className="field-label">Best way to reach you</label>
            <select id="contactPreference" name="contactPreference" className="field-input" defaultValue="email">
              {contactOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </Section>

      <Section title={isStart ? "Where you are" : "Your message"}>
        <TextArea
          id="message"
          label={isStart ? "What brings you to TAB?" : "How can we help?"}
          hint={NO_MEDICAL}
          error={err("message")}
          required
        />

        {isStart && (
          <>
            <Choices
              name="help"
              type="checkbox"
              legend="What would you most like help with?"
              hint="Choose any that fit."
              options={helpOptions}
              error={err("help")}
              columns
            />
            <Choices
              name="service"
              type="radio"
              legend="Which service are you interested in?"
              hint="You don’t need to know yet. “I’m not sure” is a great place to start."
              options={serviceOptions}
              error={err("service")}
            />
          </>
        )}
      </Section>

      {isStart && (
        <Section title="Where you want to go">
          <TextArea
            id="improved"
            label="If things improved, what would you like to be able to feel, do, or experience differently? (optional)"
            hint={NO_MEDICAL}
            error={err("improved")}
          />
          <TextArea
            id="considerations"
            label="Is there anything we should know before helping you find the right starting point? (optional)"
            hint={`For example timing, access needs, or who referred you. ${NO_MEDICAL}`}
            error={err("considerations")}
          />
        </Section>
      )}

      {isStart && (
        <details
          className="rounded-[20px] border border-border p-6"
          open={practicalOpen}
          onToggle={(e) => setPracticalOpen((e.currentTarget as HTMLDetailsElement).open)}
        >
          <summary className="cursor-pointer text-h4">Practical details (optional)</summary>
          <div className="mt-6 space-y-6">
            <Choices
              name="delivery"
              type="radio"
              legend="In person, virtual, or either?"
              options={deliveryOptions}
              error={err("delivery")}
              inline
            />
            <Field id="availability" label="Days or times that usually work" error={err("availability")} />
            <div>
              <label htmlFor="foundVia" className="field-label">How did you find TAB?</label>
              <select id="foundVia" name="foundVia" className="field-input" defaultValue="" aria-invalid={!!err("foundVia")} aria-describedby={err("foundVia") ? "foundVia-err" : undefined}>
                <option value="">Choose one (optional)</option>
                {foundViaOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ErrorText id="foundVia" error={err("foundVia")} />
            </div>
          </div>
        </details>
      )}

      {/* Honeypot: hidden from people and assistive technology. */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <div className="space-y-3">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            name="consentContact"
            className="mt-1 h-5 w-5 accent-[var(--color-primary)]"
            aria-invalid={!!err("consentContact")}
            aria-describedby={err("consentContact") ? "consentContact-err" : undefined}
          />
          <span>I agree that {siteConfig.brand.name} may contact me about this inquiry.</span>
        </label>
        <ErrorText id="consentContact" error={err("consentContact")} />
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-6">
      <h2 className="text-h4">{title}</h2>
      {children}
    </section>
  );
}

function ErrorText({ id, error }: { id: string; error?: string }) {
  return error ? <p id={`${id}-err`} className="mt-1 text-sm font-medium text-danger">{error}</p> : null;
}

const describedBy = (...ids: (string | false | undefined)[]) => ids.filter(Boolean).join(" ") || undefined;

function Field({ id, label, type = "text", error, required, autoComplete }: { id: string; label: string; type?: string; error?: string; required?: boolean; autoComplete?: string }) {
  return (
    <div>
      <label htmlFor={id} className="field-label">{label}</label>
      <input
        id={id}
        name={id}
        type={type}
        className="field-input"
        required={required}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={describedBy(error && `${id}-err`)}
      />
      <ErrorText id={id} error={error} />
    </div>
  );
}

function TextArea({ id, label, hint, error, required }: { id: string; label: string; hint: string; error?: string; required?: boolean }) {
  return (
    <div>
      <label htmlFor={id} className="field-label">{label}</label>
      <textarea
        id={id}
        name={id}
        className="field-input"
        required={required}
        aria-invalid={!!error}
        aria-describedby={describedBy(`${id}-hint`, error && `${id}-err`)}
      />
      <p id={`${id}-hint`} className="field-hint">{hint}</p>
      <ErrorText id={id} error={error} />
    </div>
  );
}

function Choices({
  name,
  type,
  legend,
  hint,
  options,
  error,
  columns,
  inline,
}: {
  name: string;
  type: "checkbox" | "radio";
  legend: string;
  hint?: string;
  options: readonly { value: string; label: string }[];
  error?: string;
  columns?: boolean;
  inline?: boolean;
}) {
  return (
    <fieldset aria-describedby={describedBy(hint && `${name}-hint`, error && `${name}-err`)}>
      <legend className="field-label">{legend}</legend>
      {hint && <p id={`${name}-hint`} className="field-hint mt-0 mb-3">{hint}</p>}
      <div className={inline ? "flex flex-wrap gap-3" : columns ? "grid gap-3 md:grid-cols-2" : "grid gap-3"}>
        {options.map((o) => (
          <label
            key={o.value}
            className={
              inline
                ? "flex items-center gap-2 rounded-full border border-border px-4 py-2"
                : "flex items-start gap-3 rounded-xl border border-border p-4 hover:border-primary"
            }
          >
            <input type={type} name={name} value={o.value} className={`${inline ? "" : "mt-1 "}h-5 w-5 accent-[var(--color-primary)]`} />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
      <ErrorText id={name} error={error} />
    </fieldset>
  );
}
