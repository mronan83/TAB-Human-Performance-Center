import { Resend } from "resend";
import { siteConfig, siteUrl } from "@/config/site";
import { stageUpdatedEmail } from "@/content/emails";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const FONT = "font-family:Arial,sans-serif";

export type EmailResult = "sent" | "skipped" | "failed";

/**
 * Tells a client their TAB Method stage changed (design §5.2). The email names no stage and carries no review text:
 * the details stay in My TAB. Demo mode and deployments without Resend log instead of sending.
 */
export async function sendStageUpdatedEmail(to: string | undefined, name: string, opts: { demo: boolean }): Promise<EmailResult> {
  const link = `${siteUrl}/my-tab`;
  const e = stageUpdatedEmail;
  const text = [e.greeting(name), e.body, `${e.cta}: ${link}`, e.footer].join("\n\n");
  const key = process.env.RESEND_API_KEY;
  if (!to || opts.demo || !key) {
    console.info("[email] stage updated: not sent", opts.demo ? "(demo mode)" : !to ? "(no email on file)" : "(RESEND_API_KEY not set)");
    return "skipped";
  }
  const html = `<p style="${FONT};font-size:15px">${esc(e.greeting(name))}</p><p style="${FONT};font-size:15px">${esc(e.body)}</p>`
    + `<p><a href="${esc(link)}" style="${FONT};font-size:15px;color:#5A6046;font-weight:bold">${esc(e.cta)}</a></p>`
    + `<p style="${FONT};font-size:13px;color:#575B53">${esc(e.footer)}</p>`;
  try {
    const { error } = await new Resend(key).emails.send({ from: siteConfig.forms.fromAddress, to, subject: e.subject, html, text });
    if (error) throw new Error(error.message);
    return "sent";
  } catch (err) {
    console.error("[email] stage updated: send failed", err);
    return "failed";
  }
}
