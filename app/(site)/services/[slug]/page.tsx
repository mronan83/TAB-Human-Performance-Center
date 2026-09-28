import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getService, services } from "@/content/services";
import { Cta } from "@/components/Cta";
import { FaqList } from "@/components/FaqList";
import { siteConfig } from "@/config/site";
import { breadcrumbJsonLd, faqJsonLd, serviceJsonLd } from "@/lib/jsonld";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = getService((await params).slug);
  if (!s) return {};
  return pageMetadata({ title: `${s.name} in ${siteConfig.location.label}`, description: s.metaDescription, path: `/services/${s.slug}` });
}

/** Service-page template (Step 16.4): hero, who it's for, how we help, TAB Method, what to expect, scope, FAQ, related, CTA. */
export default async function ServicePage({ params }: Props) {
  const s = getService((await params).slug);
  if (!s) notFound();
  const related = services.filter((x) => x.slug !== s.slug);
  // Structured data (NFR-003, S16 §16.4): Service + breadcrumb; FAQ markup only for reviewed, visible answers.
  const jsonLd = [serviceJsonLd(s), breadcrumbJsonLd([{ name: "Services", path: "/services" }, { name: s.name, path: `/services/${s.slug}` }]), faqJsonLd(s.faqs)].filter(Boolean);

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
              <Cta kind={s.primaryCta.kind} label={s.primaryCta.label} service={s.slug} />
              <Cta kind={s.secondaryCta.kind} label={s.secondaryCta.label} service={s.slug} variant="outline" />
            </div>
          </div>
          <div className="mx-auto w-56 lg:w-72"><Image src={s.icon} alt="" width={256} height={256} className="w-full" priority /></div>
        </div>
      </section>

      {/* Who it's for / what you gain */}
      <section className="section bg-sand">
        <div className="container-page grid gap-8 md:grid-cols-2">
          <div className="rounded-[20px] bg-white p-8">
            <h2 className="text-h2">Who it’s for</h2>
            <ul className="mt-6 space-y-3">{s.whoItsFor.map((w) => (<li key={w} className="flex gap-3"><Dot />{w}</li>))}</ul>
          </div>
          <div className="rounded-[20px] bg-white p-8">
            <h2 className="text-h2">What you may gain</h2>
            <ul className="mt-6 space-y-3">{s.gains.map((w) => (<li key={w} className="flex gap-3"><Dot />{w}</li>))}</ul>
          </div>
        </div>
      </section>

      {/* How we help */}
      <section className="section">
        <div className="container-prose">
          <h2 className="text-h1">How we help</h2>
          <p className="text-body-lg mt-6 font-medium">{s.approachLead}</p>
          {s.approach.map((p) => (<p key={p} className="mt-4 text-text-secondary">{p}</p>))}
        </div>
        {s.focusAreas && (
          <div className="container-page mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {s.focusAreas.map((f) => (
              <div key={f.title} className="card p-6"><h3 className="text-h4">{f.title}</h3><p className="mt-2 text-text-secondary">{f.body}</p></div>
            ))}
          </div>
        )}
      </section>

      {/* TAB Method applied */}
      <section className="on-dark section bg-olive text-white">
        <div className="container-page">
          <h2 className="text-label text-white/90">The TAB Method, applied</h2>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            {(["transform", "align", "become"] as const).map((k) => (
              <div key={k} className="border-t border-white/30 pt-6">
                <h3 className="font-[family-name:var(--font-display)] text-3xl font-medium capitalize">{k}</h3>
                <p className="mt-3 text-white/85">{s.method[k]}</p>
              </div>
            ))}
          </div>
          <blockquote className="mt-14 max-w-3xl font-[family-name:var(--font-display)] text-3xl italic leading-snug">“{s.anchor}”</blockquote>
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
          <p className="mt-8 rounded-[20px] bg-sand p-6 text-sm text-text-secondary"><strong className="text-text-primary">Scope of care. </strong>{s.scopeNote}</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="section bg-sand" id="faq">
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
                <Link href={`/services/${r.slug}`} className="card flex items-center gap-4 p-5 hover:shadow-[var(--shadow-md)]">
                  <Image src={r.icon} alt="" width={56} height={56} />
                  <span className="font-semibold">{r.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="on-dark section bg-charcoal text-white">
        <div className="container-prose text-center">
          <h2 className="text-display-lg">Start where you are.</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Cta kind={s.primaryCta.kind} label={s.primaryCta.label} service={s.slug} variant="secondary" />
            <Cta kind="start" label="Not sure yet? Start here" variant="outline" className="!border-white/50 !text-white" />
          </div>
        </div>
      </section>
    </>
  );
}

function Dot() {
  return <span aria-hidden className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-terracotta" />;
}
