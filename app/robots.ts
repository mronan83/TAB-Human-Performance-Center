import type { MetadataRoute } from "next";
import { indexingAllowed, siteUrl } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: indexingAllowed
      ? [{ userAgent: "*", allow: "/", disallow: ["/my-tab", "/practice", "/api", "/keystatic", "/resources/go/"] }]
      : [{ userAgent: "*", disallow: "/" }],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
