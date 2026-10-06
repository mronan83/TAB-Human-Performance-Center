import { NextResponse } from "next/server";
import { Resend } from "resend";
import { inquirySchema } from "@/lib/inquiry";
import { storeInquiry } from "@/lib/inquiry-store";
import { MAX_BODY_BYTES, MIN_FILL_MS, duplicateGuard, limiter, sameOrigin, screenText, verifyHuman, type SpamFlag } from "@/lib/spam";
import { siteConfig } from "@/config/site";
import { buildInquiryEmails } from "@/lib/inquiry-emails";
import { getSettings } from "@/lib/settings";

// Spam defenses (SEC-013): see lib/spam.ts for the layers and why each exists. The limits below are per server
// instance; a shared limit at the edge (Vercel Firewall) is the planned complement.
const WINDOW_MS = 10 * 60_000;
const DAY_MS = 24 * 60 * 60_000;
const ipLimited = limiter(5, WINDOW_MS);
/** At most five submissions a day from one email address. */
const addressLimited = limiter(5, DAY_MS);
/** At most three copies a day to any one address, so the form can't be used to flood someone's inbox. */
const copyLimited = limiter(3, DAY_MS);
/** The same submission twice within ten minutes (a double click or a replay) is sent once. */
const duplicates = duplicateGuard(WINDOW_MS);

const json = (body: object, status = 200) => NextResponse.json(body, { status });
const failed = (status: number) => json({ ok: false, error: `We couldn’t send your message. Please email ${siteConfig.contact.email}.` }, status);
/** Dropped as spam: answer exactly like a success so bots learn nothing. */
const quietlyDropped = (reason: string) => {
  console.info("[inquiry] dropped:", reason);
  return json({ ok: true });
};

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ ok: false, error: "Please send this from our website." }, 403);
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (ipLimited(ip)) return json({ ok: false, error: "Too many submissions. Please try again later." }, 429);
  if (Number(req.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) return json({ ok: false, error: "That submission is too large." }, 413);
  const raw = await req.text().catch(() => "");
  if (raw.length > MAX_BODY_BYTES) return json({ ok: false, error: "That submission is too large." }, 413);

  const parsed = inquirySchema.safeParse((() => { try { return JSON.parse(raw); } catch { return {}; } })());
  if (!parsed.success) {
    return json({ ok: false, errors: parsed.error.flatten().fieldErrors }, 422);
  }
  const { website, elapsedMs, turnstileToken, ...answers } = parsed.data;
  const d = { ...answers, name: answers.name.replace(/[\r\n]+/g, " ").trim() };
  if (website) return quietlyDropped("honeypot");
  if ((elapsedMs ?? 0) < MIN_FILL_MS) return quietlyDropped("filled too fast");

  const flags: SpamFlag[] = [];
  const human = await verifyHuman(turnstileToken, { ip, action: d.kind, host: req.headers.get("x-forwarded-host") ?? req.headers.get("host") });
  if (human === "fail") {
    return json({ ok: false, error: `We couldn’t confirm this came from a person. Please refresh the page and try again, or email us at ${siteConfig.contact.email}.` }, 403);
  }
  if (human === "unavailable") flags.push("unverified");

  const screen = screenText(d.kind === "contact" ? d.message : undefined);
  if (screen === "markup") return quietlyDropped("link markup");
  if (screen === "links") flags.push("links");

  if (duplicates.seen(d)) return quietlyDropped("duplicate");
  if (addressLimited(d.email.toLowerCase())) {
    return json({ ok: false, error: "We’ve already received several messages from this address today. We’ll be in touch soon." }, 429);
  }

  const isStart = d.kind === "start";
  // The owner can pause online Start submissions (C23); the page hides the form, and this stops a stale tab or a bot.
  if (isStart && !(await getSettings()).startFormOpen) {
    return json({ ok: false, error: `We’re not taking Start Where You Are submissions online right now. Please email ${siteConfig.contact.email}.` }, 409);
  }
  // Subjects carry no personal details (D-054, R-027); the reference ties the emails to the stored record.
  const ref = `${Date.now().toString(36)}${crypto.randomUUID().slice(0, 4)}`.toUpperCase();

  // DIV-05: the whole form is saved (once the D-042 gate is open), then emailed. If saving fails the email
  // still carries every answer, so the submission isn't lost.
  let stored = false;
  if (siteConfig.forms.storeSubmissions) {
    try {
      await storeInquiry(d, ref, flags);
      stored = true;
    } catch (e) {
      console.error("[inquiry] store failed", ref, e);
    }
  } else if (siteConfig.portal.enabled && siteConfig.portal.dataSource === "mock") {
    // The demo portal (previews, tests): keep it in the demo's TAB Practice. Production never runs the demo.
    (await import("@/lib/portal/mock-repository")).recordDemoInquiry(d, ref, flags);
    stored = true;
  }

  const { staff, copy } = buildInquiryEmails(d, ref, flags, stored);
  // Flagged submissions never trigger a copy: a flagged form is the likeliest to carry someone else's address.
  const sendCopy = siteConfig.forms.sendSubmitterCopy && flags.length === 0 && !copyLimited(d.email.toLowerCase());

  /** Delivered (stored or emailed to TAB): only now does a repeat count as a duplicate. */
  const delivered = (body: object) => {
    duplicates.remember(d);
    return json({ ok: true, ...body });
  };

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[inquiry] RESEND_API_KEY not set; would send to", staff.to, `\n${staff.subject}\n\n${staff.text}`);
      if (sendCopy) console.info("[inquiry] and a copy to the submitter:", `\n${copy.subject}\n\n${copy.text}`);
      return delivered({ dev: true, copy: sendCopy });
    }
    return stored ? delivered({ copy: false }) : failed(503);
  }

  const resend = new Resend(key);
  try {
    const { error } = await resend.emails.send({ from: siteConfig.forms.fromAddress, to: staff.to, replyTo: d.email, subject: staff.subject, html: staff.html, text: staff.text, attachments: staff.attachments });
    if (error) throw new Error(error.message);
  } catch (e) {
    console.error("[inquiry] send failed", ref, e);
    if (!stored) return failed(502);
  }
  let copied = false;
  if (sendCopy) {
    try {
      const { error } = await resend.emails.send({ from: siteConfig.forms.fromAddress, to: d.email, replyTo: siteConfig.contact.email, subject: copy.subject, html: copy.html, text: copy.text, attachments: copy.attachments });
      if (error) throw new Error(error.message);
      copied = true;
    } catch (e) {
      console.error("[inquiry] submitter copy failed", ref, e); // TAB already has the submission; don't fail the request
    }
  }
  return delivered({ copy: copied });
}
