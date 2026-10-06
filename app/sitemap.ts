import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/site";
import { siteFeatures } from "@/lib/settings";
import { services } from "@/content/services";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const features = await siteFeatures();
  const pages = ["", "/services", "/tab-method", "/about", "/about/our-story", "/faq", "/start", "/book", "/contact", "/privacy", "/terms", "/accessibility", "/policies"];
  if (features.team) pages.push("/about/team");
  if (features.resources) pages.push("/resources");
  if (features.events) pages.push("/events");
  const now = new Date();
  return [
    ...pages.map((p) => ({ url: `${siteUrl}${p}`, lastModified: now })),
    ...services.map((s) => ({ url: `${siteUrl}/services/${s.path}`, lastModified: now })),
  ];
}
