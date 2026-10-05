/**
 * Page copy from Step 15 (messaging), Step 16 (homepage story and IA), and Step 14 (TAB Method).
 * Items marked `draft` are temporary and need owner or practitioner review.
 * Structured for migration into Payload globals and collections (D-036).
 */

export const home = {
  hero: {
    // Brand Foundation v2 §10 (homepage H1) and the approved board's website mock-up (docs/source/batch-5).
    headline: "More capacity for what matters.",
    body: "Integrated care and coaching to help you build strength, resilience and the capacity to live fully.",
    image: { src: "/brand/hero-mountain.webp", width: 2000, height: 768 },
  },
  coreIdea: {
    headline: "Your wellbeing doesn’t happen in pieces. Neither should your care.",
    body: "Physical comfort affects how you move. Strength shapes confidence and independence. Stress, recovery, habits, responsibilities, and major life changes all influence one another. That’s why TAB brings five areas of support into one connected approach.",
  },
  pillars: {
    headline: "Support for how you feel, move, live, and grow.",
    closing:
      "Start with the service that fits what you need today. As your needs evolve, TAB can help connect other areas of support when they genuinely make sense for your goals.",
  },
  method: {
    headline: "Start where you are. Transform. Adapt. Balance.",
    body: "A journey with direction, not a finish line.",
  },
  personalization: {
    headline: "Built around people, not programs.",
    points: [
      { title: "We listen first.", body: "Understand before recommending." },
      { title: "We personalize.", body: "Your plan should fit your life." },
      { title: "We adapt.", body: "When your needs change, the approach can change too." },
    ],
  },
  guided: {
    headline: "You don’t need to know exactly where to start.",
    body: "Tell us what you’re experiencing, what you want to change, or what you hope to be able to do. We’ll help you find the right starting point.",
  },
  trust: {
    headline: "Real people. Personal progress.",
    body: "TAB has supported clients in our community since 2008. The name is new; the commitment to personalized care is not.",
  },
  resources: {
    headline: "Wellness shouldn’t stop when your appointment ends.",
    body: "Guides, education, and practical resources to help you understand, prepare, practice, and keep moving forward.",
  },
  closing: { headline: "Start where you are.", body: "Wherever you’re starting, we begin by listening." },
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

export const method = {
  intro:
    "The TAB Method is a personalized, whole-person approach that helps you understand where you are, change what limits you, build the ability to respond to what life asks, and balance effort and recovery so your progress lasts.",
  statement:
    "Start where you are. Transform what limits you. Adapt to what life asks. Balance what sustains you.",
  steps: [
    {
      key: "start",
      name: "Start Where You Are",
      short: "No judgment. No predefined version of wellness.",
      body: "You don’t need to arrive knowing which service you need or what a complete wellness plan looks like. We begin with where you are, what you need, and where you want to go.",
    },
    {
      key: "transform",
      name: "Transform",
      short: "Change what limits you.",
      body: "Transform doesn’t mean a dramatic makeover. It means changing the patterns, capabilities or conditions that are holding you back: reducing persistent tension, returning to strength training, establishing workable routines, or simply feeling more like yourself again.",
    },
    {
      key: "adapt",
      name: "Adapt",
      short: "Respond to what life asks.",
      body: "Once change is underway, we build your ability to respond to stress, challenge, change and new demands without breaking down or starting over: training that progresses with you, recovery that keeps up, and more than one TAB service when it makes sense.",
    },
    {
      key: "balance",
      name: "Balance",
      short: "Sustain what matters.",
      body: "Balance isn’t a finish line. It’s recalibrating between effort and recovery, doing and resting, structure and flexibility, with the ownership to know what works for you, how to maintain progress, and when extra support is useful.",
    },
    {
      key: "evolve",
      name: "Evolve",
      short: "Keep evolving as life changes.",
      body: "Needs change. A strength client sets a new goal; a massage client becomes pregnant; a coaching client changes careers. When life changes, we begin again from where you are now.",
    },
  ],
  principles: [
    { title: "Start with listening", body: "Understand before recommending." },
    { title: "Personalize the experience", body: "You should never feel processed through a formula." },
    { title: "Explain the why", body: "You understand recommendations and stay an active participant." },
    { title: "Look at the whole person", body: "Physical wellbeing, habits, responsibilities, and goals are connected." },
    { title: "Stay within scope", body: "We know when another qualified professional is better positioned to help." },
    { title: "Measure what matters to you", body: "Not every meaningful outcome shows up on a scale or a stopwatch." },
    { title: "Build ownership, not dependence", body: "The goal is confidence, capability, and agency." },
  ],
};

export const about = {
  headline: "Wellness is personal. We think your care should be too.",
  sections: [
    {
      title: "Why TAB exists",
      body: [
        "TAB Human Performance Center was created around a simple belief: wellbeing is rarely about just one thing.",
        "How you feel physically can affect how you move. How you move can influence confidence, independence, and quality of life. Stress, routines, responsibilities, recovery, relationships, and major life changes all shape how well you’re able to care for yourself.",
      ],
    },
    {
      title: "Start where you are",
      body: [
        "You don’t need to arrive with everything figured out. You may know exactly what you need, or simply that something needs to change.",
        "Wherever you’re starting, we begin by listening—to understand what matters to you, what your life actually looks like, and what meaningful progress would feel like from your perspective.",
      ],
    },
    {
      title: "Transform. Adapt. Balance.",
      body: [
        "TAB stands for Transform. Adapt. Balance. It’s more than our name—it reflects the way we approach wellness. The process has direction, but there isn’t a finish line.",
      ],
    },
    {
      title: "Built around people, not programs",
      body: [
        "Every person comes to TAB with a different body, history, lifestyle, set of responsibilities, and goals. Our role isn’t to fit you into a predefined version of wellness; it’s to help you understand what works for you.",
        "That may mean one TAB service or several over time. When connections make sense, we help bring the pieces together. When they don’t, we don’t force them.",
      ],
    },
    {
      title: "Support that builds ownership",
      body: [
        "Success at TAB isn’t measured by how dependent you become on us. Sometimes that means continuing regular support; sometimes it means maintenance, independence, or knowing TAB is here when your needs change again.",
      ],
    },
  ],
  story: {
    headline: "From TAB Massage & Fitness to TAB Human Performance Center",
    draft: true,
    body: [
      "TAB began in December 2008 as TAB Massage & Fitness, with a holistic approach that already brought together massage, personal training, and coaching.",
      "Over the years, the work grew beyond “massage and fitness.” TAB Human Performance Center is the name for what TAB has become: a personalized, whole-person approach built on five connected service pillars.",
      "[PLACEHOLDER: founder story, milestones, and the people behind TAB — to be written with the owner.]",
    ],
  },
  team: {
    headline: "The people behind TAB",
    draft: true,
    members: [
      {
        name: "[Practitioner name]",
        role: "Founder and practitioner",
        credentials: "[Credentials and certifications]",
        bio: "[PLACEHOLDER: a short bio covering 20+ years of experience across massage, strength training, and coaching.]",
        services: ["massage-bodywork", "personal-strength-training", "womens-wellness-coaching", "holistic-life-coaching"],
        photo: null as string | null,
      },
    ],
  },
};

export const faqs: { q: string; a: string; draft?: boolean }[] = [
  { q: "Do I need to know which service I need?", a: "No. Use Start Where You Are to tell us what you’re looking for, and we’ll help you find the right starting point." },
  { q: "Can I just book a massage?", a: "Absolutely. Start with the service that fits what you need today. Services connect only when that genuinely supports your goals." },
  { q: "Is TAB Human Performance Center a new company?", a: "No. TAB Massage & Fitness is now TAB Human Performance Center. Your appointments, history, and relationships stay the same." },
  { q: "Do you offer virtual services?", a: "Yes. Personal strength training and both coaching services are available virtually as well as in person.", draft: true },
  { q: "How do I book, reschedule, or cancel?", a: "Use Book to schedule online. Existing clients can manage appointments through My TAB.", draft: true },
  { q: "Does TAB provide medical care?", a: "No. TAB provides massage, strength training, and coaching within professional scope, and works alongside your healthcare providers.", draft: false },
];

export const resourceClusters = [
  { title: "Massage and recovery", topics: ["Your first massage", "Training recovery", "Prenatal comfort", "Lymphatic drainage basics"] },
  { title: "Strength and capability", topics: ["Beginner strength", "Healthy aging", "Balance and stability", "Building confidence in the gym"] },
  { title: "Women’s wellness", topics: ["Sustainable routines", "Sleep and recovery", "Perimenopause and menopause", "Health advocacy"] },
  { title: "Life and alignment", topics: ["Priorities", "Boundaries", "Overwhelm", "Values and decisions"] },
  { title: "The TAB Method", topics: ["Starting where you are", "Defining progress", "Maintenance and independence"] },
];

/** Legal pages are placeholders pending professional review (D-042 legal review; Step 16.9 Phase 0). */
export const legal = {
  privacy: {
    title: "Privacy",
    draft: true,
    body: [
      "[PLACEHOLDER: privacy policy pending legal review. It must cover website analytics (Plausible, including anonymous counts of Start form starts and submissions); form submissions, which are emailed to TAB and to the submitter and, once My TAB launches, stored indefinitely and linked to the client record; spam protection on the forms (Cloudflare Turnstile); and, when My TAB launches, the handling of sensitive and health-related client information.]",
    ],
  },
  terms: { title: "Terms", draft: true, body: ["[PLACEHOLDER: website terms of use pending legal review.]"] },
  accessibility: {
    title: "Accessibility",
    draft: false,
    body: [
      "TAB Human Performance Center is committed to an accessible website and client portal. We design and test to the Web Content Accessibility Guidelines (WCAG) 2.2, level AA.",
      "If anything on this site is hard to use, email us and we’ll help and fix it.",
    ],
  },
  policies: {
    title: "Client policies",
    draft: true,
    sections: { cancellation: "Cancellations, late arrivals and illness", scope: "Scope of our services" },
    body: [
      "[PLACEHOLDER: cancellation, late arrival, illness, and scope-of-practice policies. Carry over the current TAB cancellation policy, updated for the new name.]",
    ],
  },
};
