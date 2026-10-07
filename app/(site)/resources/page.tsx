import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { home } from "@/content/pages";
import { getService } from "@/content/services";
import { PageHero } from "@/components/PageHero";
import { Cta } from "@/components/Cta";
import { DraftFlag } from "@/components/DraftFlag";
import { ExpiredLinkNotice, ResourceRequest } from "@/components/ResourceRequest";
import { notFound } from "next/navigation";
import { siteFeatures } from "@/lib/settings";
import { documentLabel, loadLibrary, visibleResources, type Resource } from "@/lib/resources";

export const metadata: Metadata = pageMetadata({ title: "Resources", description: "Guides and education to help you understand, prepare, practice, and keep moving forward.", path: "/resources" });

/**
 * The resource library (Step 16.5; C35, owner request 2026-10-07). Topics and entries are edited in the content editor:
 * links to other sites, and documents TAB wrote, some of which ask for an email address first. A topic with nothing
 * published yet lists what's planned for it.
 */
export default async function ResourcesPage() {
  if (!(await siteFeatures()).resources) notFound(); // the owner can hide it in Settings (C23b)
  const { topics } = loadLibrary();
  const resources = visibleResources();
  const withItems = topics.map((t) => ({ ...t, items: resources.filter((r) => r.topic === t.slug) }));
  const filled = withItems.filter((t) => t.items.length);
  const planned = withItems.filter((t) => !t.items.length && t.comingSoon.length);
  return (
    <>
      <PageHero eyebrow="Resources" title={home.resources.headline} lead={home.resources.body} />
      <section className="section">
        <div className="container-page">
          <ExpiredLinkNotice />
          {filled.length === 0 && <p className="max-w-2xl text-text-secondary">New guides and articles are on the way. Here’s what we’ll cover.</p>}
          <div className="space-y-16">
            {filled.map((t) => (
              <section key={t.slug} aria-labelledby={`topic-${t.slug}`}>
                <h2 id={`topic-${t.slug}`} className="text-h2">{t.title}</h2>
                {t.intro && <p className="mt-3 max-w-2xl text-text-secondary">{t.intro}</p>}
                <ul className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {t.items.map((r) => (<li key={r.slug} className="flex"><ResourceCard r={r} /></li>))}
                </ul>
              </section>
            ))}
          </div>
          {planned.length > 0 && (
            <div className={filled.length ? "mt-20" : "mt-10"}>
              {filled.length > 0 && <h2 className="text-h2">Coming soon</h2>}
              <div className={`${filled.length ? "mt-8 " : ""}grid gap-6 md:grid-cols-2 lg:grid-cols-3`}>
                {planned.map((t) => (
                  <div key={t.slug} className="card p-6">
                    {filled.length ? <h3 className="text-h4">{t.title}</h3> : <h2 className="text-h4">{t.title}</h2>}
                    <ul className="mt-4 space-y-2 text-text-secondary">{t.comingSoon.map((s) => (<li key={s}>{s}</li>))}</ul>
                    <p className="text-label mt-6 text-secondary">Coming soon</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="card-muted mt-12 flex flex-col items-start justify-between gap-6 p-8 md:flex-row md:items-center">
            <p className="text-body-lg max-w-xl">Not sure where to begin? Tell us what you’re working on and we’ll point you to the right starting point.</p>
            <Cta kind="start" label="Start Where You Are" />
          </div>
        </div>
      </section>
    </>
  );
}

function ResourceCard({ r }: { r: Resource }) {
  const service = r.pillar === "none" ? undefined : getService(r.pillar);
  const isLink = r.kind.discriminant === "link";
  const host = r.kind.discriminant === "link" ? new URL(r.kind.value.url).hostname.replace(/^www\./, "") : "";
  return (
    <article id={r.slug} className="card flex w-full scroll-mt-28 flex-col p-6">
      <DraftFlag show={r.draft} />
      <p className="text-label mt-1 text-text-secondary">{isLink ? `Link · ${host}` : `Guide · ${documentLabel(r.document?.bytes ?? 0)}`}</p>
      <h3 className="text-h4 mt-2">{r.title}</h3>
      <p className="mt-3 flex-1 text-text-secondary">{r.summary}</p>
      {service && <p className="mt-4"><Link href={`/services/${service.path}`} className="rounded-full bg-linen px-3 py-1 text-sm">{service.name}</Link></p>}
      {isLink ? (
        <a href={`/resources/go/${r.slug}`} aria-label={`Visit ${host}: ${r.title} (another website)`} className="mt-6 self-start font-semibold text-primary underline underline-offset-4">
          Visit {host}
        </a>
      ) : r.document?.requireEmail ? (
        <ResourceRequest slug={r.slug} title={r.title} />
      ) : (
        <a href={`/resources/download/${r.slug}`} aria-label={`Download the PDF: ${r.title}, ${documentLabel(r.document?.bytes ?? 0)}`} className="btn btn-outline mt-6 self-start">
          Download the PDF
        </a>
      )}
    </article>
  );
}
