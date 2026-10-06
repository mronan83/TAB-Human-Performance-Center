import { SmartLink } from "./SmartLink";
import { bookingHref } from "@/lib/links";
import type { ServiceSlug } from "@/content/services";
import clsx from "clsx";

type Kind = "book" | "start" | "link";
type Props = {
  kind: Kind;
  label: string;
  href?: string;
  service?: ServiceSlug;
  variant?: "primary" | "secondary" | "outline" | "outline-light";
  size?: "md" | "sm";
  className?: string;
};

/** One component for every call to action so destinations stay config-driven (Step 15.7). */
export function Cta({ kind, label, href, service, variant = "primary", size = "md", className }: Props) {
  let target = { href: href ?? "/", external: false };
  // A Book CTA may be given the owner's per-service link (lib/settings.ts → serviceBookingHref, C23b).
  if (kind === "book") target = href ? { href, external: /^https?:\/\//.test(href) } : bookingHref(service);
  if (kind === "start") target = { href: "/start", external: false };
  return (
    <SmartLink
      href={target.href}
      external={target.external}
      className={clsx("btn", `btn-${variant}`, size === "sm" && "btn-sm", className)}
      data-event={kind === "book" ? "Booking: Clicked" : undefined}
    >
      {label}
    </SmartLink>
  );
}
