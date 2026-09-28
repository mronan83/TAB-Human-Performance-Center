import { NextResponse } from "next/server";
import { Resend } from "resend";
import { contactOptions, deliveryOptions, foundViaOptions, helpOptions, inquirySchema, labelFor, serviceOptions } from "@/lib/inquiry";
import { siteConfig } from "@/config/site";

// Best-effort in-memory rate limit (per server instance only). A shared limiter or bot check (Turnstile /
// BotID / Vercel WAF) is a launch requirement; see docs/requirements-register.md SEC-013.
const WINDOW_MS = 10 * 60_000;
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  if (hits.size > 5_000) {
    for (const [key, times] of hits) if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
  }
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const dash = (v?: string) => v || "—";
const FONT = "font-family:Arial,sans-serif";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (limited(ip)) return NextResponse.json({ ok: false, error: "Too many submissions. Please try again later." }, { status: 429 });

  const parsed = inquirySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: parsed.error.flatten().fieldErrors }, { status: 422 });
  }
  const d = { ...parsed.data, name: parsed.data.name.replace(/[\r\n]+/g, " ").trim() };
  if (d.company) return NextResponse.json({ ok: true }); // bot: pretend success
  const isStart = d.kind === "start";

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
  rows.push(["Marketing opt-in", d.marketingOptIn ? "Yes" : "No"]);

  // Free-text answers, in the order the S14 §14.4.1 form asks them; unanswered optional questions are left out.
  const answers = (
    isStart
      ? [
          ["What brings you to TAB?", d.message],
          ["If things improved, what would they like to feel, do, or experience differently?", d.improved],
          ["Anything to know before finding the right starting point?", d.considerations],
        ]
      : [["Message", d.message]]
  ).filter((a): a is [string, string] => !!a[1]);

  // Subjects carry no personal details (D-054, R-027); the reference only helps thread replies.
  const ref = Date.now().toString(36).toUpperCase();
  const subject = isStart ? `Start Where You Are: new submission (${ref})` : `Website message: new submission (${ref})`;
  // GS-004: every Start submission ends with exactly one next step, chosen by whoever replies.
  const routing = isStart
    ? "Next step (choose one): direct booking, a brief discovery conversation, a service-specific intake, more information needed, or an outside referral."
    : "";
  const html = `<h2 style="font-family:Georgia,serif">${esc(subject)}</h2><table cellpadding="6" style="${FONT};font-size:14px">${rows
    .map(([k, v]) => `<tr><td style="color:#575B53;vertical-align:top">${esc(k)}</td><td>${esc(v)}</td></tr>`)
    .join("")}</table>${answers
    .map(([q, a]) => `<h3 style="${FONT};font-size:15px">${esc(q)}</h3><p style="${FONT};white-space:pre-wrap">${esc(a)}</p>`)
    .join("")}${routing && `<p style="${FONT};font-size:13px;color:#575B53">${esc(routing)}</p>`}`;
  const text = [rows.map(([k, v]) => `${k}: ${v}`).join("\n"), ...answers.map(([q, a]) => `${q}\n${a}`), routing].filter(Boolean).join("\n\n");
  const to = isStart ? siteConfig.forms.startRecipient : siteConfig.forms.contactRecipient;

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[inquiry] RESEND_API_KEY not set; would send to", to, `\n${subject}\n\n${text}`);
      return NextResponse.json({ ok: true, dev: true });
    }
    return NextResponse.json({ ok: false, error: `We couldn’t send your message. Please email ${siteConfig.contact.email}.` }, { status: 503 });
  }

  try {
    const resend = new Resend(key);
    const { error } = await resend.emails.send({ from: siteConfig.forms.fromAddress, to, replyTo: d.email, subject, html, text });
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[inquiry] send failed", e);
    return NextResponse.json({ ok: false, error: `We couldn’t send your message. Please email ${siteConfig.contact.email}.` }, { status: 502 });
  }
}
