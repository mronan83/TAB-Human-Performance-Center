/**
 * Transactional email copy for My TAB. Health details never go by email and subjects carry no personal details
 * (CLAUDE.md guardrail 5, D-054, R-027): each email points the client to My TAB for anything personal.
 */
export const stageUpdatedEmail = {
  /** Owner-approved wording, 2026-09-29. */
  subject: "Your My TAB Stage Has Been Updated",
  greeting: (name: string) => `Hi ${name},`,
  body: "Your TAB practitioner has updated your stage in My TAB. Sign in to My TAB to see the details and what comes next.",
  cta: "Sign in to My TAB",
  footer: "You're receiving this because you're a TAB Human Performance Center client. Please don't reply with health details; we'll talk privately.",
} as const;
