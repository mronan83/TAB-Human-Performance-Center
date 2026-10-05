import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { method } from "@/content/pages";
import { PageHero } from "@/components/PageHero";
import { MethodSteps } from "@/components/MethodSteps";
import { Cta } from "@/components/Cta";

export const metadata: Metadata = pageMetadata({ title: "The TAB Method", description: "Start where you are. Transform. Adapt. Balance. How TAB personalizes whole-person wellness.", path: "/tab-method" });

export default function MethodPage() {
  return (
    <>
      <PageHero eyebrow="The TAB Method" title="Start where you are. Transform. Adapt. Balance." lead={method.intro}>
        <Cta kind="start" label="Start Where You Are" />
      </PageHero>
      <section className="section"><div className="container-page"><MethodSteps headingLevel={2} /></div></section>
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
