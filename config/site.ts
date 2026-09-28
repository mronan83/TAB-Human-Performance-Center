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
    timelyBookingUrl: null as Maybe<string>, // PLACEHOLDER: Timely online booking link
    timelyClientLoginUrl: null as Maybe<string>, // PLACEHOLDER: Timely Client Login link
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
   * - enabled=true + dataSource="mock": full portal UI with demo data, no login (for review).
   * - enabled=true + dataSource="supabase": authenticated portal backed by Supabase.
   *   Do not store client health data until the D-042 infrastructure (HIPAA tier, BAAs) is live.
   */
  portal: {
    enabled: true,
    dataSource: "mock" as "mock" | "supabase",
    showPracticeWorkspace: true,
  },
} as const;

export type SiteConfig = typeof siteConfig;

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://www.tabwellnesscollective.com";
