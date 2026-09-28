import { siteConfig } from "@/config/site";

const deploymentEnv = process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.VERCEL_ENV;

/**
 * Content-Security-Policy (SEC-013), set per request in middleware.ts.
 *
 * - My TAB and TAB Practice (`nonce` given): scripts run only with this request's nonce ('strict-dynamic' lets those
 *   scripts load Next.js chunks). These pages already render per request, so the nonce costs nothing.
 * - Public pages (no nonce): prebuilt and cached, so they can't carry a per-request nonce. Scripts are limited to this
 *   site and the named services; inline scripts stay allowed because Next.js inlines its page data. The public pages
 *   render no user-supplied content, which is what a nonce mainly defends against.
 * - Everywhere: no framing (clickjacking), no plugins, no <base> rewriting, and data and form posts only to allowed hosts.
 *
 * A new third-party service needs its hosts here, or the browser blocks it (e2e/security.spec.ts reports violations).
 */
export function contentSecurityPolicy(nonce?: string): string {
  const pixel = !!siteConfig.analytics.metaPixelId; // D-046: only once paid ads start, never on the portal
  const preview = deploymentEnv === "preview"; // Vercel's review toolbar on preview deployments only
  const dev = process.env.NODE_ENV === "development"; // React Refresh needs eval in `next dev`

  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": nonce
      ? ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'"]
      : ["'self'", "'unsafe-inline'", "https://plausible.io", "https://challenges.cloudflare.com", ...(pixel ? ["https://connect.facebook.net"] : [])],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:", ...(pixel && !nonce ? ["https://www.facebook.com"] : [])],
    "font-src": ["'self'"],
    "connect-src": ["'self'", ...(nonce ? [] : ["https://plausible.io"]), ...(pixel && !nonce ? ["https://www.facebook.com"] : [])],
    // Turnstile renders in an iframe (public forms, and the My TAB sign-in form).
    "frame-src": ["https://challenges.cloudflare.com"],
    // Stripe Checkout and the billing portal are reached by a form post that redirects (D-052).
    "form-action": ["'self'", ...(nonce ? ["https://checkout.stripe.com", "https://billing.stripe.com"] : [])],
    "frame-ancestors": ["'none'"],
    "base-uri": ["'self'"],
    "object-src": ["'none'"],
  };

  if (preview) {
    directives["script-src"].push("https://vercel.live");
    directives["style-src"].push("https://vercel.live");
    directives["img-src"].push("https://vercel.live", "https://vercel.com");
    directives["font-src"].push("https://vercel.live", "https://assets.vercel.com");
    directives["connect-src"].push("https://vercel.live", "wss://ws-us3.pusher.com");
    directives["frame-src"].push("https://vercel.live");
  }
  if (dev) directives["script-src"].push("'unsafe-eval'");

  return Object.entries(directives)
    .map(([name, values]) => `${name} ${values.join(" ")}`)
    .join("; ");
}
