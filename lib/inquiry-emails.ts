import {
  availabilityOptions, considerationOptions, contactOptions, deliveryOptions, foundViaOptions, helpOptions, journeyOptions,
  labelFor, labelsFor, outcomeOptions, routingOptions, serviceOptions, topicOptions, type Inquiry,
} from "@/lib/inquiry";
import { flagLabels, type SpamFlag } from "@/lib/spam";
import { siteConfig, siteUrl } from "@/config/site";
import { staffInquiryEmail, submitterCopyEmail } from "@/content/emails";
import { firstName, renderEmail } from "@/lib/email-template";

export type InquiryAnswers = Omit<Inquiry, "website" | "elapsedMs" | "turnstileToken">;

const dash = (v?: string) => v || "—";

/**
 * The two emails a Start or contact submission sends: TAB's copy and the submitter's copy. Pure, so e2e/emails.spec.ts
 * can prove guardrail 5 with sample data (TG-3): subjects carry no personal details (D-054, R-027), the submitter's copy
 * never repeats a typed message (RSK-011), and a Start submission asks for exactly one next step (GS-004).
 */
export function buildInquiryEmails(d: InquiryAnswers, ref: string, flags: SpamFlag[], stored: boolean) {
  const isStart = d.kind === "start";
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

  // 2. The submitter's copy (owner ruling 2026-09-28): their details and choices, a neutral subject; replies go to
  //    TAB. It never repeats a typed message, so the form can't relay someone's text to another address.
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

  return {
    staff: { to: isStart ? siteConfig.forms.startRecipient : siteConfig.forms.contactRecipient, subject, html: staff.html, text, attachments: staff.attachments },
    copy: { subject: `We’ve received your message – ${siteConfig.brand.name}`, html: copy.html, text: copyText, attachments: copy.attachments },
  };
}
