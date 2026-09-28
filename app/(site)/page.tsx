import Image from "next/image";
import Link from "next/link";
import { home } from "@/content/pages";
import { services } from "@/content/services";
import { siteConfig } from "@/config/site";
import { Cta } from "@/components/Cta";
import { ServiceCard } from "@/components/ServiceCard";
import { MethodSteps } from "@/components/MethodSteps";

export default function HomePage() {
  return (
    <>
      {/* 1. Hero */}
      <section className="overflow-hidden">
        <div className="container-page grid items-center gap-12 py-16 lg:grid-cols-[1.15fr_1fr] lg:py-24">
          <div>
            <p className="text-label text-secondary">{siteConfig.brand.philosophy}</p>
            <h1 className="text-display-xl mt-5">{home.hero.headline}</h1>
            <p className="text-body-lg mt-6 max-w-xl text-text-secondary">{home.hero.body}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Cta kind="start" label="Start Where You Are" />
              <Cta kind="link" href="/services" label="Explore Services" variant="outline" />
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md">
            <div className="aspect-[4/5] rounded-t-full bg-sand p-10 pt-16">
              <div className="flex h-full flex-col items-center justify-center rounded-t-full border border-linen bg-cream/70">
                <Image src="/brand/symbol.svg" alt="" width={1130} height={958} className="w-3/5" priority unoptimized />
                <p className="mt-6 font-[family-name:var(--font-display)] text-2xl italic text-olive">Start where you are.</p>
              </div>
            </div>
            <p className="sr-only">Photography placeholder: replace with an authentic session photo when available.</p>
          </div>
        </div>
      </section>

      {/* 2. Core idea */}
      <section className="section bg-sand">
        <div className="container-prose text-center">
          <h2 className="text-h1">{home.coreIdea.headline}</h2>
          <p className="text-body-lg mt-6 text-text-secondary">{home.coreIdea.body}</p>
        </div>
      </section>

      {/* 3. Four pillars */}
      <section className="section">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="text-label text-secondary">Four areas of support</p>
            <h2 className="text-h1 mt-3">{home.pillars.headline}</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {services.map((s) => (<ServiceCard key={s.slug} service={s} />))}
          </div>
          <p className="mt-10 max-w-3xl text-text-secondary">{home.pillars.closing}</p>
        </div>
      </section>

      {/* 4. The TAB Method */}
      <section className="section bg-sand">
        <div className="container-page">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="text-label text-primary">The TAB Method</p>
              <h2 className="text-h1 mt-3">{home.method.headline}</h2>
              <p className="text-body-lg mt-4 text-text-secondary">{home.method.body}</p>
            </div>
            <Link href="/tab-method" className="btn btn-outline">Learn the TAB Method</Link>
          </div>
          <div className="mt-12"><MethodSteps compact /></div>
        </div>
      </section>

      {/* 5. Personalization */}
      <section className="section bg-olive text-white">
        <div className="container-page">
          <h2 className="text-h1 max-w-2xl">{home.personalization.headline}</h2>
          <ul className="mt-12 grid gap-8 md:grid-cols-3">
            {home.personalization.points.map((p) => (
              <li key={p.title} className="border-t border-white/30 pt-6">
                <h3 className="text-h4">{p.title}</h3>
                <p className="mt-2 text-white/85">{p.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 6. Guided conversion */}
      <section className="section">
        <div className="container-page">
          <div className="card grid gap-8 p-8 md:grid-cols-[1.5fr_1fr] md:items-center md:p-14">
            <div>
              <h2 className="text-h1">{home.guided.headline}</h2>
              <p className="text-body-lg mt-5 text-text-secondary">{home.guided.body}</p>
            </div>
            <div className="flex flex-col gap-3 md:items-end">
              <Cta kind="start" label="Start Where You Are" />
              <Cta kind="book" label="I know what I need: Book" variant="outline" />
            </div>
          </div>
        </div>
      </section>

      {/* 7. Trust */}
      <section className="section bg-sand">
        <div className="container-page grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-h1">{home.trust.headline}</h2>
            <p className="text-body-lg mt-5 text-text-secondary">{home.trust.body}</p>
            <Link href="/about/our-story" className="mt-8 inline-block font-semibold text-primary underline underline-offset-4">Read our story</Link>
          </div>
          <dl className="grid grid-cols-2 gap-4">
            {[
              [`Since ${siteConfig.brand.foundedYear}`, "Serving our community"],
              ["20+ years", "Hands-on practitioner experience"],
              ["Four", "Connected service pillars"],
              ["In person & virtual", "Support that fits your life"],
            ].map(([v, l]) => (
              <div key={l} className="rounded-[20px] bg-white p-6">
                <dt className="sr-only">{l}</dt>
                <dd className="font-[family-name:var(--font-display)] text-3xl font-medium">{v}</dd>
                <dd className="mt-1 text-sm text-text-secondary">{l}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* 8. Resources */}
      {siteConfig.features.resources && (
        <section className="section">
          <div className="container-page flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <h2 className="text-h1">{home.resources.headline}</h2>
              <p className="text-body-lg mt-4 text-text-secondary">{home.resources.body}</p>
            </div>
            <Link href="/resources" className="btn btn-outline">Explore Resources</Link>
          </div>
        </section>
      )}

      {/* 9. Closing CTA */}
      <section className="on-dark section bg-charcoal text-white">
        <div className="container-prose text-center">
          <h2 className="text-display-lg">{home.closing.headline}</h2>
          <p className="text-body-lg mt-5 text-white/80">{home.closing.body}</p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Cta kind="start" label="Start Where You Are" variant="secondary" />
            <Cta kind="book" label="Book" variant="outline" className="!border-white/50 !text-white hover:!border-white" />
          </div>
        </div>
      </section>
    </>
  );
}
