import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Image from "next/image";
import Link from "next/link";
import { about } from "@/content/pages";
import { getService } from "@/content/services";
import { PageHero } from "@/components/PageHero";
import { DraftFlag } from "@/components/DraftFlag";

export const metadata: Metadata = pageMetadata({ title: "Our Team", description: "Meet the people behind TAB Human Performance Center.", path: "/about/team" });

export default function TeamPage() {
  return (
    <>
      <PageHero eyebrow="Our team" title={about.team.headline} />
      <section className="section">
        <div className="container-page grid gap-8 md:grid-cols-2">
          {about.team.members.map((m) => (
            <article key={m.name} className="card grid gap-6 p-6 sm:grid-cols-[160px_1fr]">
              <div className="flex aspect-square items-center justify-center overflow-hidden rounded-[20px] bg-linen">
                {m.photo ? <Image src={m.photo} alt={m.name} width={320} height={320} className="h-full w-full object-cover" /> : <span aria-hidden="true" className="text-sm text-text-secondary">Photo coming soon</span>}
              </div>
              <div>
                <DraftFlag show={about.team.draft} />
                <h2 className="text-h3 mt-2">{m.name}</h2>
                <p className="text-text-secondary">{m.role} · {m.credentials}</p>
                <p className="mt-4">{m.bio}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {m.services.map((slug) => { const s = getService(slug); return s ? (<li key={slug}><Link href={`/services/${slug}`} className="rounded-full bg-linen px-3 py-1 text-sm">{s.name}</Link></li>) : null; })}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
