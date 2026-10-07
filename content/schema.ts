import { z } from "zod";
import { images, type ImageKey } from "./images";

/**
 * The editable content's rules, in one place (proposed D-069, backlog C31). The content editor (keystatic.config.ts)
 * shows these limits as people type; the build checks every content file against the same schemas, so a file edited
 * any other way can't publish if it breaks them (CI runs the build on every change). docs/CONTENT-GUIDE.md lists the
 * blocks and what each may hold.
 *
 * Section tones: content blocks sit on Bone or Linen. Deep Olive is the TAB Method band and Graphite the closing
 * call to action; both are fixed by the page template, so white text only ever lands where guardrail 3 allows it.
 */

export const TONES = ["bone", "linen"] as const;
export type Tone = (typeof TONES)[number];

export const L = {
  name: [3, 60], shortName: [2, 24], headline: [10, 120], summary: [20, 200], description: [40, 600], metaDescription: [40, 160],
  ctaLabel: [3, 40], scopeNote: [40, 600], heading: [2, 60], lead: [0, 300], paragraph: [1, 700], intro: [0, 300],
  cardTitle: [2, 60], cardBody: [10, 260], stepTitle: [2, 40], stepBody: [10, 260], question: [5, 160], answer: [10, 900], method: [10, 160],
  techName: [3, 60], techAka: [0, 60], techText: [10, 400], techItem: [5, 140], techNote: [0, 300], groupTitle: [5, 80], groupLead: [10, 240],
} as const satisfies Record<string, readonly [number, number]>;
export const COUNTS = { paragraphs: [0, 6], cards: [1, 12], steps: [1, 6], faqs: [1, 20], sections: [1, 12], oftenChosenFor: [1, 5] } as const;

export const IMAGE_KEYS = Object.keys(images) as [ImageKey, ...ImageKey[]];
const text = ([min, max]: readonly [number, number]) => z.string().trim().min(min).max(max);
// The editor saves an empty text field by leaving its key out of the file, so an optional field may be missing.
const optionalText = ([, max]: readonly [number, number]) => z.string().trim().max(max).default("");
const list = <T extends z.ZodTypeAny>(item: T, [min, max]: readonly [number, number]) => z.array(item).min(min).max(max);
const tone = z.enum(TONES);
const cta = z.object({ label: text(L.ctaLabel), kind: z.enum(["book", "start"]) });

/** The block library: the kinds of section a service page is built from. A new kind is a design-lane change. */
export const blockSchema = z.discriminatedUnion("discriminant", [
  z.object({ discriminant: z.literal("textPhoto"), value: z.object({ tone, heading: text(L.heading), lead: optionalText(L.lead), paragraphs: list(text(L.paragraph), COUNTS.paragraphs), photo: z.enum(IMAGE_KEYS) }) }),
  z.object({ discriminant: z.literal("cards"), value: z.object({ tone, heading: optionalText(L.heading), intro: optionalText(L.intro), cards: list(z.object({ title: text(L.cardTitle), body: text(L.cardBody) }), COUNTS.cards) }) }),
  z.object({ discriminant: z.literal("techniqueIndex"), value: z.object({ tone }) }),
  z.object({ discriminant: z.literal("method"), value: z.object({ transform: text(L.method), adapt: text(L.method), balance: text(L.method), quote: text(L.method) }) }),
  z.object({ discriminant: z.literal("steps"), value: z.object({ tone, heading: text(L.heading), steps: list(z.object({ title: text(L.stepTitle), body: text(L.stepBody) }), COUNTS.steps) }) }),
  z.object({ discriminant: z.literal("faq"), value: z.object({ tone, heading: text(L.heading), items: list(z.object({ q: text(L.question), a: text(L.answer), draft: z.boolean() }), COUNTS.faqs) }) }),
]);
export type Block = z.infer<typeof blockSchema>;
export type BlockKind = Block["discriminant"];

export const serviceContentSchema = z.object({
  name: text(L.name), shortName: text(L.shortName), headline: text(L.headline), summary: text(L.summary), description: text(L.description),
  metaDescription: text(L.metaDescription), primaryCta: cta, secondaryCta: cta, heroPhoto: z.enum(IMAGE_KEYS), scopeNote: text(L.scopeNote),
  sections: list(blockSchema, COUNTS.sections),
}).superRefine((s, ctx) => {
  // One TAB Method band and at most one FAQ per page; the techniques index belongs to Massage & Bodywork only (checked in services.ts).
  const count = (k: BlockKind) => s.sections.filter((b) => b.discriminant === k).length;
  if (count("method") > 1) ctx.addIssue({ code: "custom", message: "A page has at most one TAB Method band." });
  if (count("faq") > 1) ctx.addIssue({ code: "custom", message: "A page has at most one Questions section." });
});
export type ServiceContent = z.infer<typeof serviceContentSchema>;

export const PRESSURES = ["Very light", "Gentle", "Moderate", "Firm"] as const;
export const GROUPS = ["release", "move", "calm"] as const;
export const techniquesContentSchema = z.object({
  title: text(L.heading), metaDescription: text(L.metaDescription), lead: text(L.description),
  notSure: z.object({ title: text(L.heading), body: text(L.description) }),
  groups: z.array(z.object({ key: z.enum(GROUPS), title: text(L.groupTitle), lead: text(L.groupLead) })).length(GROUPS.length),
  techniques: list(z.object({
    slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).max(40), name: text(L.techName), aka: optionalText(L.techAka), group: z.enum(GROUPS), pressure: z.enum(PRESSURES),
    summary: text(L.techText), feelsLike: text(L.techText), oftenChosenFor: list(text(L.techItem), COUNTS.oftenChosenFor), goodToKnow: optionalText(L.techText),
    draft: z.boolean(), reviewNote: optionalText(L.techNote),
  }), [1, 20]),
}).superRefine((t, ctx) => {
  const slugs = t.techniques.map((x) => x.slug);
  if (new Set(slugs).size !== slugs.length) ctx.addIssue({ code: "custom", message: "Each technique needs its own address (slug)." });
});

/** Parses a content file, naming the file and the field in the error, so a failed check says what to fix. */
export function parseContent<T>(schema: z.ZodType<T, z.ZodTypeDef, unknown>, data: unknown, file: string): T {
  const r = schema.safeParse(data);
  if (r.success) return r.data;
  const issues = r.error.issues.map((i) => `  ${i.path.join(".") || "(file)"}: ${i.message}`).join("\n");
  throw new Error(`${file} doesn't meet the content rules:\n${issues}`);
}

/**
 * The resource library (C35, owner request 2026-10-07): links to other sites and documents TAB has written (PDFs,
 * uploaded in the editor). A document can ask for an email address first; the download link then arrives by email
 * (lib/resources.ts). Topics group the page; a topic with nothing published shows its planned subjects instead.
 */
export const SERVICE_KEYS = ["massage-bodywork", "personal-strength-training", "womens-wellness-coaching", "integrated-nutrition", "holistic-life-coaching"] as const;
export const PILLAR_KEYS = ["none", ...SERVICE_KEYS] as const;
export const RESOURCE_LIMITS = { title: [3, 90], summary: [10, 220], topicTitle: [3, 60], topicIntro: [0, 240], comingSoon: [3, 60], url: [12, 500] } as const satisfies Record<string, readonly [number, number]>;
/** Largest document the editor may upload (bytes). Larger files belong in a separate file store (backlog). */
export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
export const RESOURCE_SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const resourceTopicSchema = z.object({
  title: text(RESOURCE_LIMITS.topicTitle),
  intro: optionalText(RESOURCE_LIMITS.topicIntro),
  order: z.number().int().min(1).max(99),
  comingSoon: z.array(text(RESOURCE_LIMITS.comingSoon)).max(8).default([]),
});
export type ResourceTopicContent = z.infer<typeof resourceTopicSchema>;

export const resourceSchema = z.object({
  title: text(RESOURCE_LIMITS.title),
  summary: text(RESOURCE_LIMITS.summary),
  topic: z.string().regex(RESOURCE_SLUG, "Choose a topic."),
  pillar: z.enum(PILLAR_KEYS).default("none"),
  kind: z.discriminatedUnion("discriminant", [
    z.object({ discriminant: z.literal("link"), value: z.object({ url: z.string().trim().url().max(RESOURCE_LIMITS.url[1]).refine((u) => u.startsWith("https://"), "Links must start with https://") }) }),
    z.object({ discriminant: z.literal("document"), value: z.object({ file: z.string().min(1, "Upload the PDF."), requireEmail: z.boolean().default(true) }) }),
  ]),
  status: z.enum(["draft", "published"]).default("draft"),
  added: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose the date it was added."),
});
export type ResourceContent = z.infer<typeof resourceSchema>;

/**
 * The fixed-layout pages (C35, owner request 2026-10-07): every word and some photos are editable; the order of the
 * sections, the stage names of the TAB Method and the business facts (founding year, pillar count) are not, so the
 * conversion path and the brand stay as designed. The About pages are lists of sections editors can add to.
 */
const PL = {
  headline: [3, 90], body: [10, 600], short: [5, 80], metaDescription: [40, 160], sectionTitle: [2, 80], paragraph: [1, 900],
  name: [2, 80], role: [2, 80], credentials: [0, 160], bio: [0, 900], alt: [5, 160],
} as const satisfies Record<string, readonly [number, number]>;
export const PAGE_LIMITS = PL;
const pair = z.object({ headline: text(PL.headline), body: text(PL.body) });
const titled = z.object({ title: text(PL.short), body: text(PL.body) });

export const homeContentSchema = z.object({
  metaDescription: text(PL.metaDescription),
  hero: pair,
  coreIdea: pair.extend({ photo: z.enum(IMAGE_KEYS) }),
  pillars: z.object({ headline: text(PL.headline), closing: text(PL.body) }),
  method: pair,
  personalization: z.object({ headline: text(PL.headline), points: z.array(titled).length(3) }),
  guided: pair,
  trust: pair,
  resources: pair,
  closing: pair,
});
export type HomeContent = z.infer<typeof homeContentSchema>;

export const METHOD_STAGES = ["start", "transform", "adapt", "balance", "evolve"] as const;
export const methodContentSchema = z.object({
  metaDescription: text(PL.metaDescription),
  intro: text(PL.body),
  statement: text(PL.body),
  stages: z.object(Object.fromEntries(METHOD_STAGES.map((k) => [k, z.object({ short: text(PL.short), body: text(PL.body) })])) as Record<(typeof METHOD_STAGES)[number], z.ZodObject<{ short: z.ZodString; body: z.ZodString }>>),
  principlesHeading: text(PL.headline),
  principles: list(titled, [3, 9]),
});
export type MethodContent = z.infer<typeof methodContentSchema>;

export const aboutContentSchema = z.object({
  headline: text(PL.headline),
  metaDescription: text(PL.metaDescription),
  sections: list(z.object({ title: text(PL.sectionTitle), paragraphs: list(text(PL.paragraph), [1, 6]) }), [1, 10]),
});
export type AboutContent = z.infer<typeof aboutContentSchema>;

export const storyContentSchema = z.object({
  headline: text(PL.headline),
  metaDescription: text(PL.metaDescription),
  draft: z.boolean(),
  paragraphs: list(text(PL.paragraph), [1, 16]),
});
export type StoryContent = z.infer<typeof storyContentSchema>;

export const teamContentSchema = z.object({
  headline: text(PL.headline),
  metaDescription: text(PL.metaDescription),
  draft: z.boolean(),
  members: list(z.object({
    name: text(PL.name),
    role: text(PL.role),
    credentials: optionalText(PL.credentials),
    // Guardrail 10: credentials show only once the owner has confirmed them.
    credentialsConfirmed: z.boolean().default(false),
    bio: optionalText(PL.bio),
    services: z.array(z.enum(SERVICE_KEYS)).max(5).default([]),
    photo: z.string().startsWith("/images/team/").optional().nullable(),
    photoAlt: optionalText(PL.alt),
  }).superRefine((m, ctx) => {
    if (m.photo && m.photoAlt.length < PL.alt[0]) ctx.addIssue({ code: "custom", path: ["photoAlt"], message: "Describe the photo for people who can't see it (5 to 160 characters)." });
  }), [1, 12]),
});
export type TeamContent = z.infer<typeof teamContentSchema>;
