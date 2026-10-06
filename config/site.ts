/**
 * TAB Human Performance Center: site configuration.
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
 * Demo My TAB and TAB Practice on the production deployment (owner ruling 2026-09-28), now off: the switch-over runbook
 * (docs/runbooks/switch-over.md, C1) turns it off before the custom domain is attached, because demo mode has no real
 * login and one in-memory store shared by every visitor. Previews keep the demo. The owner settings page (C23,
 * proposed D-067) opens or closes the real portal (Off / Live); demo stays a preview-only build mode.
 */
const portalDemoOnProduction = false;

export const siteConfig = {
  brand: {
    name: "TAB Human Performance Center", // proposed D-063 (replaces D-038): always the full name in metadata and listings
    shortName: "TAB", // conversational only; never shortened or abbreviated otherwise in public copy
    philosophy: "Transform. Adapt. Balance.", // proposed D-064: TAB stands for Transform. Adapt. Balance.
    tagline: "Build the capacity to live fully.", // Brand Foundation v2 §10: primary purpose line
    categoryLine: "Human performance for real life.",
    legacyName: "TAB Massage & Fitness",
    foundedYear: 2008, // Step 17: documented history since December 2008
    /** Step 19.3 transitional messaging, shown for 90–180 days after launch. */
    transitionNotice: {
      enabled: true,
      text: "TAB Massage & Fitness is becoming TAB Human Performance Center.",
      hideAfter: "2027-06-30", // ISO date; notice disappears automatically after this date
    },
  },

  /**
   * Service area. `label` is the visible wording (owner, 2026-10-06, A12: "Serving Livingston County"), shown in the
   * footer and emails. Structured data names the county and its two towns, and page descriptions keep "Brighton and
   * Howell, MI", because people search by town (ASM-006).
   */
  location: {
    label: "Serving Livingston County",
    county: "Livingston County, MI",
    areaServed: ["Brighton, MI", "Howell, MI"],
  },

  contact: {
    email: "info@tabhumanperformance.com",
    phone: "(810) 844-1283" as Maybe<string>, // owner, 2026-10-06 (A6)
    address: {
      street: "7487 Grand River Ave" as Maybe<string>,
      city: "Brighton" as Maybe<string>,
      region: "MI",
      postalCode: "48114" as Maybe<string>,
      country: "US",
    },
    mapUrl: "https://www.google.com/maps/search/?api=1&query=7487+Grand+River+Ave%2C+Brighton%2C+MI+48114" as Maybe<string>,
    /** Owner, 2026-10-06 (A6). 24-hour times; the site shows them as "10 AM – 4 PM" and groups matching days. */
    hours: [
      { days: "Monday", open: "10:00", close: "16:00", closed: false },
      { days: "Tuesday", open: "10:00", close: "16:00", closed: false },
      { days: "Wednesday", open: "11:00", close: "18:00", closed: false },
      { days: "Thursday", open: "", close: "", closed: true },
      { days: "Friday", open: "09:00", close: "16:00", closed: false },
      { days: "Saturday", open: "", close: "", closed: true },
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
      "integrated-nutrition": null as Maybe<string>,
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
    startRecipient: "info@tabhumanperformance.com",
    contactRecipient: "info@tabhumanperformance.com",
    /** Must be a verified sender domain in Resend. */
    fromAddress: "TAB Human Performance Center <no-reply@tabhumanperformance.com>", // verified in Resend (D-005); domain decision proposed D-066
    /**
     * Owner ruling 2026-09-28 (DIV-05, proposed D-058): the whole form is saved in the database, kept
     * indefinitely, and linked to the client record. It is written only while the portal runs on Supabase,
     * i.e. once the D-042 go-live gate (CLAUDE.md guardrail 4) is met; until then it's email only.
     */
    storeSubmissions: portalDataSource === "supabase",
    /** The submitter also receives a copy of what they sent (owner ruling 2026-09-28). */
    sendSubmitterCopy: true,
  },

  /**
   * D-046 / proposed D-057: privacy-friendly counts on public pages; ad pixels only when paid ads start, never in My TAB.
   * Owner ruling 2026-10-06 (A4): no Plausible ("I'm not paying for a bunch of micro services"); Vercel Web Analytics
   * instead, included in the Vercel Pro plan, cookieless, served from our own domain. Production deployments only.
   */
  analytics: {
    webAnalytics: isProductionDeployment,
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
    /**
     * Real staff sign-in (Supabase, two-step verification) instead of the demo chooser (C23, proposed D-067): wherever
     * client data is real, and on production whenever Supabase is configured, so the owner can reach TAB Practice →
     * Settings while client data stays off. Staff accounts and settings are not client data (guardrail 4).
     */
    realStaffSignIn: portalDataSource === "supabase" || (isProductionDeployment && !!process.env.NEXT_PUBLIC_SUPABASE_URL),
  },
} as const;

export type SiteConfig = typeof siteConfig;

// `||`, not `??`: a variable defined but left blank in Vercel must fall back too, or `new URL("")` breaks the build.
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") || "https://www.tabhumanperformance.com"; // proposed D-066

/**
 * Search indexing is off until launch (NFR-009, Step 19.3). Set NEXT_PUBLIC_ALLOW_INDEXING=true only on
 * the production domain at cutover; every other deployment, including the *.vercel.app production
 * alias, stays noindex.
 */
export const indexingAllowed = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";
