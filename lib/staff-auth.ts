/**
 * Staff sign-in rules (owner ruling 2026-10-06, proposed D-068): a password, then a second step (a passkey, or the
 * 6-digit code from the authenticator app), and a 30-day ceiling on any staff session. Pure helpers, so
 * e2e/guardrails.spec.ts can test them without Supabase; the server actions and middleware use them.
 */
import { siteUrl } from "@/config/site";

/** Passwords: long rather than complicated (NIST SP 800-63B). 72 is bcrypt's limit, which Supabase uses. */
export const PASSWORD_MIN = 12;
export const PASSWORD_MAX = 72;

/** What's wrong with a new password, in words a person can act on, or null if it's acceptable. */
export function passwordProblem(password: string, email?: string): string | null {
  if (password.length < PASSWORD_MIN) return `Use at least ${PASSWORD_MIN} characters. A short phrase you'll remember works well.`;
  if (new TextEncoder().encode(password).length > PASSWORD_MAX) return `Use at most ${PASSWORD_MAX} characters.`;
  if (/^(.)\1+$/.test(password)) return "Use more than one repeated character.";
  const local = email?.split("@")[0]?.toLowerCase();
  if (local && local.length >= 4 && password.toLowerCase().includes(local)) return "Don't include your email address in your password.";
  return null;
}

/**
 * Has this password appeared in a known data breach? Uses the Pwned Passwords range API (k-anonymity): only the first
 * five characters of the password's SHA-1 hash leave our server, never the password. Fails open (returns false) if the
 * service is slow or down, so a third-party outage never blocks setting a password.
 */
export async function isBreachedPassword(password: string): Promise<boolean> {
  try {
    const digest = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(password));
    const hex = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
    const res = await fetch(`https://api.pwnedpasswords.com/range/${hex.slice(0, 5)}`, { headers: { "Add-Padding": "true" }, signal: AbortSignal.timeout(3000), cache: "no-store" });
    if (!res.ok) return false;
    const suffix = hex.slice(5);
    return (await res.text()).split("\n").some((line) => {
      const [s, count] = line.trim().split(":");
      return s === suffix && Number(count) > 0;
    });
  } catch {
    return false;
  }
}

/**
 * Passkeys as the second step. Off: Supabase's hosted service refuses to switch on WebAuthn MFA ("Enabling of MFA with
 * WebAuthn not currently supported", 2026-10-06), though its client library supports it. The code is ready; turn this
 * on, and the two Supabase settings (`mfa_web_authn_enroll_enabled`, `mfa_web_authn_verify_enabled`), when it does.
 */
export const PASSKEYS_AVAILABLE = false;

/** Staff sessions end 30 days after sign-in, however active (idle sessions already end after 7: lib/supabase/cookies.ts). */
export const STAFF_SESSION_MAX_DAYS = 30;

/** When this session signed in: the earliest authentication method recorded in its access token (`amr`). */
export function sessionStartedAt(amr: unknown): number | null {
  if (!Array.isArray(amr)) return null;
  const times = amr.map((a) => (a && typeof a === "object" ? Number((a as { timestamp?: unknown }).timestamp) : NaN)).filter((t) => Number.isFinite(t) && t > 0);
  return times.length ? Math.min(...times) : null;
}

/** True when a session is past the staff ceiling. A session whose start can't be read counts as expired. */
export function staffSessionExpired(amr: unknown, nowSeconds = Date.now() / 1000): boolean {
  const start = sessionStartedAt(amr);
  return start === null || nowSeconds - start > STAFF_SESSION_MAX_DAYS * 24 * 60 * 60;
}

/**
 * The passkey "relying party" for the address a person is on. Passkeys belong to a domain: one made on
 * tabhumanperformance.com works on www. and the bare domain alike. Only our own addresses qualify; any other host
 * (including a forged Host header) gets null, and the page offers the 6-digit code instead.
 */
export function passkeyRelyingParty(host: string | null | undefined): { rpId: string; rpOrigins: string[] } | null {
  const h = (host ?? "").toLowerCase().replace(/:\d+$/, "");
  const site = new URL(siteUrl).hostname.replace(/^www\./, "");
  if (h === site || h === `www.${site}`) return { rpId: site, rpOrigins: [`https://${site}`, `https://www.${site}`] };
  if (h === "tab-human-performance-center.vercel.app") return { rpId: h, rpOrigins: [`https://${h}`] };
  if (process.env.NODE_ENV === "development" && h === "localhost") return { rpId: h, rpOrigins: [`http://${(host ?? "").toLowerCase()}`] };
  return null;
}

// ---------------------------------------------------------------------------
// Passkey options travel from the server action to the browser as JSON (binary fields as base64url), as WebAuthn
// Level 3 defines. Supabase's library hands them to us with binary fields already decoded; these turn them back.
// ---------------------------------------------------------------------------

export function toBase64Url(bytes: ArrayBuffer | ArrayBufferView): string {
  const u8 = bytes instanceof ArrayBuffer ? new Uint8Array(bytes) : new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let s = "";
  for (const b of u8) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function fromBase64Url(s: string): Uint8Array<ArrayBuffer> {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

const isBinary = (v: unknown): v is ArrayBuffer | ArrayBufferView => v instanceof ArrayBuffer || ArrayBuffer.isView(v);
const enc = (v: unknown) => (isBinary(v) ? toBase64Url(v) : v);

type Json = Record<string, unknown>;
type CredRef = { id: unknown; [k: string]: unknown };

/** Passkey creation or request options with every binary field as base64url, ready to send to the browser. */
export function passkeyOptionsToJSON(publicKey: Json): Json {
  const out: Json = { ...publicKey, challenge: enc(publicKey.challenge) };
  if (publicKey.user && typeof publicKey.user === "object") out.user = { ...(publicKey.user as Json), id: enc((publicKey.user as Json).id) };
  for (const k of ["excludeCredentials", "allowCredentials"] as const) {
    const list = publicKey[k];
    if (Array.isArray(list)) out[k] = (list as CredRef[]).map((c) => ({ ...c, id: enc(c.id) }));
  }
  return out;
}
