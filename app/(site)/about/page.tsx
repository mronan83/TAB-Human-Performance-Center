import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { about } from "@/content/pages";
import { PageHero } from "@/components/PageHero";
import { Cta } from "@/components/Cta";

export const metadata: Metadata = pageMetadata({ title: "About", description: "Why TAB Human Performance Center exists and how we approach whole-person wellness.", path: "/about" });

export default function AboutPage() {
  return (
    <>
      <PageHero eyebrow="About TAB" title={about.headline}>
        <Link href="/about/our-story" className="btn btn-outline">Our story</Link>
      </PageHero>
      <section className="section">
        <div className="container-prose space-y-14">
          {about.sections.map((s) => (
            <div key={s.title}>
              <h2 className="text-h2">{s.title}</h2>
              {s.body.map((p) => (<p key={p} className="text-body-lg mt-4 text-text-secondary">{p}</p>))}
            </div>
          ))}
          <div className="pt-4"><Cta kind="start" label="Start Where You Are" /></div>
        </div>
      </section>
    </>
  );
}
