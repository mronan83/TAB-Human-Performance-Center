import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" }, // older browsers; CSP frame-ancestors 'none' (middleware.ts) for the rest
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // includeSubDomains/preload wait for the cutover runbook: the legacy tabmassage.com host is served here too.
  { key: "Strict-Transport-Security", value: "max-age=63072000" },
];

const LIBRARY = ["./content/resources/**/*", "./content/resource-topics/**/*"];

const nextConfig: NextConfig = {
  // Trailing-slash normalization and legacy redirects are handled together in middleware.ts
  // so every legacy URL resolves in a single 308 hop (Step 19.3).
  skipTrailingSlashRedirect: true,
  poweredByHeader: false,
  // The resource library is read from content/ at run time too (page revalidation, downloads, requests): ship it with
  // the functions that read it (lib/resources.ts). Uploaded PDFs go only with the download route.
  outputFileTracingIncludes: {
    "/resources": LIBRARY,
    "/resources/go/[slug]": LIBRARY,
    "/resources/download/[slug]": [...LIBRARY, "./content/resource-files/**/*"],
    "/api/inquiry": LIBRARY,
    // The team page checks its uploaded photos when it's rebuilt (lib/team-photos.ts).
    "/about/team": ["./public/images/team/**/*"],
  },
  async headers() {
    // Pre-launch deployments are never indexable (NFR-009); see indexingAllowed in config/site.ts.
    const noindex = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true" ? [] : [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];
    return [
      { source: "/:path*", headers: [...securityHeaders, ...noindex] },
      { source: "/(my-tab|practice)/:path*", headers: [{ key: "Cache-Control", value: "no-store" }, { key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
};

export default nextConfig;
