import { FaqList } from "@/components/FaqList";
import { Photo } from "@/components/Photo";
import { TechniqueIndex } from "@/components/Techniques";
import type { Block, Tone } from "@/content/schema";

/**
 * The block library (proposed D-069, backlog C31): each kind of section an editor can add, remove or reorder on a
 * service page, rendered the same way everywhere. Blocks sit on Bone or Linen; consecutive blocks on the same tone read
 * as one band (no extra space between them). The TAB Method band is always Deep Olive. A new kind of block, or a new
 * look for one, is a design-lane change (docs/CONTENT-GUIDE.md).
 */

const bg: Record<Tone, string> = { bone: "", linen: "bg-linen" };

function Band({ tone, joined, id, children }: { tone: Tone; joined: boolean; id?: string; children: React.ReactNode }) {
  // Joined to the band above: 48px between them instead of a full section's padding (64px phones, 96px computers).
  return <section id={id} className={`section ${bg[tone]} ${joined ? "-mt-4 !pt-0 lg:-mt-12" : ""}`}>{children}</section>;
}

function BlockBody({ block, scopeNote }: { block: Block; scopeNote?: string }) {
  switch (block.discriminant) {
    case "textPhoto": {
      const v = block.value;
      return (
        <div className="container-page grid items-center gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
          <div className="max-w-[680px]">
            <h2 className="text-h1">{v.heading}</h2>
            {v.lead && <p className="text-body-lg mt-6 font-medium">{v.lead}</p>}
            {v.paragraphs.map((p) => (<p key={p} className="mt-4 text-text-secondary">{p}</p>))}
          </div>
          <Photo name={v.photo} aspect="aspect-[3/2] lg:aspect-[4/5]" sizes="(min-width: 1024px) 40vw, 100vw" />
        </div>
      );
    }
    case "cards": {
      const v = block.value;
      return (
        <div className="container-page">
          {v.heading && <h2 className="text-h2 mb-3">{v.heading}</h2>}
          {v.intro && <p className="mb-8 max-w-2xl text-text-secondary">{v.intro}</p>}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {v.cards.map((c) => (
              <div key={c.title} className="card p-6"><h3 className="text-h4">{c.title}</h3><p className="mt-2 text-text-secondary">{c.body}</p></div>
            ))}
          </div>
        </div>
      );
    }
    case "techniqueIndex":
      return <TechniqueIndex />;
    case "method": {
      const v = block.value;
      return (
        <div className="container-page">
          <h2 className="text-label text-white/90">Transform. Adapt. Balance.</h2>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            {(["transform", "adapt", "balance"] as const).map((k) => (
              <div key={k} className="border-t border-white/30 pt-6">
                <h3 className="font-[family-name:var(--font-display)] text-3xl font-medium capitalize">{k}</h3>
                <p className="mt-3 text-white/85">{v[k]}</p>
              </div>
            ))}
          </div>
          <blockquote className="mt-14 max-w-3xl font-[family-name:var(--font-serif)] text-3xl italic leading-snug">“{v.quote}”</blockquote>
        </div>
      );
    }
    case "steps": {
      const v = block.value;
      return (
        <div className="container-page">
          <h2 className="text-h1">{v.heading}</h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {v.steps.map((w, i) => (
              <li key={w.title} className="card p-6">
                <span className="text-label text-secondary">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="text-h4 mt-2">{w.title}</h3>
                <p className="mt-2 text-text-secondary">{w.body}</p>
              </li>
            ))}
          </ol>
          {scopeNote && <ScopeNote text={scopeNote} />}
        </div>
      );
    }
    case "faq": {
      const v = block.value;
      return (
        <div className="container-prose">
          <h2 className="text-h1">{v.heading}</h2>
          <div className="mt-8"><FaqList items={v.items} /></div>
        </div>
      );
    }
  }
}

function ScopeNote({ text }: { text: string }) {
  return <p className="mt-8 rounded-[20px] bg-linen p-6 text-sm text-text-secondary"><strong className="text-text-primary">Scope of care. </strong>{text}</p>;
}

/**
 * A page's sections in order. The scope note (guardrail 8) is not a block: it follows the "What to expect" steps, or
 * stands on its own after the last section when a page has no steps, so it can't be removed.
 */
export function Blocks({ blocks, scopeNote }: { blocks: Block[]; scopeNote: string }) {
  const toneOf = (b: Block): Tone | "olive" => (b.discriminant === "method" ? "olive" : b.value.tone);
  const hasSteps = blocks.some((b) => b.discriminant === "steps");
  return (
    <>
      {blocks.map((b, i) => {
        const tone = toneOf(b);
        const joined = i > 0 && toneOf(blocks[i - 1]) === tone && tone !== "olive";
        const key = `${b.discriminant}-${i}`;
        if (tone === "olive") return <section key={key} className="on-dark section bg-olive text-white"><BlockBody block={b} /></section>;
        return (
          <Band key={key} tone={tone} joined={joined} id={b.discriminant === "faq" ? "faq" : undefined}>
            <BlockBody block={b} scopeNote={b.discriminant === "steps" ? scopeNote : undefined} />
          </Band>
        );
      })}
      {!hasSteps && <section className="section !pt-0"><div className="container-page"><ScopeNote text={scopeNote} /></div></section>}
    </>
  );
}
