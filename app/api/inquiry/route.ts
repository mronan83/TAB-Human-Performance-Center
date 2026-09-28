import { NextResponse } from "next/server";
import { Resend } from "resend";
import { inquirySchema, interestOptions } from "@/lib/inquiry";
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

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (limited(ip)) return NextResponse.json({ ok: false, error: "Too many submissions. Please try again later." }, { status: 429 });

  const parsed = inquirySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: parsed.error.flatten().fieldErrors }, { status: 422 });
  }
  const d = { ...parsed.data, name: parsed.data.name.replace(/[\r\n]+/g, " ").trim() };
  if (d.company) return NextResponse.json({ ok: true }); // bot: pretend success

  const interests = (d.interests ?? []).map((v) => interestOptions.find((o) => o.value === v)?.label ?? v);
  const rows: [string, string][] = [
    ["Name", d.name],
    ["Email", d.email],
    ["Phone", d.phone || "—"],
    ["Preferred contact", d.contactPreference ?? "—"],
    ["Interested in", interests.join("; ") || "—"],
    ["In person or virtual", d.delivery ?? "—"],
    ["Availability", d.availability || "—"],
    ["How they heard about TAB", d.referral || "—"],
    ["Marketing opt-in", d.marketingOptIn ? "Yes" : "No"],
  ];
  // Subjects carry no personal details (D-054, R-027); the reference only helps thread replies.
  const ref = Date.now().toString(36).toUpperCase();
  const subject = d.kind === "start" ? `Start Where You Are: new submission (${ref})` : `Website message: new submission (${ref})`;
  const html = `<h2 style="font-family:Georgia,serif">${esc(subject)}</h2><table cellpadding="6" style="font-family:Arial,sans-serif;font-size:14px">${rows
    .map(([k, v]) => `<tr><td style="color:#575B53;vertical-align:top">${esc(k)}</td><td>${esc(v)}</td></tr>`)
    .join("")}</table><h3 style="font-family:Arial,sans-serif">Message</h3><p style="font-family:Arial,sans-serif;white-space:pre-wrap">${esc(d.message)}</p>`;
  const to = d.kind === "start" ? siteConfig.forms.startRecipient : siteConfig.forms.contactRecipient;

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[inquiry] RESEND_API_KEY not set; would send to", to, { subject, rows });
      return NextResponse.json({ ok: true, dev: true });
    }
    return NextResponse.json({ ok: false, error: `We couldn’t send your message. Please email ${siteConfig.contact.email}.` }, { status: 503 });
  }

  try {
    const resend = new Resend(key);
    const { error } = await resend.emails.send({ from: siteConfig.forms.fromAddress, to, replyTo: d.email, subject, html });
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[inquiry] send failed", e);
    return NextResponse.json({ ok: false, error: `We couldn’t send your message. Please email ${siteConfig.contact.email}.` }, { status: 502 });
  }
}
