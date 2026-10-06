import { NextResponse } from "next/server";
import { Resend } from "resend";
import {
  availabilityOptions, considerationOptions, contactOptions, deliveryOptions, foundViaOptions, helpOptions, inquirySchema, journeyOptions,
  labelFor, labelsFor, outcomeOptions, routingOptions, serviceOptions, topicOptions,
} from "@/lib/inquiry";
import { storeInquiry } from "@/lib/inquiry-store";
import { MAX_BODY_BYTES, MIN_FILL_MS, duplicateGuard, flagLabels, limiter, sameOrigin, screenText, verifyHuman, type SpamFlag } from "@/lib/spam";
import { siteConfig, siteUrl } from "@/config/site";
import { staffInquiryEmail, submitterCopyEmail } from "@/content/emails";
import { firstName, renderEmail } from "@/lib/email-template";

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

const dash = (v?: string) => v || "—";
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
  }

  // Start answers are all predefined options (proposed D-059); the contact form adds one message box.
  const list = (opts: Parameters<typeof labelsFor>[0], v?: readonly string[]) => labelsFor(opts, v).join("; ") || "—";
  const rows: [string, string][] = [
    ["Name", d.name],
    ["Email", d.email],
    ["Phone", dash(d.phone)],
    ["Preferred contact", dash(labelFor(contactOptions, d.contactPreference))],
  ];
  if (isStart) {
    rows.push(
      ["Starting from", dash(labelFor(journeyOptions, d.journey))],
      ["Would like help with", list(helpOptions, d.help)],
      ["Service interest", dash(labelFor(serviceOptions, d.service))],
      ["If things improved", list(outcomeOptions, d.outcomes)],
      ["Before we start", list(considerationOptions, d.considerations)],
      ["In person or virtual", dash(labelFor(deliveryOptions, d.delivery))],
      ["Days or times", list(availabilityOptions, d.availability)],
      ["How they found TAB", dash(labelFor(foundViaOptions, d.foundVia))],
    );
  } else {
    rows.push(["Topic", dash(labelFor(topicOptions, d.topic))]);
  }
  rows.push(["News and events by email", d.marketingOptIn ? "Yes" : "No"]);

  const plain = rows.map(([k, v]) => `${k}: ${v}`).join("\n");
  // The contact message goes to TAB only; the submitter's copy never repeats it (RSK-011).
  const message = !isStart && d.message ? d.message : "";

  // 1. TAB's copy. GS-004: every Start submission ends with exactly one next step, chosen by whoever replies.
  const subject = `${flags.length ? "[Check] " : ""}${isStart ? "Start Where You Are" : "Website message"}: new submission (${ref})`;
  const flagNote = flags.length ? `Possible spam: ${flags.map((f) => flagLabels[f]).join("; ")}. No copy was sent to the submitter.` : "";
  const healthFlag = d.considerations?.includes("health-private")
    ? "They’d like to discuss something health-related privately: follow up before anything is booked."
    : "";
  const routing = isStart ? `Next step (choose one): ${routingOptions.map((o) => o.label).join(" · ")}.` : "";
  const savedNote = stored ? `Saved in TAB Practice → Submissions (reference ${ref}).` : "";
  const staffNotes = [flagNote, healthFlag, routing, savedNote].filter(Boolean);
  const s = staffInquiryEmail;
  const staff = renderEmail({
    preheader: `${isStart ? "Start Where You Are" : "Website message"} · reference ${ref}`,
    eyebrow: `${isStart ? s.eyebrowStart : s.eyebrowContact} · ${ref}`,
    heading: d.name,
    notice: [
      ...(flagNote ? [{ tone: "warning" as const, text: flagNote }] : []),
      ...(healthFlag ? [{ tone: "warning" as const, text: healthFlag }] : []),
      ...(routing ? [{ tone: "note" as const, text: routing }] : []),
    ],
    details: { title: s.detailsTitle, rows },
    quote: message ? { title: s.messageTitle, text: message } : undefined,
    cta: { label: s.reply(firstName(d.name)), href: `mailto:${d.email}` },
    footnote: savedNote || undefined,
  });
  const text = [plain, message && `Message:\n${message}`, ...staffNotes].filter(Boolean).join("\n\n");
  const to = isStart ? siteConfig.forms.startRecipient : siteConfig.forms.contactRecipient;

  // 2. The submitter's copy (owner ruling 2026-09-28): their details and choices, a neutral subject; replies go to
  //    TAB. It never repeats a typed message, so the form can't relay someone's text to another address.
  // Flagged submissions never trigger a copy: a flagged form is the likeliest to carry someone else's address.
  const sendCopy = siteConfig.forms.sendSubmitterCopy && flags.length === 0 && !copyLimited(d.email.toLowerCase());
  const copySubject = `We’ve received your message – ${siteConfig.brand.name}`;
  const cc = isStart ? submitterCopyEmail.start : submitterCopyEmail.contact;
  const first = firstName(d.name);
  const copy = renderEmail({
    preheader: cc.preheader,
    eyebrow: cc.eyebrow,
    heading: cc.heading(first),
    paragraphs: [...cc.body],
    details: { title: cc.detailsTitle, rows },
    cta: { label: cc.cta, href: `${siteUrl}${cc.ctaPath}` },
    footnote: submitterCopyEmail.footnote,
  });
  const copyText = [cc.heading(first), ...cc.body, plain, submitterCopyEmail.footnote].join("\n\n");

  /** Delivered (stored or emailed to TAB): only now does a repeat count as a duplicate. */
  const delivered = (body: object) => {
    duplicates.remember(d);
    return json({ ok: true, ...body });
  };

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[inquiry] RESEND_API_KEY not set; would send to", to, `\n${subject}\n\n${text}`);
      if (sendCopy) console.info("[inquiry] and a copy to the submitter:", `\n${copySubject}\n\n${copyText}`);
      return delivered({ dev: true, copy: sendCopy });
    }
    return stored ? delivered({ copy: false }) : failed(503);
  }

  const resend = new Resend(key);
  try {
    const { error } = await resend.emails.send({ from: siteConfig.forms.fromAddress, to, replyTo: d.email, subject, html: staff.html, text, attachments: staff.attachments });
    if (error) throw new Error(error.message);
  } catch (e) {
    console.error("[inquiry] send failed", ref, e);
    if (!stored) return failed(502);
  }
  let copied = false;
  if (sendCopy) {
    try {
      const { error } = await resend.emails.send({ from: siteConfig.forms.fromAddress, to: d.email, replyTo: siteConfig.contact.email, subject: copySubject, html: copy.html, text: copyText, attachments: copy.attachments });
      if (error) throw new Error(error.message);
      copied = true;
    } catch (e) {
      console.error("[inquiry] submitter copy failed", ref, e); // TAB already has the submission; don't fail the request
    }
  }
  return delivered({ copy: copied });
}
