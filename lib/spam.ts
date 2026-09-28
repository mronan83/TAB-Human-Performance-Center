import { createHash } from "crypto";

/**
 * Spam defenses for the public forms (SEC-013). The inquiry API applies them cheapest first:
 *   1. same-origin POSTs only          5. link screening on the one free-text field (contact message)
 *   2. per-IP rate limit, body size cap 6. duplicate suppression
 *   3. honeypot field                   7. per-address daily limit
 *   4. minimum time to fill the form    8. Cloudflare Turnstile human check (when keys are set)
 * Rate limits and duplicate memory live in each server instance; a shared edge limit (Vercel Firewall) is the
 * planned complement. Anything suspicious but plausible is delivered with a flag instead of being dropped, so a
 * real person is never silently lost.
 */

export const MAX_BODY_BYTES = 16_000;
/** Faster than this from page load to submit is a script, not a person. */
export const MIN_FILL_MS = 2_500;

export type SpamFlag = "links" | "unverified";
export const flagLabels: Record<SpamFlag, string> = {
  links: "Contains a web link",
  unverified: "The human check was unavailable when this was sent",
};

/** Sliding-window counter per key, with eviction so memory stays bounded. */
export function limiter(max: number, windowMs: number) {
  const hits = new Map<string, number[]>();
  return (key: string) => {
    const now = Date.now();
    if (hits.size > 5_000) {
      for (const [k, times] of hits) if (times.every((t) => now - t >= windowMs)) hits.delete(k);
    }
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    recent.push(now);
    hits.set(key, recent);
    return recent.length > max;
  };
}

/** Browsers send Origin on every fetch POST; it must be this site. Blocks cross-site posting and bare scripts. */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

const MARKUP = /<\s*\/?\s*[a-z][^>]*>|\[\/?url[=\]]|\[link[=\]]/i;
const LINK = /\bhttps?:\/\/|\bwww\.[a-z0-9-]+\./i;

/** "markup" (HTML or BBCode links) is always spam; a plain link is delivered with a flag. */
export function screenText(text?: string): "ok" | "links" | "markup" {
  if (!text) return "ok";
  if (MARKUP.test(text)) return "markup";
  return LINK.test(text) ? "links" : "ok";
}

/**
 * Duplicate suppression (a double submit or a replay). `seen` checks; `remember` records, and is called only after a
 * submission was delivered, so a retry after a failed send is never mistaken for a duplicate.
 */
export function duplicateGuard(windowMs: number) {
  const delivered = new Map<string, number>();
  const key = (payload: unknown) => createHash("sha256").update(JSON.stringify(payload)).digest("hex");
  return {
    seen(payload: unknown) {
      const now = Date.now();
      for (const [k, t] of delivered) if (now - t >= windowMs) delivered.delete(k);
      return delivered.has(key(payload));
    },
    remember(payload: unknown) {
      delivered.set(key(payload), Date.now());
    },
  };
}

const SITEVERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Cloudflare Turnstile (free, invisible for most people). "off" until TURNSTILE_SECRET_KEY is set. A network
 * failure returns "unavailable": the submission goes through with a flag, because losing a real inquiry during a
 * Cloudflare outage costs more than one spam email.
 */
export async function verifyHuman(token: string | undefined, opts: { ip: string; action: string; host: string | null }): Promise<"pass" | "fail" | "unavailable" | "off"> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return "off";
  if (!token) return "fail";
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (opts.ip !== "unknown") body.set("remoteip", opts.ip);
    const res = await fetch(SITEVERIFY, { method: "POST", body, signal: AbortSignal.timeout(5_000) });
    const data = (await res.json()) as { success: boolean; action?: string; hostname?: string; metadata?: { result_with_testing_key?: boolean } };
    if (!data.success) return "fail";
    const testing = data.metadata?.result_with_testing_key === true;
    if (!testing && data.action !== opts.action) return "fail";
    if (!testing && opts.host && data.hostname !== opts.host.split(":")[0]) return "fail";
    return "pass";
  } catch {
    return "unavailable";
  }
}
