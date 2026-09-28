import Image from "next/image";
import Link from "next/link";
import type { Service } from "@/content/services";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="card group flex h-full flex-col p-6 transition-shadow duration-200 hover:shadow-[var(--shadow-md)]">
      <Image src={service.icon} alt="" width={72} height={72} className="h-18 w-18" />
      <p className="text-label mt-6 text-text-secondary">{service.name}</p>
      <h3 className="mt-2 font-[family-name:var(--font-display)] text-[1.75rem] font-medium leading-tight">{service.headline}</h3>
      <p className="mt-3 flex-1 text-text-secondary">{service.summary}</p>
      <Link href={`/services/${service.slug}`} className="mt-6 font-semibold text-primary underline decoration-border-strong underline-offset-4 group-hover:decoration-primary">
        Explore {service.name}
      </Link>
    </article>
  );
}
