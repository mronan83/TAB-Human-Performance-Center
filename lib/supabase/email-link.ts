/**
 * Emailed sign-in and invitation links (C5). Supabase's own links carry either a PKCE `code`, which only the browser
 * that asked for the link can redeem, or, for invitations sent from the server, tokens after a `#` that never reach the
 * server. Our email templates (content/auth-emails.ts) send a `token_hash` instead, which any browser can redeem once:
 * a link requested on a laptop works when tapped on a phone, and invitations land correctly. Both forms are accepted, so
 * links already in someone's inbox keep working.
 */
import type { EmailOtpType } from "@supabase/supabase-js";

/** The link types each callback accepts; anything else is refused before Supabase is asked. */
/** TAB Practice also takes "invite": an admin's invitation (proposed D-071) lands there, then two-step verification. */
export const LINK_TYPES = { practice: ["email", "magiclink", "invite"], myTab: ["email", "magiclink", "invite"] } as const satisfies Record<string, readonly EmailOtpType[]>;

export type EmailLink = { kind: "code"; code: string } | { kind: "token"; tokenHash: string; type: EmailOtpType } | null;

/** Reads a callback URL. Pure, so the accepted shapes are tested without Supabase (e2e/guardrails.spec.ts). */
export function readEmailLink(url: URL, allowed: readonly EmailOtpType[]): EmailLink {
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  if (tokenHash && type && (allowed as readonly string[]).includes(type) && /^[\w-]{8,256}$/.test(tokenHash)) {
    return { kind: "token", tokenHash, type: type as EmailOtpType };
  }
  const code = url.searchParams.get("code");
  return code && /^[\w-]{8,256}$/.test(code) ? { kind: "code", code } : null;
}

/**
 * Turns a link into a session (cookies set by the server client) and returns that client, already signed in, or null if
 * the link is missing, used or expired.
 */
export async function redeemEmailLink(link: EmailLink) {
  if (!link) return null;
  const { createSupabaseServerClient } = await import("@/lib/supabase/server"); // server only; the parser above stays testable
  const sb = await createSupabaseServerClient();
  const { error } = link.kind === "token" ? await sb.auth.verifyOtp({ type: link.type, token_hash: link.tokenHash }) : await sb.auth.exchangeCodeForSession(link.code);
  return error ? null : sb;
}
