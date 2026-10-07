/**
 * Service pillars: the five pillars of TAB Human Performance Center (proposed D-065; Step 13 in docs/source/batch-5),
 * headlines and CTAs (Step 15.6/15.7), page modules (Step 16.4).
 *
 * Two halves (proposed D-069, backlog C31):
 * - The frame, here in code: `slug` is the internal key (database enums, portal plans, booking links) and never
 *   changes; `path` is the public URL segment (a rename needs a redirect, config/redirects.ts); `icon` is brand artwork.
 *   These change only through the design lane.
 * - The words, photos and sections, in content/services/<slug>.json, edited in the content editor (/keystatic). The
 *   build checks each file against content/schema.ts, so a file that breaks the rules can't publish.
 * FAQ answers marked `draft` are temporary copy for practitioner review (guardrail 10).
 */

import { parseContent, serviceContentSchema, type Block, type ServiceContent } from "./schema";
import type { ImageKey } from "./images";
import massageBodywork from "./services/massage-bodywork.json";
import functionalStrength from "./services/personal-strength-training.json";
import womensWellness from "./services/womens-wellness-coaching.json";
import integratedNutrition from "./services/integrated-nutrition.json";
import holisticLifeCoaching from "./services/holistic-life-coaching.json";

export type ServiceSlug =
  | "massage-bodywork"
  | "personal-strength-training"
  | "womens-wellness-coaching"
  | "integrated-nutrition"
  | "holistic-life-coaching";

export type Faq = { q: string; a: string; draft?: boolean };

export type Service = ServiceContent & {
  slug: ServiceSlug;
  path: string;
  icon: string;
  /** From the page's Questions section (for structured data and the launch checklist). */
  faqs: Faq[];
  /** Whether the page shows the techniques index (Massage & Bodywork: content/massage-techniques.json). */
  techniques: boolean;
  photos: { hero: ImageKey };
};

const FRAME: { slug: ServiceSlug; path: string; icon: string; data: unknown }[] = [
  { slug: "massage-bodywork", path: "massage-bodywork", icon: "/brand/icons/massage-bodywork.svg", data: massageBodywork },
  { slug: "personal-strength-training", path: "functional-strength", icon: "/brand/icons/functional-strength.svg", data: functionalStrength },
  { slug: "womens-wellness-coaching", path: "womens-wellness", icon: "/brand/icons/womens-wellness.svg", data: womensWellness },
  { slug: "integrated-nutrition", path: "integrated-nutrition", icon: "/brand/icons/integrated-nutrition.svg", data: integratedNutrition },
  { slug: "holistic-life-coaching", path: "holistic-life-coaching", icon: "/brand/icons/holistic-life-coaching.svg", data: holisticLifeCoaching },
];

const faqsOf = (sections: Block[]): Faq[] => sections.flatMap((b) => (b.discriminant === "faq" ? b.value.items : []));

export const services: Service[] = FRAME.map(({ data, ...frame }) => {
  const content = parseContent(serviceContentSchema, data, `content/services/${frame.slug}.json`);
  const techniques = content.sections.some((b) => b.discriminant === "techniqueIndex");
  // The techniques guide exists for Massage & Bodywork only (its page and the index both read content/massage-techniques.json).
  if (techniques && frame.slug !== "massage-bodywork") throw new Error(`content/services/${frame.slug}.json: only Massage & Bodywork has a techniques index.`);
  return { ...content, ...frame, faqs: faqsOf(content.sections), techniques, photos: { hero: content.heroPhoto } };
});

export const getService = (slug: string) => services.find((s) => s.slug === slug);
/** Find a service by its public URL segment (`/services/[path]`). */
export const getServiceByPath = (path: string) => services.find((s) => s.path === path);
export const serviceHref = (s: Service) => `/services/${s.path}`;
