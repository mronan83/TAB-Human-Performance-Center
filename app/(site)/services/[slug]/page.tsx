import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServiceByPath, services } from "@/content/services";
import { Cta } from "@/components/Cta";
import { FaqList } from "@/components/FaqList";
import { Photo } from "@/components/Photo";
import { TechniqueIndex } from "@/components/Techniques";
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
 * Service-page template (Step 16.4): hero, how we help (approach and focus areas), TAB Method, what to expect, scope, FAQ,
 * related, CTA. The separate "Who it's for" and "What you may gain" lists were removed (owner, 2026-10-07): they repeated
 * How we help, which presents the same ground better.
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
            <Photo name={s.photos.hero} aspect="aspect-[4/3] sm:aspect-[4/5]" sizes="(min-width: 1024px) 40vw, (min-width: 448px) 448px, 100vw" priority />
            <div className="absolute -bottom-5 left-5 rounded-full bg-bone p-3 shadow-[var(--shadow-md)]">
              <Image src={s.icon} alt="" width={64} height={64} className="h-14 w-14 lg:h-16 lg:w-16" />
            </div>
          </div>
        </div>
      </section>

      {/* How we help */}
      <section className="section bg-linen">
        <div className="container-page grid items-center gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
          <div className="max-w-[680px]">
            <h2 className="text-h1">How we help</h2>
            <p className="text-body-lg mt-6 font-medium">{s.approachLead}</p>
            {s.approach.map((p) => (<p key={p} className="mt-4 text-text-secondary">{p}</p>))}
          </div>
          <Photo name={s.photos.support} aspect="aspect-[3/2] lg:aspect-[4/5]" sizes="(min-width: 1024px) 40vw, 100vw" />
        </div>
        {s.focusAreas && (
          <div className="container-page mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {s.focusAreas.map((f) => (
              <div key={f.title} className="card p-6"><h3 className="text-h4">{f.title}</h3><p className="mt-2 text-text-secondary">{f.body}</p></div>
            ))}
          </div>
        )}
        {s.techniques && <TechniqueIndex />}
      </section>

      {/* TAB Method applied */}
      <section className="on-dark section bg-olive text-white">
        <div className="container-page">
          <h2 className="text-label text-white/90">Transform. Adapt. Balance.</h2>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            {(["transform", "adapt", "balance"] as const).map((k) => (
              <div key={k} className="border-t border-white/30 pt-6">
                <h3 className="font-[family-name:var(--font-display)] text-3xl font-medium capitalize">{k}</h3>
                <p className="mt-3 text-white/85">{s.method[k]}</p>
              </div>
            ))}
          </div>
          <blockquote className="mt-14 max-w-3xl font-[family-name:var(--font-serif)] text-3xl italic leading-snug">“{s.anchor}”</blockquote>
        </div>
      </section>

      {/* What to expect */}
      <section className="section">
        <div className="container-page">
          <h2 className="text-h1">What to expect</h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {s.whatToExpect.map((w, i) => (
              <li key={w.title} className="card p-6">
                <span className="text-label text-secondary">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="text-h4 mt-2">{w.title}</h3>
                <p className="mt-2 text-text-secondary">{w.body}</p>
              </li>
            ))}
          </ol>
          <p className="mt-8 rounded-[20px] bg-linen p-6 text-sm text-text-secondary"><strong className="text-text-primary">Scope of care. </strong>{s.scopeNote}</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="section bg-linen" id="faq">
        <div className="container-prose">
          <h2 className="text-h1">Questions</h2>
          <div className="mt-8"><FaqList items={s.faqs} /></div>
        </div>
      </section>

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

