import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

const OG_IMAGE = { url: "/brand/og-default.png", width: 1200, height: 630, alt: siteConfig.brand.name };

/**
 * Per-page metadata (NFR-002, NFR-003; S16 §16.8): a unique title and human description, a canonical URL, and
 * matching Open Graph and Twitter tags. A page's `openGraph` replaces the layout's rather than merging with it,
 * so the shared fields are repeated here. Keep descriptions under about 155 characters.
 */
export function pageMetadata(page: { title: string; description: string; path: string; absoluteTitle?: boolean }): Metadata {
  const fullTitle = page.absoluteTitle ? page.title : `${page.title} | ${siteConfig.brand.name}`;
  return {
    title: page.absoluteTitle ? { absolute: page.title } : page.title,
    description: page.description,
    alternates: { canonical: page.path },
    openGraph: {
      title: fullTitle,
      description: page.description,
      url: page.path,
      siteName: siteConfig.brand.name,
      type: "website",
      locale: "en_US",
      images: [OG_IMAGE],
    },
    twitter: { card: "summary_large_image", title: fullTitle, description: page.description, images: [OG_IMAGE.url] },
  };
}
