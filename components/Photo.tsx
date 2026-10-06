import Image from "next/image";
import clsx from "clsx";
import { images, type ImageKey } from "@/content/images";

/**
 * A library photograph (C21), cropped to `aspect` around the image's focal point. Stock is decorative by rule (see
 * content/images.ts), so the alt text is always empty.
 */
export function Photo({ name, aspect, sizes, className, priority = false }: { name: ImageKey; aspect: string; sizes: string; className?: string; priority?: boolean }) {
  const img = images[name];
  return (
    <div className={clsx("relative overflow-hidden rounded-[20px] bg-linen", aspect, className)}>
      <Image src={img.src} alt="" fill sizes={sizes} priority={priority} className="object-cover" style={{ objectPosition: img.focal }} />
    </div>
  );
}
