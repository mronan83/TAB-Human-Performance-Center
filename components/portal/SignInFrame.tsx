import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { siteConfig } from "@/config/site";
import { home } from "@/content/pages";

/**
 * Sign-in in the brand's own frame (C22): the homepage mountain and purpose line beside the form on wide screens,
 * the stacked lockup above it on small ones. The photograph is decorative; the scrim keeps white text at AA.
 */
export function SignInFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(480px,560px)]">
      <div className="on-dark relative isolate hidden overflow-hidden bg-graphite text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Image src={home.hero.image.src} alt="" fill priority sizes="60vw" className="-z-20 object-cover object-[70%_50%]" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,var(--color-graphite)_-10%,transparent_35%,transparent_45%,var(--color-graphite)_100%)] opacity-90" />
        <Link href="/" aria-label="TAB Human Performance Center home" className="self-start">
          <Logo variant="horizontal-compact" tone="white" className="h-11 w-auto" decorative />
        </Link>
        <div className="max-w-md">
          <p className="text-display-lg font-[family-name:var(--font-serif)] !font-medium !tracking-normal">{siteConfig.brand.tagline}</p>
          <p className="text-label mt-5 text-white/90">{siteConfig.brand.philosophy}</p>
        </div>
      </div>
      <div className="flex items-center justify-center bg-bone px-5 py-12">
        <div className="w-full max-w-md">
          <Link href="/" aria-label="TAB Human Performance Center home" className="block lg:hidden">
            <Logo variant="stacked-compact" className="mx-auto h-36 w-auto" decorative />
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}

