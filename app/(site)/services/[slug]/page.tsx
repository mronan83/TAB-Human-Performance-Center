import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServiceByPath, services } from "@/content/services";
import { Cta } from "@/components/Cta";
import { Photo } from "@/components/Photo";
import { Blocks } from "@/components/blocks/Blocks";
import { breadcrumbJsonLd, faqJsonLd, serviceJsonLd } from "@/lib/jsonld";
import { pageMetadata } from "@/lib/seo";
import { serviceBookingHref } from "@/lib/settings";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.path }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = getServiceByPath((await params).slug);
  if (!s) return {};
  // Owner ruling 2026-09-28: no location in titles; it stays in descriptions and structured data (ASM-006).
  return pageMetadata({ title: s.name, description: s.metaDescription, path: `/services/${s.path}` });
}

/**
 * Service-page template (Step 16.4). Fixed: the hero, the scope note, related services and the closing call to action.
 * Editable (content editor, proposed D-069): the sections between them, built from the block library in the order set
 * in content/services/<slug>.json. Today every page runs How we help, focus areas, the TAB Method, what to expect and
 * questions (the "Who it's for" and "What you may gain" lists were removed by the owner on 2026-10-07).
 */
export default async function ServicePage({ params }: Props) {
  const s = getServiceByPath((await params).slug);
  if (!s) notFound();
  const related = services.filter((x) => x.slug !== s.slug);
  const book = (await serviceBookingHref(s.slug)).href; // the owner's link for this service, if set (C23b)
  // Structured data (NFR-003, S16 §16.4): Service + breadcrumb; FAQ markup only for reviewed, visible answers.
  const jsonLd = [serviceJsonLd(s), breadcrumbJsonLd([{ name: "Services", path: "/services" }, { name: s.name, path: `/services/${s.path}` }]), faqJsonLd(s.faqs)].filter(Boolean);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="Breadcrumb" className="container-page pt-6 text-sm text-text-secondary">
        <Link href="/services" className="hover:text-primary">Services</Link> <span aria-hidden>/</span> <span aria-current="page">{s.name}</span>
      </nav>

      {/* Hero */}
      <section>
        <div className="container-page grid items-center gap-10 py-12 lg:grid-cols-[1.4fr_1fr] lg:py-16">
          <div>
            <p className="text-label text-secondary">{s.name}</p>
            <h1 className="text-display-lg mt-4">{s.headline}</h1>
            <p className="text-body-lg mt-6 max-w-2xl text-text-secondary">{s.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Cta kind={s.primaryCta.kind} label={s.primaryCta.label} service={s.slug} href={book} />
              <Cta kind={s.secondaryCta.kind} label={s.secondaryCta.label} service={s.slug} href={book} variant="outline" />
            </div>
          </div>
          {/* Library photograph (C21) with the pillar icon as a badge; both decorative */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <Photo name={s.heroPhoto} aspect="aspect-[4/3] sm:aspect-[4/5]" sizes="(min-width: 1024px) 40vw, (min-width: 448px) 448px, 100vw" priority />
            <div className="absolute -bottom-5 left-5 rounded-full bg-bone p-3 shadow-[var(--shadow-md)]">
              <Image src={s.icon} alt="" width={64} height={64} className="h-14 w-14 lg:h-16 lg:w-16" />
            </div>
          </div>
        </div>
      </section>

      {/* The editable sections, in the order the content editor sets (components/blocks/Blocks.tsx) */}
      <Blocks blocks={s.sections} scopeNote={s.scopeNote} />

      {/* Related */}
      <section className="section">
        <div className="container-page">
          <h2 className="text-h2">Connected support, when it makes sense</h2>
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {related.map((r) => (
              <li key={r.slug}>
                <Link href={`/services/${r.path}`} className="card flex items-center gap-4 p-5 hover:shadow-[var(--shadow-md)]">
                  <Image src={r.icon} alt="" width={56} height={56} />
                  <span className="font-semibold">{r.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="on-dark section bg-graphite text-white">
        <div className="container-prose text-center">
          <h2 className="text-display-lg">Start where you are.</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Cta kind={s.primaryCta.kind} label={s.primaryCta.label} service={s.slug} href={book} variant="secondary" />
            <Cta kind="start" label="Not sure yet? Start here" variant="outline" className="!border-white/50 !text-white" />
          </div>
        </div>
      </section>
    </>
  );
}

