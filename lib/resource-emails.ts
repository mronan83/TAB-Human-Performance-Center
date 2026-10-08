import { siteConfig, siteUrl } from "@/config/site";
import { resourceEmail as e } from "@/content/emails";
import { firstName, renderEmail } from "@/lib/email-template";
import { flagLabels, type SpamFlag } from "@/lib/spam";
import { LINK_DAYS } from "@/lib/resources";

/**
 * The two emails a resource request sends (C35): the download link to the person who asked, and TAB's note of who
 * asked. Pure, so e2e/emails.spec.ts can check guardrail 5 with sample data: TAB's subject carries no personal details
 * (D-054), and the person's email names only the guide. Nothing is stored (proposed D-058: only once guardrail 4's
 * conditions are met).
 */
export function buildResourceEmails(d: { name: string; email: string; marketingOptIn?: boolean }, guide: { title: string }, downloadPath: string, ref: string, flags: SpamFlag[], base = siteUrl) {
  const link = `${base}${downloadPath}`;
  const first = firstName(d.name);
  const rows: [string, string][] = [["Name", d.name], ["Email", d.email], ["Guide", guide.title], ["News and events by email", d.marketingOptIn ? "Yes" : "No"]];
  const flagNote = flags.length ? `${e.staff.notSent} (${flags.map((f) => flagLabels[f]).join("; ")})` : "";

  const staff = renderEmail({
    preheader: `Resource request · reference ${ref}`,
    eyebrow: `${e.staff.eyebrow} · ${ref}`,
    heading: d.name,
    notice: flagNote ? [{ tone: "warning", text: flagNote }] : [],
    details: { title: e.staff.detailsTitle, rows },
    cta: flagNote ? { label: e.cta, href: link } : { label: `Reply to ${first}`, href: `mailto:${d.email}` },
  });
  const staffText = [rows.map(([k, v]) => `${k}: ${v}`).join("\n"), flagNote && `${flagNote}\n${link}`].filter(Boolean).join("\n\n");

  const body = e.body(guide.title, LINK_DAYS);
  const copy = renderEmail({ preheader: e.preheader, eyebrow: e.eyebrow, heading: e.heading(first), paragraphs: [...body], cta: { label: e.cta, href: link }, footnote: e.footnote });
  const copyText = [e.heading(first), ...body, link, e.footnote].join("\n\n");

  return {
    staff: { to: siteConfig.forms.contactRecipient, subject: `${flags.length ? "[Check] " : ""}Resource request: new (${ref})`, html: staff.html, text: staffText, attachments: staff.attachments },
    copy: { subject: e.subject(guide.title), html: copy.html, text: copyText, attachments: copy.attachments },
  };
}
