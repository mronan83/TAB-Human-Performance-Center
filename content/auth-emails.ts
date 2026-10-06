/**
 * Copy for the emails Supabase Auth sends (sign-in links, invitations, security notices), in the same branded layout
 * as our other emails (owner request 2026-10-06: "update the email templates that are sent out of supabase with our
 * brand"). scripts/supabase-emails.mjs renders them with lib/email-template.ts and pushes them to the project.
 *
 * `{{ .Name }}` values are Supabase's template variables, filled in when each email is sent; they pass through the
 * layout's escaping unchanged. Guardrail 5: subjects carry no personal details and no email carries health details.
 * Sign-in has no passwords (email link, plus an authenticator app for staff), so the password emails stay generic.
 */

import type { EmailContent } from "@/lib/email-template";
import { siteConfig } from "@/config/site";

const { contact } = siteConfig;
const REACH = `${contact.email}${contact.phone ? ` or ${contact.phone}` : ""}`;
const NOT_YOU = `If this wasn't you, contact us right away at ${REACH}.`;
const IGNORE = "If you didn't ask for this, you can ignore this email. Nothing changes without the link.";
const LINK = "{{ .ConfirmationURL }}";
/**
 * Sign-in and invitation links go straight to our callback with a one-time `token_hash` (C5, lib/supabase/email-link.ts),
 * so they work in any browser. `RedirectTo` is the callback the app asked for (My TAB or TAB Practice); Supabase only
 * accepts callbacks on its allow-list.
 */
const SIGN_IN_LINK = "{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email";
const INVITE_LINK = "{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=invite";

/** Supabase's key for each template (mailer_templates_<key>_content and mailer_subjects_<key>). */
export type AuthEmailKey =
  | "magic_link"
  | "invite"
  | "confirmation"
  | "recovery"
  | "email_change"
  | "reauthentication"
  | "email_changed_notification"
  | "phone_changed_notification"
  | "password_changed_notification"
  | "identity_linked_notification"
  | "identity_unlinked_notification"
  | "mfa_factor_enrolled_notification"
  | "mfa_factor_unenrolled_notification";

export type AuthEmail = { subject: string; content: EmailContent };

/** How long sign-in links last (Supabase `mailer_otp_exp`, 3600 seconds). */
const EXPIRY = "1 hour";

export const authEmails: Record<AuthEmailKey, AuthEmail> = {
  magic_link: {
    subject: "Your TAB sign-in link",
    content: {
      preheader: `Your secure sign-in link. It works once and expires in ${EXPIRY}.`,
      eyebrow: "Sign in",
      heading: "Your sign-in link",
      paragraphs: [`Use the button below to sign in to ${siteConfig.brand.name}. The link works once and expires in ${EXPIRY}.`],
      cta: { label: "Sign in", href: SIGN_IN_LINK },
      footnote: `${IGNORE} Questions? ${REACH}.`,
    },
  },
  invite: {
    subject: "You're invited to My TAB",
    content: {
      preheader: "Your private space for your plan, programs and progress between sessions.",
      eyebrow: "My TAB",
      heading: "Welcome to My TAB",
      paragraphs: [
        `Your practitioner has invited you to My TAB, your private space at ${siteConfig.brand.name} for your plan, programs and progress between sessions.`,
        "There's no password to remember: accept the invitation now, and each time after that we'll email you a sign-in link.",
      ],
      cta: { label: "Accept invitation", href: INVITE_LINK },
      footnote: `If the link has expired, ask us for a new one at ${REACH}. Please don't reply with health details; we'll talk privately.`,
    },
  },
  confirmation: {
    subject: "Confirm your email address",
    content: {
      preheader: "One step to confirm your email address.",
      eyebrow: "Confirm",
      heading: "Confirm your email address",
      paragraphs: [`Confirm this address to finish setting up your ${siteConfig.brand.name} account.`],
      cta: { label: "Confirm email address", href: LINK },
      footnote: IGNORE,
    },
  },
  recovery: {
    subject: "Your TAB account access link",
    content: {
      preheader: `A link to get back into your account. It expires in ${EXPIRY}.`,
      eyebrow: "Account access",
      heading: "Get back into your account",
      paragraphs: [`We received a request to restore access to your ${siteConfig.brand.name} account. The link works once and expires in ${EXPIRY}.`],
      cta: { label: "Restore access", href: LINK },
      footnote: `${IGNORE} Questions? ${REACH}.`,
    },
  },
  email_change: {
    subject: "Confirm your new email address",
    content: {
      preheader: "Confirm the new email address for your TAB account.",
      eyebrow: "Account",
      heading: "Confirm your new email address",
      paragraphs: ["Confirm that you'd like to use {{ .NewEmail }} for your TAB account from now on."],
      cta: { label: "Confirm new address", href: LINK },
      footnote: `${IGNORE} Questions? ${REACH}.`,
    },
  },
  reauthentication: {
    subject: "Your TAB verification code",
    content: {
      preheader: "Use this code to confirm it's you.",
      eyebrow: "Verification",
      heading: "Your verification code",
      paragraphs: [`Enter this code to confirm it's you. It expires in ${EXPIRY}.`],
      code: "{{ .Token }}",
      footnote: `Never share this code. ${NOT_YOU}`,
    },
  },
  email_changed_notification: {
    subject: "Your TAB account email was changed",
    content: {
      preheader: "A security notice about your TAB account.",
      eyebrow: "Security notice",
      heading: "Your email address was changed",
      paragraphs: ["The email address on your TAB account was changed from {{ .OldEmail }} to {{ .Email }}.", NOT_YOU],
    },
  },
  phone_changed_notification: {
    subject: "Your TAB account phone number was changed",
    content: {
      preheader: "A security notice about your TAB account.",
      eyebrow: "Security notice",
      heading: "Your phone number was changed",
      paragraphs: ["The phone number on your TAB account was changed.", NOT_YOU],
    },
  },
  password_changed_notification: {
    subject: "Your TAB account password was changed",
    content: {
      preheader: "A security notice about your TAB account.",
      eyebrow: "Security notice",
      heading: "Your password was changed",
      paragraphs: ["The password on your TAB account was changed.", NOT_YOU],
    },
  },
  identity_linked_notification: {
    subject: "A sign-in method was added to your TAB account",
    content: {
      preheader: "A security notice about your TAB account.",
      eyebrow: "Security notice",
      heading: "A sign-in method was added",
      paragraphs: ["A new way to sign in ({{ .Provider }}) was linked to your TAB account.", NOT_YOU],
    },
  },
  identity_unlinked_notification: {
    subject: "A sign-in method was removed from your TAB account",
    content: {
      preheader: "A security notice about your TAB account.",
      eyebrow: "Security notice",
      heading: "A sign-in method was removed",
      paragraphs: ["A way to sign in ({{ .Provider }}) was removed from your TAB account.", NOT_YOU],
    },
  },
  mfa_factor_enrolled_notification: {
    subject: "Two-step verification was added to your TAB account",
    content: {
      preheader: "A security notice about your TAB account.",
      eyebrow: "Security notice",
      heading: "Two-step verification added",
      paragraphs: ["An authenticator app was added to your TAB account. From now on, signing in asks for its 6-digit code.", NOT_YOU],
    },
  },
  mfa_factor_unenrolled_notification: {
    subject: "Two-step verification was removed from your TAB account",
    content: {
      preheader: "A security notice about your TAB account.",
      eyebrow: "Security notice",
      heading: "Two-step verification removed",
      paragraphs: ["An authenticator app was removed from your TAB account.", NOT_YOU],
    },
  },
};
