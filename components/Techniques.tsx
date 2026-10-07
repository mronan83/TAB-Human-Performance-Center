import Link from "next/link";
import { DraftFlag } from "@/components/DraftFlag";
import { PRESSURE_LEVELS, techniqueGroups, techniques, techniquesPage, type Pressure, type Technique } from "@/content/massage-techniques";

/** How the work usually feels, as words plus a four-step scale. The words carry the meaning; the dots are decorative. */
export function PressureScale({ pressure }: { pressure: Pressure }) {
  const level = PRESSURE_LEVELS.indexOf(pressure) + 1;
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm">
      <span aria-hidden className="flex gap-1">
        {PRESSURE_LEVELS.map((p, i) => (
          <span key={p} className={i < level ? "h-2 w-2 rounded-full bg-olive" : "h-2 w-2 rounded-full border border-border-strong"} />
        ))}
      </span>
      <span>{pressure}</span>
    </span>
  );
}

/** One technique on the techniques page: an anchor target, so the Massage page and the table can link straight to it. */
export function TechniqueCard({ t }: { t: Technique }) {
  const showNote = t.draft && t.reviewNote && process.env.NEXT_PUBLIC_SHOW_DRAFTS === "true";
  return (
    <article id={t.slug} className="card scroll-mt-28 p-5 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h3 className="text-h4 hyphens-auto sm:text-h3">{t.name}{t.aka && <span className="ml-2 text-base font-normal text-text-secondary">({t.aka})</span>}</h3>
        <p className="text-text-secondary"><span className="sr-only">Pressure: </span><PressureScale pressure={t.pressure} /></p>
      </div>
      <p className="mt-4">{t.summary} <DraftFlag show={t.draft} label="Draft: owner to confirm" /></p>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <h4 className="text-label text-secondary">What it feels like</h4>
          <p className="mt-2 text-text-secondary">{t.feelsLike}</p>
        </div>
        <div>
          <h4 className="text-label text-secondary">Often chosen for</h4>
          <ul className="mt-2 space-y-2 text-text-secondary">
            {t.oftenChosenFor.map((o) => (<li key={o} className="flex gap-3"><span aria-hidden className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-clay" />{o}</li>))}
          </ul>
        </div>
      </div>
      {t.goodToKnow && <p className="mt-6 rounded-xl bg-linen p-4 text-sm"><strong>Good to know. </strong>{t.goodToKnow}</p>}
      {showNote && <p className="mt-4 rounded-xl bg-note-soft p-3 text-sm"><strong>Review note: </strong>{t.reviewNote}</p>}
    </article>
  );
}

/**
 * The at-a-glance comparison: every technique, its pressure and what it's often chosen for, linking to its card. A table
 * from small tablets up; on phones the same rows stack as a list, so nothing needs scrolling sideways.
 */
export function TechniqueTable() {
  return (
    <>
      <ul className="divide-y divide-border rounded-[20px] border border-border bg-white sm:hidden" aria-label="Massage techniques at a glance">
        {techniques.map((t) => (
          <li key={t.slug} className="px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
              <a href={`#${t.slug}`} className="font-semibold underline decoration-border-strong underline-offset-4 hover:decoration-primary">{t.name}</a>
              <PressureScale pressure={t.pressure} />
            </div>
            <p className="mt-1 text-sm text-text-secondary">{t.oftenChosenFor[0]}</p>
          </li>
        ))}
      </ul>
      <TechniqueTableWide />
    </>
  );
}

function TechniqueTableWide() {
  return (
    <div className="hidden overflow-x-auto rounded-[20px] border border-border bg-white sm:block" tabIndex={0} role="region" aria-label="Massage techniques at a glance">
      <table className="w-full min-w-[560px] border-collapse text-left">
        <caption className="sr-only">Massage techniques at a glance: pressure and what each is often chosen for</caption>
        <thead>
          <tr className="border-b border-border-strong text-sm text-text-secondary">
            <th scope="col" className="px-5 py-3">Technique</th>
            <th scope="col" className="px-5 py-3">Pressure</th>
            <th scope="col" className="px-5 py-3">Often chosen for</th>
          </tr>
        </thead>
        <tbody>
          {techniques.map((t) => (
            <tr key={t.slug} className="border-b border-border last:border-0">
              <th scope="row" className="px-5 py-3 font-semibold"><a href={`#${t.slug}`} className="underline decoration-border-strong underline-offset-4 hover:decoration-primary">{t.name}</a></th>
              <td className="px-5 py-3"><PressureScale pressure={t.pressure} /></td>
              <td className="px-5 py-3 text-text-secondary">{t.oftenChosenFor[0]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** On the Massage & Bodywork page: the techniques by group, each linking to its full description. */
export function TechniqueIndex() {
  return (
    <div className="container-page mt-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h3 className="text-h2">Techniques we draw on</h3>
          <p className="mt-3 text-text-secondary">{techniquesPage.notSure.body}</p>
        </div>
        <Link href={techniquesPage.path} className="btn btn-outline">Compare all {techniques.length} techniques</Link>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {techniqueGroups.map((g) => (
          <div key={g.key} className="rounded-[20px] bg-linen p-6">
            <h4 className="font-semibold">{g.title}</h4>
            <ul className="mt-3 space-y-2">
              {techniques.filter((t) => t.group === g.key).map((t) => (
                <li key={t.slug}><Link href={`${techniquesPage.path}#${t.slug}`} className="underline decoration-border-strong underline-offset-4 hover:decoration-primary">{t.name}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
