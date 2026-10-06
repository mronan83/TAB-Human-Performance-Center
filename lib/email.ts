import { Resend } from "resend";
import { siteConfig, siteUrl } from "@/config/site";
import { stageUpdatedEmail } from "@/content/emails";
import { renderEmail } from "@/lib/email-template";

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
  const { html, attachments } = renderEmail({
    preheader: e.preheader, eyebrow: e.eyebrow, heading: e.heading, paragraphs: [e.greeting(name), e.body],
    cta: { label: e.cta, href: link }, footnote: e.footer,
  });
  try {
    const { error } = await new Resend(key).emails.send({ from: siteConfig.forms.fromAddress, to, subject: e.subject, html, text, attachments });
    if (error) throw new Error(error.message);
    return "sent";
  } catch (err) {
    console.error("[email] stage updated: send failed", err);
    return "failed";
  }
}
