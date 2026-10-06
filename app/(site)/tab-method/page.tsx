import type { Metadata } from "next";
import Image from "next/image";
import { pageMetadata } from "@/lib/seo";
import { method } from "@/content/pages";
import { PageHero } from "@/components/PageHero";
import { MethodSteps } from "@/components/MethodSteps";
import { Cta } from "@/components/Cta";
import { images, type ImageKey } from "@/content/images";

const STAGE_PHOTOS: { stage: string; image: ImageKey }[] = [
  { stage: "Transform", image: "transformSunrise" },
  { stage: "Adapt", image: "adaptPath" },
  { stage: "Balance", image: "balanceLayers" },
];

export const metadata: Metadata = pageMetadata({ title: "The TAB Method", description: "Start where you are. Transform. Adapt. Balance. How TAB helps you build capacity for real life.", path: "/tab-method" });

export default function MethodPage() {
  return (
    <>
      <PageHero eyebrow="The TAB Method" title="Start where you are. Transform. Adapt. Balance." lead={method.intro} image="trailSunrise">
        <Cta kind="start" label="Start Where You Are" />
      </PageHero>
      <section className="section"><div className="container-page"><MethodSteps headingLevel={2} /></div></section>
      {/* Transform. Adapt. Balance. in library photographs (C21). The stage names repeat the steps above, so the band is decorative. */}
      <section aria-hidden="true" className="on-dark bg-graphite">
        <div className="grid sm:grid-cols-3">
          {STAGE_PHOTOS.map(({ stage, image }) => (
            <div key={stage} className="relative aspect-[4/3] sm:aspect-[3/4] lg:aspect-[4/5]">
              <Image src={images[image].src} alt="" fill sizes="(min-width: 640px) 33vw, 100vw" className="object-cover" style={{ objectPosition: images[image].focal }} />
              <div className="absolute inset-0 bg-gradient-to-t from-graphite/85 via-graphite/10 to-transparent" />
              <p className="absolute bottom-6 left-6 font-[family-name:var(--font-serif)] text-4xl text-white">{stage}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="section bg-linen">
        <div className="container-page">
          <h2 className="text-h1 max-w-2xl">How we work with you</h2>
          <ul className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {method.principles.map((p) => (
              <li key={p.title} className="rounded-[20px] bg-white p-6"><h3 className="text-h4">{p.title}</h3><p className="mt-2 text-text-secondary">{p.body}</p></li>
            ))}
          </ul>
        </div>
      </section>
      <section className="section">
        <div className="container-prose text-center">
          <blockquote className="font-[family-name:var(--font-serif)] text-3xl italic leading-snug md:text-4xl">“{method.statement}”</blockquote>
          <div className="mt-10"><Cta kind="start" label="Start Where You Are" /></div>
        </div>
      </section>
    </>
  );
}
