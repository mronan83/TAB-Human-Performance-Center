import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { about } from "@/content/pages";
import { PageHero } from "@/components/PageHero";
import { DraftFlag } from "@/components/DraftFlag";

export const metadata: Metadata = pageMetadata({ title: "Our Story", description: "How TAB Massage & Fitness, serving Brighton and Howell since 2008, grew into TAB Human Performance Center.", path: "/about/our-story" });

export default function StoryPage() {
  return (
    <>
      <PageHero eyebrow="Our story" title={about.story.headline} />
      <section className="section">
        <div className="container-prose">
          <DraftFlag show={about.story.draft} />
          {about.story.body.map((p) => (<p key={p} className="text-body-lg mt-5 text-text-secondary">{p}</p>))}
        </div>
      </section>
    </>
  );
}
