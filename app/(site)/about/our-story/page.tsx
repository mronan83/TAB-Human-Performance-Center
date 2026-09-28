import type { Metadata } from "next";
import { about } from "@/content/pages";
import { PageHero } from "@/components/PageHero";
import { DraftFlag } from "@/components/DraftFlag";

export const metadata: Metadata = { title: "Our Story", description: "From TAB Massage & Fitness to TAB Wellness Collective." };

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
