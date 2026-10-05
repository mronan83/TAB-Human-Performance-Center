import Image from "next/image";
import Link from "next/link";
import type { Service } from "@/content/services";

/** `headingLevel` keeps the outline valid: h3 under a section h2 (home), h2 directly under the page h1 (/services). */
export function ServiceCard({ service, headingLevel = 3 }: { service: Service; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <article className="card group flex h-full flex-col p-6 transition-shadow duration-200 hover:shadow-[var(--shadow-md)]">
      <Image src={service.icon} alt="" width={72} height={72} className="h-18 w-18" />
      <p className="text-label mt-6 text-text-secondary">{service.name}</p>
      {/* Five across on the homepage: a smaller headline keeps narrow cards readable; /services has two columns. */}
      <Heading className={`mt-2 font-[family-name:var(--font-display)] font-semibold ${headingLevel === 2 ? "text-[1.75rem] leading-tight" : "text-[1.25rem] leading-snug"}`}>{service.headline}</Heading>
      <p className="mt-3 flex-1 text-text-secondary">{service.summary}</p>
      <Link href={`/services/${service.path}`} className="mt-6 font-semibold text-primary underline decoration-border-strong underline-offset-4 group-hover:decoration-primary">
        Explore {service.name}
      </Link>
    </article>
  );
}
