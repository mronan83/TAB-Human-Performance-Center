import Image from "next/image";
import Link from "next/link";
import { home } from "@/content/pages";
import { services } from "@/content/services";
import { images } from "@/content/images";
import { siteConfig } from "@/config/site";
import { Cta } from "@/components/Cta";
import { ServiceCard } from "@/components/ServiceCard";
import { MethodSteps } from "@/components/MethodSteps";
import { Photo } from "@/components/Photo";
import { pageMetadata } from "@/lib/seo";
import { siteFeatures } from "@/lib/settings";

export const metadata = pageMetadata({
  title: `${siteConfig.brand.name} | ${siteConfig.brand.categoryLine.replace(/\.$/, "")}`,
  absoluteTitle: true,
  description: home.metaDescription,
  path: "/",
});

// The pillar count comes from the services themselves, so it can't drift from the site (npm run test:brand).
const PILLAR_COUNT = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven"][services.length] ?? String(services.length);

export default async function HomePage() {
  const features = await siteFeatures();
  return (
    <>
      {/* 1. Hero: the mountain photograph from the approved board, a graphite scrim for AA contrast on the text side */}
      <section className="on-dark relative isolate overflow-hidden bg-graphite text-white">
        <Image
          src={home.hero.image.src}
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-[70%_50%]"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-graphite/85 via-graphite/60 to-graphite/5 max-md:bg-graphite/60" />
        <div className="container-page py-24 md:py-32 lg:py-40">
          <div className="max-w-xl">
            <h1 className="text-display-xl font-[family-name:var(--font-serif)] !font-medium !tracking-normal">{home.hero.headline}</h1>
            <p className="text-body-lg mt-6 max-w-lg text-white/90">{home.hero.body}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Cta kind="start" label="Start Where You Are" />
              <Cta kind="link" href="/services" label="Explore Services" variant="outline-light" />
            </div>
          </div>
        </div>
      </section>

      {/* Service icons under the hero, as on the board's website mock-up */}
      <nav aria-label="Services" className="border-b border-border bg-surface">
        <ul className="container-page flex flex-wrap justify-center gap-y-6 py-8">
          {services.map((s) => (
            <li key={s.slug} className="basis-1/2 px-2 sm:basis-1/3 lg:basis-1/5">
              <Link href={`/services/${s.path}`} className="group flex flex-col items-center gap-3 rounded-lg p-2 text-center">
                <Image src={s.icon} alt="" width={64} height={64} className="h-16 w-16" />
                <span className="text-label text-text-primary group-hover:text-primary">{s.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* 2. Core idea */}
      <section className="section bg-linen">
        <div className="container-page grid items-center gap-10 md:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="text-h1">{home.coreIdea.headline}</h2>
            <p className="text-body-lg mt-6 text-text-secondary">{home.coreIdea.body}</p>
          </div>
          <Photo name={home.coreIdea.photo} aspect="aspect-[4/5]" sizes="(min-width: 768px) 50vw, 100vw" className="mx-auto w-full max-w-md" />
        </div>
      </section>

      {/* 3. Five pillars (proposed D-065) */}
      <section className="section">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="text-label text-secondary">Five areas of support</p>
            <h2 className="text-h1 mt-3">{home.pillars.headline}</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {services.map((s) => (<ServiceCard key={s.slug} service={s} />))}
          </div>
          <p className="mt-10 max-w-3xl text-text-secondary">{home.pillars.closing}</p>
        </div>
      </section>

      {/* 4. The TAB Method */}
      <section className="section bg-linen">
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
      <section className="section bg-linen">
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
              [PILLAR_COUNT, "Connected service pillars"],
              ["In person & virtual", "Support that fits your life"],
            ].map(([v, l]) => (
              <div key={l} className="flex flex-col rounded-[20px] bg-white p-6">
                <dt className="mt-1 text-sm text-text-secondary">{l}</dt>
                <dd className="order-first font-[family-name:var(--font-display)] text-3xl font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* 8. Resources */}
      {features.resources && (
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
      <section className="on-dark section relative isolate overflow-hidden bg-graphite text-white">
        {/* Library photograph (C21): layered ridges at sunrise, echoing the hero (owner, 2026-10-06). The scrim is darkest behind
            the text (white body text measured at 4.5:1 or better) and lighter at the edges so the warm light shows. */}
        <Image src={images.balanceLayers.src} alt="" fill sizes="100vw" className="-z-20 object-cover" style={{ objectPosition: "50% 60%" }} />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_100%_80%_at_50%_50%,color-mix(in_srgb,var(--color-graphite)_74%,transparent),color-mix(in_srgb,var(--color-graphite)_45%,transparent))] lg:bg-[radial-gradient(ellipse_55%_75%_at_50%_50%,color-mix(in_srgb,var(--color-graphite)_74%,transparent),color-mix(in_srgb,var(--color-graphite)_30%,transparent))]" />
        <div className="container-prose text-center">
          <h2 className="text-display-lg font-[family-name:var(--font-serif)] !font-medium !tracking-normal">{home.closing.headline}</h2>
          <p className="text-body-lg mt-5 text-white">{home.closing.body}</p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Cta kind="start" label="Start Where You Are" variant="secondary" />
            <Cta kind="book" label="Book" variant="outline" className="!border-white/50 !text-white hover:!border-white" />
          </div>
        </div>
      </section>
    </>
  );
}
