import type { APIRequestContext } from "@playwright/test";
import { siteUrl } from "../config/site";

/** Paths listed in the sitemap, which uses absolute production URLs. */
export async function sitemapPaths(request: APIRequestContext): Promise<string[]> {
  const xml = await (await request.get("/sitemap.xml")).text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(siteUrl, "") || "/");
}

/** Pages every launch check should cover, beyond the sitemap. */
export const extraPages = ["/no-such-page-for-tests"];
