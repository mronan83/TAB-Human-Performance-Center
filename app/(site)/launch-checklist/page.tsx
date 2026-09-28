import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { launchChecklist } from "@/lib/placeholders";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = { title: "Launch checklist", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/** Owner-facing readiness view. Not linked in navigation; excluded from sitemap and indexing. */
export default function ChecklistPage() {
  // Internal only: available where draft markers are on (previews), never on the live site.
  if (process.env.NEXT_PUBLIC_SHOW_DRAFTS !== "true") notFound();
  const items = launchChecklist();
  const done = items.filter((i) => i.done).length;
  return (
    <>
      <PageHero eyebrow="Internal" title="Launch checklist" lead={`${done} of ${items.length} items complete. Everything below is driven by configuration and content files.`} />
      <section className="section">
        <div className="container-page overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead><tr className="border-b border-border-strong text-sm text-text-secondary"><th className="py-3 pr-4">Status</th><th className="py-3 pr-4">Area</th><th className="py-3 pr-4">Item</th><th className="py-3">Where to update</th></tr></thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.item} className="border-b border-border">
                  <td className="py-3 pr-4"><span className={i.done ? "font-semibold text-success" : "font-semibold text-warning"}>{i.done ? "Done" : "Open"}</span></td>
                  <td className="py-3 pr-4">{i.area}</td><td className="py-3 pr-4">{i.item}{i.optional && <span className="text-text-secondary"> (optional)</span>}</td>
                  <td className="py-3 font-mono text-sm text-text-secondary">{i.where}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
