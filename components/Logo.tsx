import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";

/**
 * The logo is artwork, never live type (tokens §11, D-039). Files are the vector package in /public/brand
 * (originals in docs/source/batch-4/vector-logo-package). Step 18 §18.2 logo family:
 * - horizontal: header/portal workhorse with the philosophy line
 * - horizontal-compact: horizontal without the philosophy line, for small header sizes
 * - stacked: primary signature for centred, formal first-impression moments
 * - symbol: icon, avatar and accent uses
 * - wordmark: TAB only, once the full brand is established
 * `tone` selects the reversed (white) or one-colour charcoal version; colour is the default (Step 18 §18.9).
 */
type Variant = "horizontal" | "horizontal-compact" | "stacked" | "symbol" | "wordmark";
type Tone = "color" | "white" | "charcoal";

const ART: Record<Variant, { file: string; tones: Tone[]; width: number; height: number }> = {
  horizontal: { file: "logo-horizontal", tones: ["color", "white", "charcoal"], width: 1800, height: 520 },
  "horizontal-compact": { file: "logo-horizontal-compact", tones: ["color"], width: 1700, height: 420 },
  stacked: { file: "logo-stacked", tones: ["color", "white", "charcoal"], width: 1200, height: 1380 },
  symbol: { file: "symbol", tones: ["color", "white", "charcoal"], width: 1130, height: 958 },
  wordmark: { file: "wordmark", tones: ["color"], width: 854, height: 317 },
};

export function Logo({
  variant = "horizontal-compact",
  tone = "color",
  className,
  decorative = false,
  priority = false,
}: {
  variant?: Variant;
  tone?: Tone;
  className?: string;
  /** Empty alt text when a parent link or heading already names the brand. */
  decorative?: boolean;
  priority?: boolean;
}) {
  const art = ART[variant];
  const suffix = tone !== "color" && art.tones.includes(tone) ? `-${tone}` : "";
  return (
    <Image
      src={`/brand/${art.file}${suffix}.svg`}
      alt={decorative ? "" : siteConfig.brand.name}
      width={art.width}
      height={art.height}
      className={className}
      priority={priority}
      unoptimized
    />
  );
}

export function HomeLogoLink() {
  return (
    <Link href="/" className="flex items-center" aria-label={`${siteConfig.brand.name} home`}>
      <Logo className="h-12 w-auto lg:h-14" decorative priority />
    </Link>
  );
}
