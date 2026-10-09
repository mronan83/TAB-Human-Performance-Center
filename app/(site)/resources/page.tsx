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
import { documentLabel, topicLists, type Resource } from "@/lib/resources";

export const metadata: Metadata = pageMetadata({ title: "Resources", description: "Guides and education to help you understand, prepare, practice, and keep moving forward.", path: "/resources" });

/**
 * The resource library (Step 16.5; C35, owner requests 2026-10-07 and 2026-10-08). One card per topic, listing its
 * subjects: a subject with a published resource is clickable (a document downloads, a link opens its page, a document
 * that asks for an email address opens a short form), and the rest say coming soon. Edited in the content editor.
 */
export default async function ResourcesPage() {
  if (!(await siteFeatures()).resources) notFound(); // the owner can hide it in Settings (C23b)
  const topics = topicLists();
  const anyReady = topics.some((t) => t.rows.some((r) => r.kind === "resource"));
  return (
    <>
      <PageHero eyebrow="Resources" title={home.resources.headline} lead={home.resources.body} />
      <section className="section">
        <div className="container-page">
          <ExpiredLinkNotice />
          {!anyReady && <p className="max-w-2xl text-text-secondary">New guides and articles are on the way. Here’s what we’ll cover.</p>}
          <div className={`${anyReady ? "" : "mt-10 "}grid gap-6 md:grid-cols-2 lg:grid-cols-3`}>
            {topics.map((t) => (
              <section key={t.slug} aria-labelledby={`topic-${t.slug}`} className="card flex flex-col p-6">
                <h2 id={`topic-${t.slug}`} className="text-h4">{t.title}</h2>
                {t.intro && <p className="mt-2 text-sm text-text-secondary">{t.intro}</p>}
                <ul className="mt-4 divide-y divide-border">
                  {t.rows.map((row) => (
                    <li key={row.kind === "resource" ? row.resource.slug : `planned-${row.title}`} id={row.kind === "resource" ? row.resource.slug : undefined} className="scroll-mt-28 py-3">
                      {row.kind === "resource" ? <ResourceRow label={row.title} r={row.resource} /> : (
                        <p className="flex items-baseline justify-between gap-3 text-text-secondary">
                          <span>{row.title}</span>
                          <span className="text-label shrink-0 text-xs">Coming soon</span>
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
          <div className="card-muted mt-12 flex flex-col items-start justify-between gap-6 p-8 md:flex-row md:items-center">
            <p className="text-body-lg max-w-xl">Not sure where to begin? Tell us what you’re working on and we’ll point you to the right starting point.</p>
            <Cta kind="start" label="Start Where You Are" />
          </div>
        </div>
      </section>
    </>
  );
}

/** A clickable line: a link opens its page, a document downloads, an email-first document opens its form. */
function ResourceRow({ label, r }: { label: string; r: Resource }) {
  const service = r.pillar === "none" ? undefined : getService(r.pillar);
  const extra = (
    <>
      <DraftFlag show={r.draft} />
      <p className="mt-1 text-sm text-text-secondary">{r.summary}</p>
      {service && <p className="mt-2"><Link href={`/services/${service.path}`} className="rounded-full bg-linen px-3 py-0.5 text-xs">{service.name}</Link></p>}
    </>
  );
  if (r.document?.requireEmail) {
    return <ResourceRequest slug={r.slug} title={r.title} label={label} meta={documentLabel(r.document.bytes)}>{extra}</ResourceRequest>;
  }
  const isLink = r.kind.discriminant === "link";
  const target = r.kind.discriminant === "link" ? r.kind.value.url : "";
  const onSite = isLink && target.startsWith("/");
  const meta = isLink ? (onSite ? "Page on our website" : `Link · ${new URL(target).hostname.replace(/^www\./, "")}`) : documentLabel(r.document?.bytes ?? 0);
  return (
    <div>
      <a
        href={isLink ? `/resources/go/${r.slug}` : `/resources/download/${r.slug}`}
        aria-label={`${label}: ${meta}${isLink && !onSite ? ", another website" : ""}`}
        className="font-semibold text-primary underline decoration-border-strong underline-offset-4 hover:decoration-primary"
      >
        {label}
      </a>
      <p className="mt-1 text-sm text-text-secondary">{meta}</p>
      {extra}
    </div>
  );
}
