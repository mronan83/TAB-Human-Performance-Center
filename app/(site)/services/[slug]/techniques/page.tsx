import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServiceByPath } from "@/content/services";
import { techniqueGroups, techniques, techniquesPage } from "@/content/massage-techniques";
import { Cta } from "@/components/Cta";
import { PageHero } from "@/components/PageHero";
import { TechniqueCard, TechniqueTable } from "@/components/Techniques";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { pageMetadata } from "@/lib/seo";
import { serviceBookingHref } from "@/lib/settings";

type Props = { params: Promise<{ slug: string }> };

/** Only Massage & Bodywork has a techniques guide (owner request 2026-10-06); every other service's is a 404. */
export function generateStaticParams() {
  return [{ slug: "massage-bodywork" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if ((await params).slug !== "massage-bodywork") return {};
  return pageMetadata({ title: techniquesPage.title, description: techniquesPage.metaDescription, path: techniquesPage.path });
}

/**
 * The massage techniques guide: what each of the nine is, how it feels and when it's often chosen, grouped by what
 * people come in for, with an at-a-glance table. Replaces tabmassage.com's "Introduction to Massage" (redirected here).
 */
export default async function TechniquesPage({ params }: Props) {
  const s = getServiceByPath((await params).slug);
  if (!s?.techniques) notFound();
  const book = (await serviceBookingHref(s.slug)).href;
  const jsonLd = breadcrumbJsonLd([{ name: "Services", path: "/services" }, { name: s.name, path: `/services/${s.path}` }, { name: techniquesPage.title, path: techniquesPage.path }]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="Breadcrumb" className="container-page pt-6 text-sm text-text-secondary">
        <Link href="/services" className="hover:text-primary">Services</Link> <span aria-hidden>/</span>{" "}
        <Link href={`/services/${s.path}`} className="hover:text-primary">{s.name}</Link> <span aria-hidden>/</span>{" "}
        <span aria-current="page">{techniquesPage.title}</span>
      </nav>

      <PageHero eyebrow={s.name} title={techniquesPage.title} lead={techniquesPage.lead}>
        <Cta kind={s.primaryCta.kind} label={s.primaryCta.label} service={s.slug} href={book} />
        <Cta kind="start" label="Find the Right Starting Point" service={s.slug} variant="outline" />
      </PageHero>

      <section className="section">
        {/* minmax(0, …) and min-w-0 let the columns shrink below the table's width on phones (it scrolls or stacks instead). */}
        <div className="container-page grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:items-start">
          <div className="min-w-0 rounded-[20px] bg-olive p-8 text-white on-dark">
            <h2 className="text-h3">{techniquesPage.notSure.title}</h2>
            <p className="mt-3 text-white/90">{techniquesPage.notSure.body}</p>
          </div>
          <div className="min-w-0">
            <h2 className="text-h2">At a glance</h2>
            <p className="mb-5 mt-2 text-text-secondary">Pressure runs from very light to firm. Every technique is adjusted to you during the session.</p>
            <TechniqueTable />
          </div>
        </div>
      </section>

      {techniqueGroups.map((g, i) => (
        <section key={g.key} className={i % 2 === 0 ? "section bg-linen" : "section"} aria-labelledby={`group-${g.key}`}>
          <div className="container-page">
            <h2 id={`group-${g.key}`} className="text-h1">{g.title}</h2>
            <p className="text-body-lg mt-3 max-w-2xl text-text-secondary">{g.lead}</p>
            <div className="mt-10 grid grid-cols-1 gap-6">
              {techniques.filter((t) => t.group === g.key).map((t) => <TechniqueCard key={t.slug} t={t} />)}
            </div>
          </div>
        </section>
      ))}

      <section className="section">
        <div className="container-page">
          <p className="rounded-[20px] bg-linen p-6 text-sm text-text-secondary"><strong className="text-text-primary">Scope of care. </strong>{s.scopeNote} Massage and bodywork support comfort, movement and recovery; they don’t diagnose or replace medical care.</p>
        </div>
      </section>

      <section className="on-dark section bg-graphite text-white">
        <div className="container-prose text-center">
          <h2 className="text-display-lg">Start where you are.</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Cta kind={s.primaryCta.kind} label={s.primaryCta.label} service={s.slug} href={book} variant="secondary" />
            <Link href={`/services/${s.path}`} className="btn btn-outline !border-white/50 !text-white">Back to {s.name}</Link>
          </div>
        </div>
      </section>
    </>
  );
}
