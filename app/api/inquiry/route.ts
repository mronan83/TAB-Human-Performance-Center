import { NextResponse } from "next/server";
import { Resend } from "resend";
import {
  availabilityOptions, considerationOptions, contactOptions, deliveryOptions, foundViaOptions, helpOptions, inquirySchema, journeyOptions,
  labelFor, labelsFor, outcomeOptions, routingOptions, serviceOptions, topicOptions,
} from "@/lib/inquiry";
import { storeInquiry } from "@/lib/inquiry-store";
import { siteConfig } from "@/config/site";

// Best-effort in-memory limits (per server instance only). A shared limiter and bot check (Turnstile / BotID /
// Vercel WAF) is a launch requirement, since the site emails a copy to whatever address is entered;
// see docs/requirements-register.md SEC-013.
const WINDOW_MS = 10 * 60_000;
const DAY_MS = 24 * 60 * 60_000;
function limiter(max: number, windowMs: number) {
  const hits = new Map<string, number[]>();
  return (key: string) => {
    const now = Date.now();
    if (hits.size > 5_000) {
      for (const [k, times] of hits) if (times.every((t) => now - t >= windowMs)) hits.delete(k);
    }
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    recent.push(now);
    hits.set(key, recent);
    return recent.length > max;
  };
}
const ipLimited = limiter(5, WINDOW_MS);
/** At most three copies a day to any one address, so the form can't be used to flood someone's inbox. */
const copyLimited = limiter(3, DAY_MS);

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const dash = (v?: string) => v || "—";
const FONT = "font-family:Arial,sans-serif";
const failed = (status: number) =>
  NextResponse.json({ ok: false, error: `We couldn’t send your message. Please email ${siteConfig.contact.email}.` }, { status });

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (ipLimited(ip)) return NextResponse.json({ ok: false, error: "Too many submissions. Please try again later." }, { status: 429 });

  const parsed = inquirySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: parsed.error.flatten().fieldErrors }, { status: 422 });
  }
  const d = { ...parsed.data, name: parsed.data.name.replace(/[\r\n]+/g, " ").trim() };
  if (d.company) return NextResponse.json({ ok: true }); // bot: pretend success
  const isStart = d.kind === "start";
  // Subjects carry no personal details (D-054, R-027); the reference ties the emails to the stored record.
  const ref = `${Date.now().toString(36)}${crypto.randomUUID().slice(0, 4)}`.toUpperCase();

  // DIV-05: the whole form is saved (once the D-042 gate is open), then emailed. If saving fails the email
  // still carries every answer, so the submission isn't lost.
  let stored = false;
  if (siteConfig.forms.storeSubmissions) {
    try {
      await storeInquiry(d, ref);
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

  const table = `<table cellpadding="6" style="${FONT};font-size:14px">${rows
    .map(([k, v]) => `<tr><td style="color:#575B53;vertical-align:top">${esc(k)}</td><td>${esc(v)}</td></tr>`)
    .join("")}</table>`;
  const plain = rows.map(([k, v]) => `${k}: ${v}`).join("\n");
  // The contact message goes to TAB only; the submitter's copy never repeats it (RSK-011).
  const message = !isStart && d.message ? d.message : "";
  const messageHtml = message ? `<h3 style="${FONT};font-size:15px">Message</h3><p style="${FONT};white-space:pre-wrap">${esc(message)}</p>` : "";

  // 1. TAB's copy. GS-004: every Start submission ends with exactly one next step, chosen by whoever replies.
  const subject = isStart ? `Start Where You Are: new submission (${ref})` : `Website message: new submission (${ref})`;
  const healthFlag = d.considerations?.includes("health-private")
    ? "They’d like to discuss something health-related privately: follow up before anything is booked."
    : "";
  const routing = isStart ? `Next step (choose one): ${routingOptions.map((o) => o.label).join(" · ")}.` : "";
  const savedNote = stored ? `Saved in TAB Practice → Submissions (reference ${ref}).` : "";
  const staffNotes = [healthFlag, routing, savedNote].filter(Boolean);
  const html = `<h2 style="font-family:Georgia,serif">${esc(subject)}</h2>${table}${messageHtml}${staffNotes
    .map((n) => `<p style="${FONT};font-size:13px;color:#575B53">${esc(n)}</p>`)
    .join("")}`;
  const text = [plain, message && `Message:\n${message}`, ...staffNotes].filter(Boolean).join("\n\n");
  const to = isStart ? siteConfig.forms.startRecipient : siteConfig.forms.contactRecipient;

  // 2. The submitter's copy (owner ruling 2026-09-28): their details and choices, a neutral subject; replies go to
  //    TAB. It never repeats a typed message, so the form can't relay someone's text to another address.
  const sendCopy = siteConfig.forms.sendSubmitterCopy && !copyLimited(d.email.toLowerCase());
  const copySubject = `We’ve received your message – ${siteConfig.brand.name}`;
  const intro = `Hi ${d.name}, thank you for reaching out to ${siteConfig.brand.name}. ${
    isStart
      ? "Here’s a copy of what you sent. We’ll reply with a suggested starting point."
      : "We’ve received your message and will get back to you soon. For your privacy, we don’t repeat your message in this email."
  }`;
  const outro = "If you didn’t send this, you can ignore this email. We’ll ask about anything health-related privately, so please don’t reply with medical details.";
  const copyHtml = `<p style="${FONT};font-size:15px">${esc(intro)}</p>${table}<p style="${FONT};font-size:13px;color:#575B53">${esc(outro)}</p>`;
  const copyText = [intro, plain, outro].join("\n\n");

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[inquiry] RESEND_API_KEY not set; would send to", to, `\n${subject}\n\n${text}`);
      if (sendCopy) console.info("[inquiry] and a copy to the submitter:", `\n${copySubject}\n\n${copyText}`);
      return NextResponse.json({ ok: true, dev: true, copy: sendCopy });
    }
    return stored ? NextResponse.json({ ok: true, copy: false }) : failed(503);
  }

  const resend = new Resend(key);
  try {
    const { error } = await resend.emails.send({ from: siteConfig.forms.fromAddress, to, replyTo: d.email, subject, html, text });
    if (error) throw new Error(error.message);
  } catch (e) {
    console.error("[inquiry] send failed", ref, e);
    if (!stored) return failed(502);
  }
  let copied = false;
  if (sendCopy) {
    try {
      const { error } = await resend.emails.send({ from: siteConfig.forms.fromAddress, to: d.email, replyTo: siteConfig.contact.email, subject: copySubject, html: copyHtml, text: copyText });
      if (error) throw new Error(error.message);
      copied = true;
    } catch (e) {
      console.error("[inquiry] submitter copy failed", ref, e); // TAB already has the submission; don't fail the request
    }
  }
  return NextResponse.json({ ok: true, copy: copied });
}
