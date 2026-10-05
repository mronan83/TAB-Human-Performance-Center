import type { MetadataRoute } from "next";
import { siteUrl, siteConfig } from "@/config/site";
import { services } from "@/content/services";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/services", "/tab-method", "/about", "/about/our-story", "/faq", "/start", "/book", "/contact", "/privacy", "/terms", "/accessibility", "/policies"];
  if (siteConfig.features.team) pages.push("/about/team");
  if (siteConfig.features.resources) pages.push("/resources");
  if (siteConfig.features.events) pages.push("/events");
  const now = new Date();
  return [
    ...pages.map((p) => ({ url: `${siteUrl}${p}`, lastModified: now })),
    ...services.map((s) => ({ url: `${siteUrl}/services/${s.path}`, lastModified: now })),
  ];
}
