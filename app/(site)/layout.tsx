import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { TransitionBanner } from "@/components/TransitionBanner";
import { organizationJsonLd } from "@/lib/jsonld";
import { Analytics } from "@/components/Analytics";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }} />
      <TransitionBanner />
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
      <Analytics />
    </>
  );
}
