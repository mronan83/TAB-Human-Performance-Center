import type { ReactNode } from "react";
import { Photo } from "@/components/Photo";
import { images, type ImageKey } from "@/content/images";

/** Inner-page hero. With `image`, a library photograph (C21) sits beside the text on wide screens and below it on phones;
 * portrait photographs stand upright beside the text, landscapes keep their shape. */
export function PageHero({ eyebrow, title, lead, image, children }: { eyebrow?: string; title: string; lead?: string; image?: ImageKey; children?: ReactNode }) {
  const text = (
    <div>
      {eyebrow && <p className="text-label text-primary">{eyebrow}</p>}
      <h1 className="text-h1 mt-3 max-w-3xl">{title}</h1>
      {lead && <p className="text-body-lg mt-5 max-w-2xl text-text-secondary">{lead}</p>}
      {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
    </div>
  );
  return (
    <section className="border-b border-border bg-linen">
      {image ? (
        <div className="container-page grid items-center gap-10 py-12 lg:grid-cols-[1.3fr_1fr] lg:gap-16 lg:py-16">
          {text}
          <Photo name={image} aspect={images[image].height > images[image].width ? "aspect-[3/2] lg:aspect-[4/5]" : "aspect-[3/2]"} sizes="(min-width: 1024px) 40vw, 100vw" priority />
        </div>
      ) : (
        <div className="container-page py-16 lg:py-24">{text}</div>
      )}
    </section>
  );
}
