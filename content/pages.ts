/**
 * Page copy in the TAB Human Performance Center voice: Brand Foundation v2 (purpose, philosophy, positioning, voice),
 * the Step 13 pillar definitions and the Step 19 transition wording in docs/source/batch-5, on the Step 14–16 page
 * structure. Brand guardrail (BF v2 §12): wellness is no longer the master category, and human performance is never
 * reduced to athletic output. `npm run test:brand` fails on retired names, the old philosophy and wrong pillar counts.
 * Items marked `draft` are temporary and need owner or practitioner review.
 * Structured for migration into Payload globals and collections (D-036).
 */

import { siteConfig } from "@/config/site";
import {
  METHOD_STAGES, aboutContentSchema, homeContentSchema, methodContentSchema, parseContent, storyContentSchema, teamContentSchema,
} from "@/content/schema";
import homeJson from "./pages/home.json";
import methodJson from "./pages/tab-method.json";
import aboutJson from "./pages/about.json";
import storyJson from "./pages/our-story.json";
import teamJson from "./pages/team.json";

const PHONE = siteConfig.contact.phone ?? siteConfig.contact.email;

// Home, the TAB Method and the About pages are edited in the content editor (C35): content/pages/*.json, checked by
// content/schema.ts here at build time. The shapes below are what the pages read.
const homeContent = parseContent(homeContentSchema, homeJson, "content/pages/home.json");
export const home = {
  ...homeContent,
  // Brand Foundation v2 §10 (homepage H1) and the approved board's website mock-up (docs/source/batch-5); fixed artwork.
  hero: { ...homeContent.hero, image: { src: "/brand/hero-mountain.webp", width: 2000, height: 768 } },
};

/** Start Where You Are (GS-001): the S14 §14.4.1 client-facing introduction. */
export const start = {
  eyebrow: "Get started",
  headline: "Start where you are.",
  intro:
    "You don’t need to know exactly which TAB service is right for you. Tell us a little about what brings you here, what you’d like to change, and how we can best connect with you.",
  metaDescription: "You don’t need to know which TAB service is right for you. Tell us where you are and we’ll suggest the right starting point.",
  // GS-006: discovery is never a mandatory gate.
  bookDirect: { prompt: "Already know what you’d like?", label: "Book directly" },
};

const methodContent = parseContent(methodContentSchema, methodJson, "content/pages/tab-method.json");
/** The stage names are the brand (Transform. Adapt. Balance.) and stay fixed; their words are editable. */
const STAGE_NAMES: Record<(typeof METHOD_STAGES)[number], string> = { start: "Start Where You Are", transform: "Transform", adapt: "Adapt", balance: "Balance", evolve: "Evolve" };
export const method = {
  ...methodContent,
  steps: METHOD_STAGES.map((key) => ({ key, name: STAGE_NAMES[key], ...methodContent.stages[key] })),
};

const aboutContent = parseContent(aboutContentSchema, aboutJson, "content/pages/about.json");
const story = parseContent(storyContentSchema, storyJson, "content/pages/our-story.json");
const team = parseContent(teamContentSchema, teamJson, "content/pages/team.json");
export const about = {
  ...aboutContent,
  sections: aboutContent.sections.map((x) => ({ title: x.title, body: x.paragraphs })),
  story: { ...story, body: story.paragraphs },
  team,
};

export const faqs: { q: string; a: string; draft?: boolean }[] = [
  { q: "Do I need to know which service I need?", a: "No. Use Start Where You Are to tell us what you’re looking for, and we’ll help you find the right starting point." },
  { q: "Can I just book a massage?", a: "Absolutely. Start with the service that fits what you need today. Services connect only when that genuinely supports your goals." },
  { q: "Is TAB Human Performance Center a new company?", a: "No. TAB Massage & Fitness is becoming TAB Human Performance Center. Your appointments, history and relationships stay the same." },
  { q: "What does “human performance” mean at TAB?", a: "Not maximum output or athletic performance. It’s how well you function, adapt, recover, connect and act in your real life, and building more capacity for what matters to you." },
  { q: "Do I have to use more than one service?", a: "No. You can use one service for as long as it helps. We connect other pillars only when that genuinely supports your goals." },
  { q: "Do you offer virtual services?", a: "Yes. Functional Strength, Women’s Wellness, Integrated Nutrition and Holistic Life Coaching are available virtually as well as in person. Massage & Bodywork is in person.", draft: true },
  { q: "How do I book, reschedule, or cancel?", a: "Use Book to schedule online. Existing clients can manage appointments through My TAB.", draft: true },
  { q: "Does TAB provide medical care?", a: "No. TAB provides massage and bodywork, strength training, nutrition coaching and life coaching within professional scope, and works alongside your healthcare providers.", draft: false },
];

/** Accessibility statement and client policies. The privacy policy and terms live in content/legal.ts (A7). */
export const legal = {
  accessibility: {
    title: "Accessibility",
    draft: false,
    body: [
      "TAB Human Performance Center is committed to an accessible website and client portal. We design and test to the Web Content Accessibility Guidelines (WCAG) 2.2, level AA.",
      "If anything on this site is hard to use, email us and we’ll help and fix it.",
    ],
  },
  /**
   * Client policies (A30): the owner's TAB Massage & Fitness cancellation, arrival and gratuity policies (sent
   * 2026-10-06), reworded for TAB Human Performance Center with the site's service names, then extended by the owner
   * the same day to every pillar and to no-shows. The terms are the owner's; the wording is ours. The phone number comes from config/site.ts.
   */
  policies: {
    title: "Client policies",
    draft: false,
    intro: [
      "Your time matters, and so does the time we set aside for you. We keep a full, carefully organized schedule so every client gets the attention they came for. These policies keep it fair for everyone. Thank you for helping us honor them.",
    ],
    sections: [
      {
        id: "cancellation",
        heading: "Cancelling or rescheduling",
        body: [
          "These policies apply to every session: Massage & Bodywork, Functional Strength, Women’s Wellness, Integrated Nutrition and Holistic Life Coaching, in person or virtual.",
          {
            list: [
              "You can cancel or reschedule without a fee if you give us at least 24 hours’ notice.",
              "With less than 24 hours’ notice, including on the day of your appointment, the full price of the scheduled session is charged.",
              "If you miss your appointment without letting us know, the full price of the session is charged.",
              "A prepaid session, including one from a package or program, may be forfeited for a late cancellation or a missed appointment.",
              "Can’t make it? You’re welcome to send someone in your place. We keep a waitlist and will do our best to fill your time; if we can’t, we’ll ask you to cover it.",
              `To cancel or reschedule, please call us at ${PHONE}. We can’t accept cancellations by email or social media.`,
            ],
          },
        ],
      },
      {
        id: "arrival",
        heading: "Arriving for your session",
        body: [
          {
            list: [
              "Returning clients: please arrive 10 minutes before your appointment so you get your full session.",
              "New clients: please arrive at least 15 minutes early to complete your intake paperwork, so none of your hands-on time is lost.",
              "Virtual sessions: please be ready a few minutes before your start time.",
            ],
          },
        ],
      },
      {
        id: "gratuity",
        heading: "Gratuity",
        body: [
          "Gratuity is never expected, but always appreciated as a way to thank your practitioner for a great experience. If you’d like to leave one:",
          {
            list: [
              "When you pay with a gift card, or use a prepaid massage from our Monthly Massage Program, gratuity can’t be added to a card payment. Please bring cash or a check to give directly to your practitioner.",
            ],
          },
        ],
      },
    ] as { id: string; heading: string; body: (string | { list: string[] })[] }[],
    scopeHeading: "Scope of our services",
  },

};
