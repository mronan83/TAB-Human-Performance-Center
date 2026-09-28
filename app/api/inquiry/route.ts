import { NextResponse } from "next/server";
import { Resend } from "resend";
import { contactOptions, deliveryOptions, foundViaOptions, helpOptions, inquirySchema, labelFor, routingOptions, serviceOptions } from "@/lib/inquiry";
import { storeInquiry } from "@/lib/inquiry-store";
import { siteConfig } from "@/config/site";

// Best-effort in-memory limits (per server instance only). A shared limiter and bot check (Turnstile / BotID /
// Vercel WAF) is a launch requirement, and more so now that the site emails a copy to whatever address is
// entered; see docs/requirements-register.md SEC-013.
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
  // still carries everything, so the submission isn't lost.
  let stored = false;
  if (siteConfig.forms.storeSubmissions) {
    try {
      await storeInquiry(d, ref);
      stored = true;
    } catch (e) {
      console.error("[inquiry] store failed", ref, e);
    }
  }

  const rows: [string, string][] = [
    ["Name", d.name],
    ["Email", d.email],
    ["Phone", dash(d.phone)],
    ["Preferred contact", dash(labelFor(contactOptions, d.contactPreference))],
  ];
  if (isStart) {
    rows.push(
      ["Would like help with", (d.help ?? []).map((v) => labelFor(helpOptions, v)).join("; ") || "—"],
      ["Service interest", dash(labelFor(serviceOptions, d.service))],
      ["In person or virtual", dash(labelFor(deliveryOptions, d.delivery))],
      ["Availability", dash(d.availability)],
      ["How they found TAB", dash(labelFor(foundViaOptions, d.foundVia))],
    );
  }
  rows.push(["News and events by email", d.marketingOptIn ? "Yes" : "No"]);

  // Free-text answers, in the order the S14 §14.4.1 form asks them; unanswered optional questions are left out.
  const answers = (
    isStart
      ? [
          ["What brings you to TAB?", d.message],
          ["If things improved, what would you like to feel, do, or experience differently?", d.improved],
          ["Anything we should know before finding the right starting point?", d.considerations],
        ]
      : [["Message", d.message]]
  ).filter((a): a is [string, string] => !!a[1]);

  const table = `<table cellpadding="6" style="${FONT};font-size:14px">${rows
    .map(([k, v]) => `<tr><td style="color:#575B53;vertical-align:top">${esc(k)}</td><td>${esc(v)}</td></tr>`)
    .join("")}</table>${answers
    .map(([q, a]) => `<h3 style="${FONT};font-size:15px">${esc(q)}</h3><p style="${FONT};white-space:pre-wrap">${esc(a)}</p>`)
    .join("")}`;
  const plain = [rows.map(([k, v]) => `${k}: ${v}`).join("\n"), ...answers.map(([q, a]) => `${q}\n${a}`)].join("\n\n");

  // 1. TAB's copy. GS-004: every Start submission ends with exactly one next step, chosen by whoever replies.
  const subject = isStart ? `Start Where You Are: new submission (${ref})` : `Website message: new submission (${ref})`;
  const routing = isStart ? `Next step (choose one): ${routingOptions.map((o) => o.label).join(" · ")}.` : "";
  const savedNote = stored ? `Saved in TAB Practice → Submissions (reference ${ref}).` : "";
  const staffNotes = [routing, savedNote].filter(Boolean);
  const html = `<h2 style="font-family:Georgia,serif">${esc(subject)}</h2>${table}${staffNotes
    .map((n) => `<p style="${FONT};font-size:13px;color:#575B53">${esc(n)}</p>`)
    .join("")}`;
  const text = [plain, ...staffNotes].join("\n\n");
  const to = isStart ? siteConfig.forms.startRecipient : siteConfig.forms.contactRecipient;

  // 2. The submitter's copy (owner ruling 2026-09-28). Same content; a neutral subject; replies go to TAB.
  const sendCopy = siteConfig.forms.sendSubmitterCopy && !copyLimited(d.email.toLowerCase());
  const copySubject = `We’ve received your message – ${siteConfig.brand.name}`;
  const intro = `Hi ${d.name}, thank you for reaching out to ${siteConfig.brand.name}. Here’s a copy of what you sent. ${
    isStart ? "We’ll read it and reply with a suggested starting point." : "We’ll get back to you soon."
  }`;
  const outro = `If you didn’t send this, you can ignore this email. To add anything, just reply.`;
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
