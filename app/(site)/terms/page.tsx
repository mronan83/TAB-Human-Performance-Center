import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { termsOfUse } from "@/content/legal";
import { LegalDocument } from "@/components/LegalDocument";

export const metadata: Metadata = pageMetadata({ title: termsOfUse.title, description: "Terms of use for the TAB Human Performance Center website.", path: "/terms" });

export default function Page() {
  return <LegalDocument doc={termsOfUse} />;
}
