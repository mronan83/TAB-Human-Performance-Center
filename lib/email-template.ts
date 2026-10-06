import { siteConfig, siteUrl } from "@/config/site";
import { EMAIL_LOGO } from "@/lib/email-logo";

/**
 * The branded layout every email shares (owner request 2026-10-06: "We have all the branding to make those emails
 * beautiful"). Email clients ignore stylesheets and SVG, so this is table layout with inline styles, the palette from
 * app/globals.css as literal values (D-062: Bone page, white card, Graphite text, Deep Olive button, Clay Dark labels),
 * Montserrat with system fallbacks and Spectral for the headline, as on the site. The logo is embedded (CID), so it
 * shows even while the site is behind Vercel login. Everything passed in is escaped here; callers pass plain text.
 * Guardrail 5 still applies to what callers put in: no health details, and subjects stay generic.
 */

const C = {
  bone: "#FBF6F1",
  linen: "#E8E3D9",
  white: "#FFFFFF",
  graphite: "#2E2E2E",
  secondary: "#5A5953",
  olive: "#4A5A44",
  clayDark: "#A75436",
  border: "#D8D2C6",
  warningSoft: "#F4E9DC",
  noteSoft: "#F2F4F1",
} as const;
const SANS = "Montserrat,'Helvetica Neue',Helvetica,Arial,sans-serif";
const SERIF = "Spectral,Georgia,'Times New Roman',serif";
export const EMAIL_LOGO_CID = "tab-logo";

export const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export type EmailContent = {
  /** Inbox preview text, hidden in the body. */
  preheader: string;
  /** Small uppercase label above the headline. */
  eyebrow?: string;
  heading: string;
  paragraphs?: string[];
  /** A tinted callout, e.g. something staff must act on first. */
  notice?: { tone: "warning" | "note"; text: string }[];
  /** Label/value rows, shown as a quiet table. */
  details?: { title?: string; rows: [string, string][] };
  /** A block of free text (the contact message, TAB's copy only), shown with its line breaks. */
  quote?: { title: string; text: string };
  cta?: { label: string; href: string };
  /** Small print under the card. */
  footnote?: string;
};

const p = (text: string, style = "") =>
  `<p style="margin:0 0 16px;font-family:${SANS};font-size:16px;line-height:1.6;color:${C.graphite};${style}">${esc(text)}</p>`;

function details(d: NonNullable<EmailContent["details"]>) {
  const rows = d.rows
    .map(
      ([k, v], i) =>
        `<tr><td style="padding:10px 12px 10px 0;${i ? `border-top:1px solid ${C.linen};` : ""}font-family:${SANS};font-size:13px;line-height:1.5;color:${C.secondary};vertical-align:top;width:38%">${esc(k)}</td>` +
        `<td style="padding:10px 0;${i ? `border-top:1px solid ${C.linen};` : ""}font-family:${SANS};font-size:14px;line-height:1.5;color:${C.graphite};vertical-align:top">${esc(v)}</td></tr>`,
    )
    .join("");
  const title = d.title
    ? `<p style="margin:8px 0 6px;font-family:${SANS};font-size:12px;font-weight:600;letter-spacing:1.4px;text-transform:uppercase;color:${C.clayDark}">${esc(d.title)}</p>`
    : "";
  return `${title}<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 20px">${rows}</table>`;
}

function button(cta: NonNullable<EmailContent["cta"]>) {
  // A "bulletproof" button: a padded table cell, so it renders as a button in Outlook too.
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 4px"><tr><td style="background:${C.olive};border-radius:999px">` +
    `<a href="${esc(cta.href)}" style="display:inline-block;padding:14px 28px;font-family:${SANS};font-size:15px;font-weight:600;color:${C.white};text-decoration:none;border-radius:999px">${esc(cta.label)}</a>` +
    `</td></tr></table>`;
}

/** Renders the branded HTML and the inline logo attachment for Resend. */
export function renderEmail(c: EmailContent) {
  const notices = (c.notice ?? [])
    .map(
      (n) =>
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px"><tr><td style="background:${n.tone === "warning" ? C.warningSoft : C.noteSoft};border-radius:12px;padding:14px 16px;font-family:${SANS};font-size:14px;line-height:1.5;color:${C.graphite}">${esc(n.text)}</td></tr></table>`,
    )
    .join("");
  const quote = c.quote
    ? `<p style="margin:8px 0 6px;font-family:${SANS};font-size:12px;font-weight:600;letter-spacing:1.4px;text-transform:uppercase;color:${C.clayDark}">${esc(c.quote.title)}</p>` +
      `<div style="margin:0 0 20px;padding:14px 16px;border-left:3px solid ${C.olive};background:${C.noteSoft};font-family:${SANS};font-size:15px;line-height:1.6;color:${C.graphite};white-space:pre-wrap">${esc(c.quote.text)}</div>`
    : "";
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light">
<title>${esc(c.heading)}</title>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=Spectral:wght@500&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:${C.bone}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(c.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.bone}"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px">
<tr><td style="padding:0 4px 24px"><a href="${esc(siteUrl)}"><img src="cid:${EMAIL_LOGO_CID}" width="${EMAIL_LOGO.width}" height="${EMAIL_LOGO.height}" alt="${esc(siteConfig.brand.name)}" style="display:block;border:0"></a></td></tr>
<tr><td style="background:${C.white};border:1px solid ${C.border};border-radius:20px;padding:36px 32px">
${c.eyebrow ? `<p style="margin:0 0 10px;font-family:${SANS};font-size:12px;font-weight:600;letter-spacing:1.4px;text-transform:uppercase;color:${C.clayDark}">${esc(c.eyebrow)}</p>` : ""}
<h1 style="margin:0 0 20px;font-family:${SERIF};font-size:30px;line-height:1.2;font-weight:500;color:${C.graphite}">${esc(c.heading)}</h1>
${notices}${(c.paragraphs ?? []).map((t) => p(t)).join("")}${c.details ? details(c.details) : ""}${quote}${c.cta ? button(c.cta) : ""}
</td></tr>
<tr><td style="padding:24px 8px 0;font-family:${SANS};font-size:12px;line-height:1.6;color:${C.secondary}">
${c.footnote ? `<p style="margin:0 0 12px">${esc(c.footnote)}</p>` : ""}
<p style="margin:0 0 4px;font-weight:600;letter-spacing:1.4px;text-transform:uppercase;color:${C.olive}">${esc(siteConfig.brand.philosophy)}</p>
<p style="margin:0">${esc(siteConfig.brand.name)} · ${esc(siteConfig.location.label)} · <a href="${esc(siteUrl)}" style="color:${C.olive}">${esc(siteUrl.replace(/^https?:\/\//, ""))}</a></p>
</td></tr>
</table></td></tr></table>
</body></html>`;
  return { html, attachments: [{ filename: "tab-human-performance-center.png", content: EMAIL_LOGO.base64, contentType: "image/png", contentId: EMAIL_LOGO_CID }] };
}

/** First word of a name, for a friendlier greeting. */
export const firstName = (name: string) => name.trim().split(/\s+/)[0] || name;
