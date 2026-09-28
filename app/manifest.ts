import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

/** Web app manifest (WEB-019): home-screen install for the site and, later, My TAB as a PWA (D-008). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.brand.name,
    short_name: "TAB",
    description: "Whole-person wellness for stronger bodies and fuller lives.",
    start_url: "/",
    display: "standalone",
    background_color: "#F8F5EF",
    theme_color: "#5A6046",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
