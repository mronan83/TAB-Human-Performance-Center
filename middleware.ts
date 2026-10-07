import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { legacyRedirects, legacyPrefixRedirects } from "@/config/redirects";
import { siteConfig, siteUrl } from "@/config/site";
import { contentSecurityPolicy } from "@/lib/csp";
import { sessionCookieOptions } from "@/lib/supabase/cookies";
import { staffSessionExpired } from "@/lib/staff-auth";

const LEGACY_HOSTS = ["tabmassage.com", "www.tabmassage.com"];

/**
 * 1. Legacy domain and paths → new site in one 308 hop (Step 19.3).
 * 2. Trailing-slash normalization.
 * 3. Content-Security-Policy on every page (SEC-013; see lib/csp.ts), with a per-request nonce on the portal.
 * 4. My TAB session refresh (Supabase) and portal-disabled guard.
 * 5. TAB Practice sessions end 30 days after sign-in (proposed D-068; idle sessions end after 7 through the cookie).
 */
export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const host = req.headers.get("host")?.toLowerCase() ?? "";
  // Protocol-relative or backslash paths could resolve to another host when rebuilt into a URL.
  if (url.pathname.startsWith("//") || url.pathname.includes("\\")) return new NextResponse(null, { status: 400 });
  let path = url.pathname;
  if (path.length > 1 && path.endsWith("/")) path = path.replace(/\/+$/, "");

  const mapped = legacyRedirects[path] ?? legacyPrefixRedirects.find((r) => path.startsWith(r.prefix))?.to;
  const fromLegacyHost = LEGACY_HOSTS.includes(host);
  if (mapped || fromLegacyHost || path !== url.pathname) {
    // Set only the path on a known origin so the redirect can never change host. A plain URL, not url.clone():
    // NextURL remembers the request's trailing slash and adds it back, which made /about/ redirect to itself.
    const target = new URL(fromLegacyHost ? siteUrl : url.origin);
    target.pathname = mapped ?? path;
    target.search = mapped ? "" : url.search;
    return NextResponse.redirect(target, 308);
  }

  const isPortal = path.startsWith("/my-tab") || path.startsWith("/practice");
  if (!isPortal) {
    const res = NextResponse.next();
    res.headers.set("Content-Security-Policy", contentSecurityPolicy(undefined, { editor: path.startsWith("/keystatic") }));
    return res;
  }

  // TAB Practice stays reachable for real staff sign-in (owner Settings, C23) even while the client portal is closed.
  const isPractice = path.startsWith("/practice");
  const staffReal = isPractice && siteConfig.portal.realStaffSignIn;
  if (!siteConfig.portal.enabled && path !== "/my-tab" && !staffReal) return NextResponse.redirect(new URL("/my-tab", url.origin), 307);

  // Next.js stamps this nonce on the scripts it renders. The policy goes on the request (as the Next.js docs describe)
  // and on the response the browser enforces; e2e/security.spec.ts checks the page scripts carry the enforced nonce.
  const csp = contentSecurityPolicy(btoa(crypto.randomUUID()));
  const next = () => {
    const headers = new Headers(req.headers);
    headers.set("Content-Security-Policy", csp);
    headers.set("x-tab-path", path); // lets the My TAB layout keep the sign-in page outside the portal shell
    const res = NextResponse.next({ request: { headers } });
    res.headers.set("Content-Security-Policy", csp);
    return res;
  };
  if (siteConfig.portal.dataSource !== "supabase" && !staffReal) return next();

  // Refresh the Supabase session cookie on portal requests.
  let res = next();
  const sb = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookieOptions: sessionCookieOptions,
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => req.cookies.set(name, value));
        res = next();
        list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
      },
    },
  });
  const { data: { user } } = await sb.auth.getUser();
  const open = path === "/my-tab/login" || path.startsWith("/my-tab/auth") || path === "/practice/login" || path.startsWith("/practice/auth");
  if (!user && !open) return NextResponse.redirect(new URL(isPractice ? "/practice/login" : "/my-tab/login", url.origin), 307);
  if (user && isPractice) {
    // Only a session we could read and found too old is ended; a failed read (a network blip) never signs anyone out.
    const { data } = await sb.auth.getClaims();
    if (data?.claims && staffSessionExpired(data.claims.amr)) {
      await sb.auth.signOut({ scope: "local" }); // clears the session cookies on `res`
      const out = NextResponse.redirect(new URL("/practice/login?e=expired", url.origin), 307);
      res.cookies.getAll().forEach((c) => out.cookies.set(c));
      return out;
    }
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/|api/|brand/|favicon|apple-touch-icon|icon|manifest.webmanifest|robots.txt|sitemap.xml).*)"],
};
