import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { NotFoundContent } from "@/components/NotFoundContent";
import { accountLink, siteFeatures } from "@/lib/settings";

/**
 * Any URL that matches no route, including unmapped legacy tabmassage.com paths, gets the branded 404 with the
 * normal header and footer instead of the framework default (NFR-002).
 */
export default async function RootNotFound() {
  return (
    <>
      <SiteHeader account={await accountLink()} features={await siteFeatures()} />
      <main id="main">
        <NotFoundContent />
      </main>
      <SiteFooter />
    </>
  );
}
