import type { Metadata } from "next";
import { resourceClusters, home } from "@/content/pages";
import { PageHero } from "@/components/PageHero";
import { Cta } from "@/components/Cta";

export const metadata: Metadata = { title: "Resources", description: "Guides and education to help you understand, prepare, practice, and keep moving forward." };

/** Resource hub (Step 16.5). Articles and guides arrive with the CMS (D-036); clusters are the planned structure. */
export default function ResourcesPage() {
  return (
    <>
      <PageHero eyebrow="Resources" title={home.resources.headline} lead={home.resources.body} />
      <section className="section">
        <div className="container-page">
          <p className="max-w-2xl text-text-secondary">New guides and articles are on the way. Here’s what we’ll cover.</p>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {resourceClusters.map((c) => (
              <div key={c.title} className="card p-6">
                <h2 className="text-h4">{c.title}</h2>
                <ul className="mt-4 space-y-2 text-text-secondary">{c.topics.map((t) => (<li key={t}>{t}</li>))}</ul>
                <p className="text-label mt-6 text-secondary">Coming soon</p>
              </div>
            ))}
          </div>
          <div className="card-muted mt-12 flex flex-col items-start justify-between gap-6 p-8 md:flex-row md:items-center">
            <p className="text-body-lg max-w-xl">Want the first guide when it’s ready? Tell us what you’re working on and we’ll point you to the right starting point.</p>
            <Cta kind="start" label="Start Where You Are" />
          </div>
        </div>
      </section>
    </>
  );
}
