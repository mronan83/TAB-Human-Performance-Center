import Link from "next/link";
import { Cta } from "@/components/Cta";

/** Branded "page not found" (NFR-002: clean 404), shared by the site group and the root not-found page. */
export function NotFoundContent() {
  return (
    <section className="section">
      <div className="container-prose text-center">
        <p className="text-label text-secondary">Page not found</p>
        <h1 className="text-h1 mt-3">This page has moved or no longer exists.</h1>
        <p className="text-body-lg mt-4 text-text-secondary">TAB Massage & Fitness is now TAB Wellness Collective, and our site has a new structure.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3"><Cta kind="start" label="Start Where You Are" /><Link href="/services" className="btn btn-outline">Explore Services</Link></div>
      </div>
    </section>
  );
}
