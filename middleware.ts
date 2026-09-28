import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { legacyRedirects, legacyPrefixRedirects } from "@/config/redirects";
import { siteConfig, siteUrl } from "@/config/site";

const LEGACY_HOSTS = ["tabmassage.com", "www.tabmassage.com"];

/**
 * 1. Legacy domain and paths → new site in one 308 hop (Step 19.3).
 * 2. Trailing-slash normalization.
 * 3. My TAB session refresh (Supabase) and portal-disabled guard.
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
  if (!isPortal) return NextResponse.next();

  if (!siteConfig.portal.enabled && path !== "/my-tab") return NextResponse.redirect(new URL("/my-tab", url.origin), 307);
  if (siteConfig.portal.dataSource !== "supabase") return NextResponse.next();

  // Refresh the Supabase session cookie on portal requests.
  let res = NextResponse.next({ request: req });
  const sb = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => req.cookies.set(name, value));
        res = NextResponse.next({ request: req });
        list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
      },
    },
  });
  const { data: { user } } = await sb.auth.getUser();
  const open = path === "/my-tab/login" || path.startsWith("/my-tab/auth");
  if (!user && !open) return NextResponse.redirect(new URL("/my-tab/login", url.origin), 307);
  return res;
}

export const config = {
  matcher: ["/((?!_next/|api/|brand/|favicon|apple-touch-icon|icon|manifest.webmanifest|robots.txt|sitemap.xml).*)"],
};
