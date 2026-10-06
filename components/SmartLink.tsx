import Link from "next/link";
import type { ReactNode } from "react";

type Props = { href: string; external?: boolean; className?: string; children: ReactNode; "aria-label"?: string; "data-event"?: string };

/** Internal links use next/link; external links open in the same tab with rel protections. */
export function SmartLink({ href, external, className, children, ...rest }: Props) {
  if (external || /^https?:\/\//.test(href) || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return (
      <a href={href} className={className} rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className} {...rest}>
      {children}
    </Link>
  );
}
