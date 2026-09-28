import type { ReactNode } from "react";

export function PageHero({ eyebrow, title, lead, children }: { eyebrow?: string; title: string; lead?: string; children?: ReactNode }) {
  return (
    <section className="border-b border-border bg-sand">
      <div className="container-page py-16 lg:py-24">
        {eyebrow && <p className="text-label text-primary">{eyebrow}</p>}
        <h1 className="text-h1 mt-3 max-w-3xl">{title}</h1>
        {lead && <p className="text-body-lg mt-5 max-w-2xl text-text-secondary">{lead}</p>}
        {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
      </div>
    </section>
  );
}
