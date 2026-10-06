import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { TransitionBanner } from "@/components/TransitionBanner";
import { organizationJsonLd } from "@/lib/jsonld";
import { Analytics } from "@/components/Analytics";
import { accountLink } from "@/lib/settings";

/**
 * Public pages are prebuilt; rebuilding them daily lets date-based content change without a deploy. The transition
 * notice (Step 19) disappears within a day of `brand.transitionNotice.hideAfter`.
 */
export const revalidate = 86_400;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }} />
      <TransitionBanner />
      <SiteHeader account={await accountLink()} />
      <main id="main">{children}</main>
      <SiteFooter />
      <Analytics />
    </>
  );
}
