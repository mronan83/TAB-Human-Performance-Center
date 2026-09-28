import { DraftFlag } from "./DraftFlag";

export function FaqList({ items }: { items: { q: string; a: string; draft?: boolean }[] }) {
  return (
    <div className="divide-y divide-border rounded-[20px] border border-border bg-white">
      {items.map((f) => (
        <details key={f.q} className="group px-6 py-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">
            {f.q}
            <span aria-hidden className="text-2xl text-secondary transition-transform group-open:rotate-45">+</span>
          </summary>
          <p className="mt-3 text-text-secondary">{f.a} <DraftFlag show={!!f.draft} /></p>
        </details>
      ))}
    </div>
  );
}
