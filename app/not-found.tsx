import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { NotFoundContent } from "@/components/NotFoundContent";

/**
 * Any URL that matches no route, including unmapped legacy tabmassage.com paths, gets the branded 404 with the
 * normal header and footer instead of the framework default (NFR-002).
 */
export default function RootNotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <NotFoundContent />
      </main>
      <SiteFooter />
    </>
  );
}
