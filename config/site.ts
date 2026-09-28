/**
 * TAB Wellness Collective — site configuration.
 *
 * Everything the business may need to change without touching page code
 * lives here. Values marked `PLACEHOLDER` are temporary and must be replaced
 * before launch; `lib/placeholders.ts` lists every open item at build time.
 *
 * Secrets never go in this file — use environment variables (see .env.example).
 */

export const PLACEHOLDER = "__PLACEHOLDER__" as const;
type Maybe<T> = T | null;

/** Vercel deployment environment ("production" | "preview" | "development"); undefined when run locally. */
const deploymentEnv = process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.VERCEL_ENV;
export const isProductionDeployment = deploymentEnv === "production";

/** Where My TAB reads data. Stays "mock" until the D-042 go-live gates in docs/PHASE2.md are met. */
const portalDataSource = "mock" as "mock" | "supabase";

/**
 * Owner ruling 2026-09-28 ("Production URL"): demo My TAB and TAB Practice on the production deployment. Safe only
 * while production is private (Vercel login on every *.vercel.app URL, no custom domain, indexing off): demo mode has
 * no real login and one in-memory store shared by every visitor. Turn this off before a custom domain is attached;
 * the launch gate (lib/placeholders.ts) refuses to build a launch while it is on.
 */
const portalDemoOnProduction = true;

export const siteConfig = {
  brand: {
    name: "TAB Wellness Collective", // D-020, D-038: always the full name in metadata and listings
    shortName: "TAB", // conversational only; never "TAB Wellness"
    philosophy: "Transform. Align. Become.",
    tagline: "Whole-person wellness for stronger bodies and fuller lives.",
    legacyName: "TAB Massage & Fitness",
    foundedYear: 2008, // Step 17: documented history since December 2008
    /** Step 19: "formerly TAB Massage & Fitness" shown for 90–180 days after launch. */
    transitionNotice: {
      enabled: true,
      text: "TAB Massage & Fitness is now TAB Wellness Collective. Same commitment. A broader expression of what TAB has become.",
      hideAfter: "2027-06-30", // ISO date; notice disappears automatically after this date
    },
  },

  /**
   * Service area for titles and structured data (NFR-003: "[Service] in [Location]"). Business context: Brighton/Howell
   * area, Michigan. Revisit once the studio address is set.
   */
  location: {
    label: "Brighton & Howell, MI",
    areaServed: ["Brighton, MI", "Howell, MI"],
  },

  contact: {
    email: "info@tabwellnesscollective.com",
    phone: null as Maybe<string>, // PLACEHOLDER: e.g. "(517) 555-0100"
    address: {
      street: null as Maybe<string>, // PLACEHOLDER
      city: null as Maybe<string>, // PLACEHOLDER
      region: "MI",
      postalCode: null as Maybe<string>, // PLACEHOLDER
      country: "US",
    },
    mapUrl: null as Maybe<string>, // PLACEHOLDER: Google Maps link
    hours: [
      // PLACEHOLDER: replace with real hours. `closed: true` hides times.
      { days: "Monday – Friday", open: "PLACEHOLDER", close: "PLACEHOLDER", closed: false },
      { days: "Saturday", open: "PLACEHOLDER", close: "PLACEHOLDER", closed: false },
      { days: "Sunday", open: "", close: "", closed: true },
    ] as Array<{ days: string; open: string; close: string; closed: boolean }>,
  },

  /** D-003: Timely stays the scheduling system of record; the site links out. */
  booking: {
    // The live Timely account (tabmassageandfitness), taken from the legacy site's booking embed on 2026-09-28.
    timelyBookingUrl: "https://bookings.gettimely.com/tabmassageandfitness/book" as Maybe<string>,
    timelyClientLoginUrl: null as Maybe<string>, // PLACEHOLDER: Timely Client Login link (until set, Client Login opens the booking page)
    /** Optional per-service booking deep links (Timely service/category URLs). */
    serviceBookingUrls: {
      "massage-bodywork": null as Maybe<string>,
      "personal-strength-training": null as Maybe<string>,
      "womens-wellness-coaching": null as Maybe<string>,
      "holistic-life-coaching": null as Maybe<string>,
    },
    giftCardsUrl: null as Maybe<string>, // PLACEHOLDER: shown in footer when set
  },

  /** Step 19 renames existing accounts in place; update handles at cutover. */
  social: {
    facebook: "https://www.facebook.com/tabmassage/" as Maybe<string>,
    instagram: "https://www.instagram.com/tab.massage/" as Maybe<string>,
    youtube: null as Maybe<string>,
    linkedin: null as Maybe<string>,
  },

  forms: {
    /** Start Where You Are submissions are emailed here (owner direction, 2026-09-27). */
    startRecipient: "info@tabwellnesscollective.com",
    contactRecipient: "info@tabwellnesscollective.com",
    /** Must be a verified sender domain in Resend. */
    fromAddress: "TAB Wellness Collective <no-reply@tabwellnesscollective.com>",
    /**
     * Owner ruling 2026-09-28 (DIV-05, proposed D-058): the whole form is saved in the database, kept
     * indefinitely, and linked to the client record. It is written only while the portal runs on Supabase,
     * i.e. once the D-042 go-live gate (CLAUDE.md guardrail 4) is met; until then it's email only.
     */
    storeSubmissions: portalDataSource === "supabase",
    /** The submitter also receives a copy of what they sent (owner ruling 2026-09-28). */
    sendSubmitterCopy: true,
  },

  /** D-046: Plausible on public pages; ad pixels only when paid ads start, never in My TAB. */
  analytics: {
    plausibleDomain: null as Maybe<string>, // e.g. "tabwellnesscollective.com"
    metaPixelId: null as Maybe<string>, // set only when paid ads begin (D-015)
    googleTagManagerId: null as Maybe<string>, // set with Timely Innovate upgrade (D-015)
  },

  features: {
    resources: true, // Resources section and nav item
    events: false, // Events page and nav item
    team: true, // Our Team page
    testimonials: false, // keep false until real, consented testimonials exist
  },

  /**
   * My TAB client portal (Phase 2, D-034).
   * - enabled=false: /my-tab shows an interim page linking to Timely Client Login (Step 19.14).
   * - enabled=true + dataSource="mock": full portal UI with demo data, no login (preview review only).
   * - enabled=true + dataSource="supabase": authenticated portal backed by Supabase.
   *   Real client data only once the D-042 gate is met (CLAUDE.md guardrail 4; HIPAA does not apply, proposed D-060).
   * Demo mode has no real login and one in-memory store shared by every visitor, so production enables it only while
   * `demoOnProduction` is set (see above); otherwise production shows the Timely Client Login page instead.
   */
  portal: {
    enabled: portalDataSource === "supabase" || !isProductionDeployment || portalDemoOnProduction,
    dataSource: portalDataSource,
    demoOnProduction: portalDemoOnProduction,
    showPracticeWorkspace: true,
  },
} as const;

export type SiteConfig = typeof siteConfig;

// `||`, not `??`: a variable defined but left blank in Vercel must fall back too, or `new URL("")` breaks the build.
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") || "https://www.tabwellnesscollective.com";

/**
 * Search indexing is off until launch (NFR-009, Step 19.3). Set NEXT_PUBLIC_ALLOW_INDEXING=true only on
 * the production domain at cutover; every other deployment, including the *.vercel.app production
 * alias, stays noindex.
 */
export const indexingAllowed = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";
