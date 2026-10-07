import { config, fields, singleton } from "@keystatic/core";
import { images } from "./content/images";
import { COUNTS, GROUPS, L, PRESSURES, TONES } from "./content/schema";

/**
 * The content editor (proposed D-069 and D-071, backlog C31), at /keystatic. It edits the content files in this
 * repository; every save is a commit on a `content/…` branch, which opens a change request, gets a preview and runs
 * every check before anything can publish (docs/CONTENT-GUIDE.md). The field limits come from content/schema.ts, the
 * same rules the build enforces.
 *
 * Storage: Keystatic Cloud (editors sign in with a Keystatic account, no GitHub account) once the owner has created the
 * Keystatic Cloud project and set NEXT_PUBLIC_KEYSTATIC_CLOUD_PROJECT (backlog A31). On a developer's machine it edits
 * the local files instead. Elsewhere, until the project exists, /keystatic says the editor isn't connected yet.
 */

export const keystaticProject = process.env.NEXT_PUBLIC_KEYSTATIC_CLOUD_PROJECT?.trim() || "";
export const keystaticMode: "cloud" | "local" | "off" = keystaticProject ? "cloud" : process.env.NODE_ENV === "development" ? "local" : "off";

const len = ([min, max]: readonly [number, number]) => ({ length: { min, max } });
const text = (label: string, limits: readonly [number, number], opts: { multiline?: boolean; description?: string } = {}) =>
  fields.text({ label, description: opts.description ?? (limits[0] > 0 ? `${limits[0]} to ${limits[1]} characters.` : `Up to ${limits[1]} characters. Optional.`), multiline: opts.multiline, validation: len(limits) });
const tone = fields.select({
  label: "Background",
  description: "Bone (off-white) or Linen (warm beige). Sections next to each other on the same background read as one band.",
  options: TONES.map((t) => ({ label: t === "bone" ? "Bone" : "Linen", value: t })),
  defaultValue: "bone",
});
const photo = (label: string) => fields.select({
  label,
  description: "Choose from the photo library. New photos are added through a design request.",
  options: Object.entries(images).map(([value, img]) => ({ label: `${img.subject} (#${img.n})`, value })),
  defaultValue: "trailSunrise",
});
const cta = (label: string) => fields.object({
  label: text("Button text", L.ctaLabel),
  kind: fields.select({ label: "Goes to", options: [{ label: "Booking (this service's Book link)", value: "book" }, { label: "Start Where You Are", value: "start" }], defaultValue: "book" }),
}, { label });

/** The block library. Each block's look is fixed; editors choose which blocks, their order and their words. */
const sections = fields.blocks({
  textPhoto: {
    label: "Text and photo",
    itemLabel: (p) => p.fields.heading.value || "Text and photo",
    schema: fields.object({
      tone, heading: text("Heading", L.heading), lead: text("Lead (larger first paragraph)", L.lead, { multiline: true }),
      paragraphs: fields.array(text("Paragraph", L.paragraph, { multiline: true }), { label: "Paragraphs", itemLabel: (p) => p.value.slice(0, 60), validation: len(COUNTS.paragraphs) }),
      photo: photo("Photo"),
    }),
  },
  cards: {
    label: "Card grid",
    itemLabel: (p) => p.fields.heading.value || `Cards (${p.fields.cards.elements.length})`,
    schema: fields.object({
      tone, heading: text("Heading", [0, L.heading[1]]), intro: text("Introduction", L.intro, { multiline: true }),
      cards: fields.array(fields.object({ title: text("Title", L.cardTitle), body: text("Text", L.cardBody, { multiline: true }) }), { label: "Cards", itemLabel: (p) => p.fields.title.value, validation: len(COUNTS.cards) }),
    }),
  },
  techniqueIndex: {
    label: "Techniques index (Massage & Bodywork only)",
    schema: fields.object({ tone }),
  },
  method: {
    label: "TAB Method band (Transform, Adapt, Balance)",
    schema: fields.object({
      transform: text("Transform", L.method, { multiline: true }), adapt: text("Adapt", L.method, { multiline: true }),
      balance: text("Balance", L.method, { multiline: true }), quote: text("Quote", L.method, { multiline: true }),
    }),
  },
  steps: {
    label: "Numbered steps (What to expect)",
    itemLabel: (p) => p.fields.heading.value || "Steps",
    schema: fields.object({
      tone, heading: text("Heading", L.heading),
      steps: fields.array(fields.object({ title: text("Title", L.stepTitle), body: text("Text", L.stepBody, { multiline: true }) }), { label: "Steps", itemLabel: (p) => p.fields.title.value, validation: len(COUNTS.steps) }),
    }),
  },
  faq: {
    label: "Questions (FAQ)",
    itemLabel: (p) => p.fields.heading.value || "Questions",
    schema: fields.object({
      tone, heading: text("Heading", L.heading),
      items: fields.array(fields.object({
        q: text("Question", L.question), a: text("Answer", L.answer, { multiline: true }),
        draft: fields.checkbox({ label: "Draft: waiting for review", description: "Drafts are listed on the launch checklist and left out of search results' FAQ data.", defaultValue: true }),
      }), { label: "Questions", itemLabel: (p) => p.fields.q.value, validation: len(COUNTS.faqs) }),
    }),
  },
}, { label: "Sections", description: "The page's sections, top to bottom, between the hero and the related services. Drag to reorder.", validation: len(COUNTS.sections) });

const service = (label: string, slug: string) => singleton({
  label,
  path: `content/services/${slug}`,
  format: { data: "json" },
  schema: {
    name: text("Service name", L.name, { description: "Shown in menus and headings. Changing it changes it everywhere." }),
    shortName: text("Short name", L.shortName), headline: text("Hero headline", L.headline, { multiline: true }),
    summary: text("One-line summary (cards)", L.summary, { multiline: true }), description: text("Hero description", L.description, { multiline: true }),
    metaDescription: text("Search description", L.metaDescription, { multiline: true, description: "What Google shows under the page title: 40 to 160 characters." }),
    primaryCta: cta("Main button"), secondaryCta: cta("Second button"), heroPhoto: photo("Hero photo"),
    scopeNote: text("Scope of care note", L.scopeNote, { multiline: true, description: "Required on every service page: what the service is and isn't. No diagnosis or treatment claims." }),
    sections,
  },
});

export default config({
  storage: keystaticMode === "cloud" ? { kind: "cloud", branchPrefix: "content/" } : { kind: "local" },
  ...(keystaticMode === "cloud" ? { cloud: { project: keystaticProject } } : {}),
  ui: {
    brand: { name: "TAB Human Performance Center" },
    navigation: { "Service pages": ["massageBodywork", "functionalStrength", "womensWellness", "integratedNutrition", "holisticLifeCoaching"], Guides: ["massageTechniques"] },
  },
  singletons: {
    massageBodywork: service("Massage & Bodywork", "massage-bodywork"),
    functionalStrength: service("Functional Strength", "personal-strength-training"),
    womensWellness: service("Women's Wellness", "womens-wellness-coaching"),
    integratedNutrition: service("Integrated Nutrition", "integrated-nutrition"),
    holisticLifeCoaching: service("Holistic Life Coaching", "holistic-life-coaching"),
    massageTechniques: singleton({
      label: "Massage techniques",
      path: "content/massage-techniques",
      format: { data: "json" },
      schema: {
        title: text("Page title", L.heading), metaDescription: text("Search description", L.metaDescription, { multiline: true }),
        lead: text("Introduction", L.description, { multiline: true }),
        notSure: fields.object({ title: text("Heading", L.heading), body: text("Text", L.description, { multiline: true }) }, { label: "“You don't need to choose” panel" }),
        groups: fields.array(fields.object({
          key: fields.select({ label: "Group", options: GROUPS.map((g) => ({ label: g, value: g })), defaultValue: "release" }),
          title: text("Title", L.groupTitle), lead: text("Introduction", L.groupLead, { multiline: true }),
        }), { label: "Groups", itemLabel: (p) => p.fields.title.value, validation: len([GROUPS.length, GROUPS.length]) }),
        techniques: fields.array(fields.object({
          slug: fields.text({ label: "Address (slug)", description: "Lowercase words joined by hyphens, e.g. deep-tissue. Links point here, so change it only with a design request.", validation: { length: { min: 3, max: 40 }, pattern: { regex: /^[a-z0-9]+(-[a-z0-9]+)*$/, message: "Lowercase letters, numbers and hyphens only." } } }),
          name: text("Name", L.techName), aka: text("Also known as", L.techAka),
          group: fields.select({ label: "Group", options: GROUPS.map((g) => ({ label: g, value: g })), defaultValue: "release" }),
          pressure: fields.select({ label: "Pressure", options: PRESSURES.map((p) => ({ label: p, value: p })), defaultValue: "Moderate" }),
          summary: text("What it is", L.techText, { multiline: true }), feelsLike: text("What it feels like", L.techText, { multiline: true }),
          oftenChosenFor: fields.array(text("Reason", L.techItem), { label: "Often chosen for", itemLabel: (p) => p.value, validation: len(COUNTS.oftenChosenFor) }),
          goodToKnow: text("Good to know", [0, L.techText[1]], { multiline: true }),
          draft: fields.checkbox({ label: "Draft: TAB's training not yet confirmed", defaultValue: true }),
          reviewNote: text("Review note (previews only)", L.techNote, { multiline: true }),
        }), { label: "Techniques", itemLabel: (p) => p.fields.name.value, validation: len([1, 20]) }),
      },
    }),
  },
});
