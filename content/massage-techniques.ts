/**
 * Massage & Bodywork techniques (owner request 2026-10-06): the eight modalities from tabmassage.com's "Introduction to
 * Massage", rewritten in the new voice, plus manual lymphatic drainage, prenatal and sports massage.
 *
 * The words live in content/massage-techniques.json, edited in the content editor (/keystatic, proposed D-069) and
 * checked against content/schema.ts at build time. The page address stays here (a change needs a redirect).
 *
 * Copy rules: plain language, no diagnosis or treatment claims (guardrail 8, Step 15 §15.8): "often chosen for", never
 * "treats" or "cures" (e2e/guardrails.spec.ts checks). The owner confirmed TAB's training in all nine original techniques
 * (2026-10-06) and added prenatal and sports massage; TAB doesn't offer Swedish or relaxation massage as a service. A
 * technique added later starts as a draft with a review note (guardrail 10: never imply a credential that isn't held),
 * shown on previews only.
 */
import { PRESSURES, parseContent, techniquesContentSchema } from "./schema";
import data from "./massage-techniques.json";

const content = parseContent(techniquesContentSchema, data, "content/massage-techniques.json");

export type TechniqueGroup = (typeof content.groups)[number]["key"];
/** How the work usually feels, lightest first. The page shows it as words and a four-step scale. */
export type Pressure = (typeof PRESSURES)[number];
export const PRESSURE_LEVELS: Pressure[] = [...PRESSURES];

export type Technique = Omit<(typeof content.techniques)[number], "aka" | "goodToKnow" | "reviewNote"> & { aka?: string; goodToKnow?: string; reviewNote?: string };

export const techniqueGroups = content.groups;
export const techniques: Technique[] = content.techniques.map((t) => ({ ...t, aka: t.aka || undefined, goodToKnow: t.goodToKnow || undefined, reviewNote: t.reviewNote || undefined }));

export const techniquesPage = {
  path: "/services/massage-bodywork/techniques",
  title: content.title,
  metaDescription: content.metaDescription,
  lead: content.lead,
  notSure: content.notSure,
};

export const techniquesBySlug = (slug: string) => techniques.find((t) => t.slug === slug);
