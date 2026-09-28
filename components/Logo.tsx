import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";

/** The logo is artwork, never live type (tokens §11). Swap files in /public/brand when the designer delivers vectors. */
export function Logo({ variant = "horizontal", className }: { variant?: "horizontal" | "stacked" | "symbol"; className?: string }) {
  const src =
    variant === "stacked" ? "/brand/logo-primary-stacked.png" : variant === "symbol" ? "/brand/symbol-512.png" : "/brand/logo-horizontal.png";
  const dims = variant === "stacked" ? { width: 1075, height: 1081 } : variant === "symbol" ? { width: 512, height: 512 } : { width: 1618, height: 437 };
  return (
    <Image src={src} alt={siteConfig.brand.name} {...dims} className={className} priority={variant === "horizontal"} />
  );
}

export function HomeLogoLink() {
  return (
    <Link href="/" className="flex items-center" aria-label={`${siteConfig.brand.name} home`}>
      <Logo className="h-14 w-auto" />
    </Link>
  );
}
