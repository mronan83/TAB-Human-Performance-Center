import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Image from "next/image";
import Link from "next/link";
import { about } from "@/content/pages";
import { getService } from "@/content/services";
import { PageHero } from "@/components/PageHero";
import { DraftFlag } from "@/components/DraftFlag";
import { notFound } from "next/navigation";
import { siteFeatures } from "@/lib/settings";
import { checkTeamPhotos } from "@/lib/team-photos";

export const metadata: Metadata = pageMetadata({ title: "Our Team", description: about.team.metaDescription, path: "/about/team" });

export default async function TeamPage() {
  checkTeamPhotos(about.team.members); // a bad upload fails the build, naming it
  if (!(await siteFeatures()).team) notFound(); // the owner can hide it in Settings (C23b)
  return (
    <>
      <PageHero eyebrow="Our team" title={about.team.headline} />
      <section className="section">
        <div className="container-page grid gap-8 md:grid-cols-2">
          {about.team.members.map((m) => (
            <article key={m.name} className="card grid gap-6 p-6 sm:grid-cols-[160px_1fr]">
              <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-[20px] bg-linen">
                {m.photo ? <Image src={m.photo} alt={m.photoAlt} fill sizes="160px" className="object-cover" /> : <span aria-hidden="true" className="text-sm text-text-secondary">Photo coming soon</span>}
              </div>
              <div>
                <DraftFlag show={about.team.draft} />
                <h2 className="text-h3 mt-2">{m.name}</h2>
                {/* Guardrail 10: credentials appear only once the owner has confirmed them in the editor. */}
                <p className="text-text-secondary">{m.role}{m.credentialsConfirmed && m.credentials ? ` · ${m.credentials}` : ""}</p>
                {!m.credentialsConfirmed && m.credentials && <DraftFlag label="Credentials to confirm" />}
                {m.bio && <p className="mt-4">{m.bio}</p>}
                <ul className="mt-4 flex flex-wrap gap-2">
                  {m.services.map((slug) => { const s = getService(slug); return s ? (<li key={slug}><Link href={`/services/${s.path}`} className="rounded-full bg-linen px-3 py-1 text-sm">{s.name}</Link></li>) : null; })}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
