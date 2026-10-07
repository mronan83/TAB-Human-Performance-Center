/**
 * Transactional email copy. Health details never go by email and subjects carry no personal details (CLAUDE.md
 * guardrail 5, D-054, R-027): each email points the client to My TAB or a private conversation for anything personal.
 * The layout is lib/email-template.ts.
 */
export const stageUpdatedEmail = {
  /** Owner-approved wording, 2026-09-29. */
  subject: "Your My TAB Stage Has Been Updated",
  preheader: "Sign in to My TAB to see what's next.",
  eyebrow: "My TAB",
  heading: "Your stage has been updated",
  greeting: (name: string) => `Hi ${name},`,
  body: "Your TAB practitioner has updated your stage in My TAB. Sign in to My TAB to see the details and what comes next.",
  cta: "Sign in to My TAB",
  footer: "You're receiving this because you're a TAB Human Performance Center client. Please don't reply with health details; we'll talk privately.",
} as const;

/** The submitter's copy of a Start or contact submission (owner ruling 2026-09-28). */
export const submitterCopyEmail = {
  start: {
    preheader: "Here's a copy of your answers. We'll reply with a suggested starting point.",
    eyebrow: "Start Where You Are",
    heading: (first: string) => `Thank you, ${first}.`,
    body: [
      "We've received your answers. We'll read them and reply with one suggested next step, such as booking a session or a brief conversation first.",
      "Here's a copy of what you sent, for your records.",
    ],
    detailsTitle: "Your answers",
    cta: "Explore the TAB Method",
    ctaPath: "/tab-method",
  },
  contact: {
    preheader: "We've received your message and will get back to you soon.",
    eyebrow: "Message received",
    heading: (first: string) => `Thanks for reaching out, ${first}.`,
    body: [
      "We've received your message and will get back to you soon.",
      "For your privacy, we don't repeat your message in this email.",
    ],
    detailsTitle: "Your details",
    cta: "Visit our website",
    ctaPath: "/",
  },
  footnote: "If you didn't send this, you can ignore this email. We'll ask about anything health-related privately, so please don't reply with medical details.",
} as const;

/** TAB's own notification of a submission (staff only). */
export const staffInquiryEmail = {
  eyebrowStart: "New Start Where You Are submission",
  eyebrowContact: "New website message",
  detailsTitle: "Their answers",
  messageTitle: "Message",
  reply: (first: string) => `Reply to ${first}`,
} as const;

/** An admin's invitation to TAB Practice (proposed D-071). The link is single-use; two-step verification comes next. */
export const adminInviteEmail = {
  subject: "You're invited to TAB Practice",
  preheader: "Set up your TAB Practice account for the website.",
  eyebrow: "TAB Practice",
  heading: "You've been added as a website admin",
  greeting: (name: string) => `Hi ${name},`,
  body: [
    "You've been added to TAB Practice, the staff side of the TAB Human Performance Center website, as a website admin. You'll be able to ask for website changes, follow them through to the live site, and see the website stats.",
    "The button below signs you in once. Next you'll set up an authenticator app for the 6-digit sign-in code, then choose a password under Sign-in & security.",
  ],
  cta: "Set up my account",
  footer: "This link works once and expires after 24 hours. If you weren't expecting it, you can ignore this email.",
} as const;

/** Tells the owner a website request came in (proposed D-071). It names the number and lane only, never what was asked. */
export const websiteRequestAlertEmail = {
  subject: (n: number) => `New website request #${n}`,
  preheader: "A website change request is waiting in TAB Practice.",
  eyebrow: "TAB Practice",
  heading: (n: number) => `Website request #${n}`,
  body: (who: string, lane: string) => `${who} asked for a ${lane.toLowerCase()} change. The details are in TAB Practice.`,
  cta: "Open the request",
  footer: "Sent because you're the owner. Requests never carry client details.",
} as const;
