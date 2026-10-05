import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";

/**
 * The logo is artwork, never live type (D-039; Step 18.4). Files in /public/brand are the approved redraw of the
 * TAB Human Performance Center board (owner baseline 2026-10-05, proposed D-061; sources in design/logo-redraw).
 * - horizontal: primary lockup with the philosophy line (Transform. Adapt. Balance.)
 * - horizontal-compact: horizontal without the philosophy line, for header sizes
 * - stacked: symbol above TAB with the descriptor beneath, for centred, formal moments
 * - stacked-compact: stacked without the philosophy line
 * - symbol: app icon, avatar and accent uses
 * `tone`: colour (flat, the master), white (reversed), graphite (one colour), sheen (the board's gradients, for large
 * digital uses such as the hero), dark (symbol for dark fields, linen lower form).
 */
type Variant = "horizontal" | "horizontal-compact" | "stacked" | "stacked-compact" | "symbol";
type Tone = "color" | "white" | "graphite" | "sheen" | "dark";

const ART: Record<Variant, { file: string; tones: Tone[]; width: number; height: number }> = {
  horizontal: { file: "logo-horizontal", tones: ["color", "white", "graphite", "sheen"], width: 670, height: 141 },
  "horizontal-compact": { file: "logo-horizontal-compact", tones: ["color", "white", "graphite"], width: 670, height: 132 },
  stacked: { file: "logo-stacked", tones: ["color", "white", "graphite"], width: 324, height: 403 },
  "stacked-compact": { file: "logo-stacked-compact", tones: ["color"], width: 324, height: 372 },
  symbol: { file: "symbol", tones: ["color", "white", "graphite", "sheen", "dark"], width: 146, height: 128 },
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
      <Logo className="h-11 w-auto" decorative priority />
    </Link>
  );
}
