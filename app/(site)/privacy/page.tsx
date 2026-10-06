import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { privacyPolicy } from "@/content/legal";
import { LegalDocument } from "@/components/LegalDocument";

export const metadata: Metadata = pageMetadata({ title: privacyPolicy.title, description: "How TAB Human Performance Center collects, uses and protects your information.", path: "/privacy" });

export default function Page() {
  return <LegalDocument doc={privacyPolicy} />;
}
