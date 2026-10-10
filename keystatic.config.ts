import { collection, config, fields, singleton } from "@keystatic/core";
import { images } from "./content/images";
import { COUNTS, GROUPS, L, METHOD_STAGES, PAGE_LIMITS as P, PILLAR_KEYS, PRESSURES, RESOURCE_LIMITS as R, RESOURCE_LINK, SERVICE_KEYS, TONES } from "./content/schema";

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

/** Uploaded documents: kept outside public/ so an email-gated one can only be fetched with a signed link (lib/resources.ts). */
const FILES_DIR = "content/resource-files";
const FILES_PUBLIC_PATH = "/resource-files/";
const PILLAR_LABELS: Record<(typeof PILLAR_KEYS)[number], string> = {
  none: "None (general)", "massage-bodywork": "Massage & Bodywork", "personal-strength-training": "Functional Strength",
  "womens-wellness-coaching": "Women's Wellness", "integrated-nutrition": "Integrated Nutrition", "holistic-life-coaching": "Holistic Life Coaching",
};

/** The resource library (C35): one entry per link or document. Only "Published" entries appear on the live site. */
const resources = collection({
  label: "Resources",
  path: "content/resources/*",
  format: { data: "json" },
  slugField: "title",
  columns: ["status", "added"],
  schema: {
    title: fields.slug({ name: { label: "Title", description: `${R.title[0]} to ${R.title[1]} characters. Also sets the address, which stays the same if you rename it later.`, validation: { length: { min: R.title[0], max: R.title[1] } } } }),
    summary: text("One-line summary", R.summary, { multiline: true, description: "What it is and who it's for. No diagnosis or treatment claims." }),
    topic: fields.relationship({ label: "Topic", collection: "resourceTopics", validation: { isRequired: true } }),
    pillar: fields.select({ label: "Related service", options: PILLAR_KEYS.map((k) => ({ label: PILLAR_LABELS[k], value: k })), defaultValue: "none" }),
    kind: fields.conditional(
      fields.select({ label: "Kind", options: [{ label: "Link to another website", value: "link" }, { label: "Document TAB wrote (PDF upload)", value: "document" }], defaultValue: "link" }),
      {
        link: fields.object({
          url: fields.text({
            label: "Web address or page",
            description: "Another website (starting with https://), or a page on this site (starting with /, e.g. /services/massage-bodywork). Link to other organizations' material rather than uploading it.",
            validation: { length: { min: R.url[0], max: R.url[1] }, pattern: { regex: RESOURCE_LINK, message: "Start with https:// for another website, or / for a page on this site." } },
          }),
        }),
        document: fields.object({
          file: fields.file({ label: "PDF", description: "A PDF TAB wrote, up to 10 MB, exported with 'Tagged PDF' (accessible) turned on. Anyone can download a published document: never upload anything about a client.", directory: FILES_DIR, publicPath: FILES_PUBLIC_PATH, validation: { isRequired: true } }),
          requireEmail: fields.checkbox({ label: "Ask for an email address first", description: "The download link is emailed to them, and TAB gets a note of who asked.", defaultValue: true }),
        }),
      },
    ),
    status: fields.select({ label: "Status", description: "Drafts show on previews only.", options: [{ label: "Draft", value: "draft" }, { label: "Published", value: "published" }], defaultValue: "draft" }),
    added: fields.date({ label: "Date added", defaultValue: { kind: "today" }, validation: { isRequired: true } }),
  },
});

const resourceTopics = collection({
  label: "Resource topics",
  path: "content/resource-topics/*",
  format: { data: "json" },
  slugField: "title",
  schema: {
    title: fields.slug({ name: { label: "Topic", validation: { length: { min: R.topicTitle[0], max: R.topicTitle[1] } } } }),
    intro: text("Introduction", R.topicIntro, { multiline: true }),
    order: fields.integer({ label: "Order on the page", description: "1 comes first.", defaultValue: 10, validation: { min: 1, max: 99, isRequired: true } }),
    subjects: fields.array(
      fields.object({
        title: text("Subject", R.subject, { description: "As it appears in the topic's list, e.g. Your first massage." }),
        resource: fields.relationship({ label: "Opens this resource", description: "Choose the resource this subject opens: a document downloads, a link opens its page. The resource must be filed under this topic. Left empty, the subject opens this topic's published resource with the same title, or says Coming soon if there isn't one.", collection: "resources" }),
      }),
      { label: "Subjects", description: "The topic's list, in order. A published resource of this topic that no subject opens, and whose title matches none, is added at the end.", itemLabel: (p) => `${p.fields.title.value}${p.fields.resource.value ? " → linked" : " (not linked)"}`, validation: { length: { max: 12 } } },
    ),
  },
});

/** Home, the TAB Method and the About pages (C35): fixed layouts, every word editable. */
const json = { format: { data: "json" as const } };
const meta = text("Search description", P.metaDescription, { multiline: true, description: "What Google shows under the page title: 40 to 160 characters." });
const pair = (label: string) => fields.object({ headline: text("Headline", P.headline), body: text("Text", P.body, { multiline: true }) }, { label });
const titled = fields.object({ title: text("Title", P.short), body: text("Text", P.body, { multiline: true }) });
const STAGE_LABELS: Record<(typeof METHOD_STAGES)[number], string> = { start: "Start Where You Are", transform: "Transform", adapt: "Adapt", balance: "Balance", evolve: "Evolve" };

const home = singleton({
  label: "Home",
  path: "content/pages/home",
  ...json,
  schema: {
    metaDescription: meta,
    hero: pair("Hero (top of the page)"),
    coreIdea: fields.object({ headline: text("Headline", P.headline), body: text("Text", P.body, { multiline: true }), photo: photo("Photo") }, { label: "Human performance for real life" }),
    pillars: fields.object({ headline: text("Headline", P.headline), closing: text("Text under the services", P.body, { multiline: true }) }, { label: "The five services", description: "The service cards come from the service pages." }),
    method: pair("The TAB Method"),
    personalization: fields.object({ headline: text("Headline", P.headline), points: fields.array(titled, { label: "Three points", itemLabel: (p) => p.fields.title.value, validation: { length: { min: 3, max: 3 } } }) }, { label: "Built around people (olive band)" }),
    guided: pair("You don't need to know where to start"),
    trust: pair("Real people (the figures beside it come from the business settings)"),
    resources: pair("Resources teaser (also the Resources page heading)"),
    closing: pair("Closing call to action"),
  },
});

const tabMethod = singleton({
  label: "The TAB Method",
  path: "content/pages/tab-method",
  ...json,
  schema: {
    metaDescription: meta,
    intro: text("Introduction", P.body, { multiline: true }),
    stages: fields.object(Object.fromEntries(METHOD_STAGES.map((k) => [k, fields.object({ short: text("One-line summary", P.short), body: text("Text", P.body, { multiline: true }) }, { label: STAGE_LABELS[k], description: "The stage names are the brand and stay fixed." })])), { label: "Stages" }),
    principlesHeading: text("Principles heading", P.headline),
    principles: fields.array(titled, { label: "Principles", itemLabel: (p) => p.fields.title.value, validation: { length: { min: 3, max: 9 } } }),
    statement: text("Closing statement (quote)", P.body, { multiline: true }),
  },
});

const aboutPage = singleton({
  label: "About",
  path: "content/pages/about",
  ...json,
  schema: {
    headline: text("Headline", P.headline),
    metaDescription: meta,
    sections: fields.array(fields.object({
      title: text("Section heading", P.sectionTitle),
      paragraphs: fields.array(text("Paragraph", P.paragraph, { multiline: true }), { label: "Paragraphs", itemLabel: (p) => p.value.slice(0, 60), validation: { length: { min: 1, max: 6 } } }),
    }), { label: "Sections", itemLabel: (p) => p.fields.title.value, validation: { length: { min: 1, max: 10 } } }),
  },
});

const ourStory = singleton({
  label: "Our Story",
  path: "content/pages/our-story",
  ...json,
  schema: {
    headline: text("Headline", P.headline),
    metaDescription: meta,
    draft: fields.checkbox({ label: "Draft: not yet approved", description: "Listed on the launch checklist until unticked.", defaultValue: true }),
    paragraphs: fields.array(text("Paragraph", P.paragraph, { multiline: true }), { label: "Paragraphs", itemLabel: (p) => p.value.slice(0, 60), validation: { length: { min: 1, max: 16 } } }),
  },
});

const team = singleton({
  label: "Our Team",
  path: "content/pages/team",
  ...json,
  schema: {
    headline: text("Headline", P.headline),
    metaDescription: meta,
    draft: fields.checkbox({ label: "Draft: not yet approved", description: "Listed on the launch checklist until unticked.", defaultValue: true }),
    members: fields.array(fields.object({
      name: text("Name", P.name),
      role: text("Role", P.role),
      credentials: text("Credentials and certifications", P.credentials, { description: "Exactly as held. Shown only once confirmed below." }),
      credentialsConfirmed: fields.checkbox({ label: "Credentials confirmed", description: "Tick only once you've checked them. Until then they stay off the live site.", defaultValue: false }),
      bio: text("Short bio", P.bio, { multiline: true }),
      services: fields.multiselect({ label: "Services", options: SERVICE_KEYS.map((k) => ({ label: PILLAR_LABELS[k], value: k })) }),
      photo: fields.image({ label: "Photo", description: "A JPEG, PNG or WebP up to 5 MB, square works best. Only with the person's permission.", directory: "public/images/team", publicPath: "/images/team/" }),
      photoAlt: text("Photo description", [0, P.alt[1]], { description: "Required with a photo: what it shows, for people who can't see it (e.g. 'Matthew in the studio, smiling')." }),
    }), { label: "People", itemLabel: (p) => p.fields.name.value, validation: { length: { min: 1, max: 12 } } }),
  },
});

export default config({
  storage: keystaticMode === "cloud" ? { kind: "cloud", branchPrefix: "content/" } : { kind: "local" },
  ...(keystaticMode === "cloud" ? { cloud: { project: keystaticProject } } : {}),
  ui: {
    brand: { name: "TAB Human Performance Center" },
    navigation: { "Service pages": ["massageBodywork", "functionalStrength", "womensWellness", "integratedNutrition", "holisticLifeCoaching"], Guides: ["massageTechniques"], Resources: ["resources", "resourceTopics"], Pages: ["home", "tabMethod", "aboutPage", "ourStory", "team"] },
  },
  collections: { resources, resourceTopics },
  singletons: {
    home, tabMethod, aboutPage, ourStory, team,
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
