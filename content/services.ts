/**
 * Service pillars: the five pillars of TAB Human Performance Center (proposed D-065; Step 13 in docs/source/batch-5),
 * headlines and CTAs (Step 15.6/15.7), page modules (Step 16.4). `slug` is the internal key (database enums, portal
 * plans, booking links) and never changes; `path` is the public URL segment (renamed pillars redirect, config/redirects.ts).
 * This file is structured to map 1:1 onto a Payload `services` collection (D-036) later.
 * FAQ answers marked `draft: true` are temporary copy for practitioner review.
 */

export type ServiceSlug =
  | "massage-bodywork"
  | "personal-strength-training"
  | "womens-wellness-coaching"
  | "integrated-nutrition"
  | "holistic-life-coaching";

export type Faq = { q: string; a: string; draft?: boolean };

export type Service = {
  slug: ServiceSlug;
  path: string;
  name: string;
  shortName: string;
  headline: string;
  summary: string; // one-line summary for cards (Step 13 at a glance)
  description: string; // client-facing description (Step 13)
  metaDescription: string; // search snippet, under ~155 characters (S16 §16.4)
  whoItsFor: string[];
  gains: string[];
  approachLead: string;
  approach: string[];
  /** Step 13 "Transform / Adapt / Balance lens" for this pillar. */
  method: { transform: string; adapt: string; balance: string };
  anchor: string;
  focusAreas?: { title: string; body: string }[];
  whatToExpect: { title: string; body: string }[];
  scopeNote: string;
  faqs: Faq[];
  primaryCta: { label: string; kind: "book" | "start" };
  secondaryCta: { label: string; kind: "book" | "start" };
  icon: string;
};

export const services: Service[] = [
  {
    slug: "massage-bodywork",
    path: "massage-bodywork",
    name: "Massage & Bodywork",
    metaDescription: "Personalized massage and bodywork in Brighton and Howell, MI: relaxation, recovery, prenatal and lymphatic care, adapted to how your body feels.",
    shortName: "Massage",
    headline: "Care for how your body feels, moves, and recovers.",
    summary:
      "Comfort, mobility, recovery, relaxation, circulation, and supportive body care across a wide range of needs and life stages.",
    description:
      "Personalized care for how your body feels, moves, and recovers. From relaxation and everyday tension to prenatal massage, training recovery, post-surgical support, manual lymphatic drainage, and comfort-focused care during chronic illness, each session is adapted to your individual needs, circumstances, and goals.",
    whoItsFor: [
      "Everyday tension, soreness, stress, and restricted movement",
      "Exercise and strength-training recovery",
      "Pregnancy and prenatal comfort",
      "Post-surgical recovery, when appropriate and medically cleared",
      "Chronic illness comfort and supportive care",
      "Lymphatic support and manual lymphatic drainage",
      "Mobility and movement limitations",
      "General relaxation, restoration, and body maintenance",
    ],
    gains: [
      "Reduced muscular tension and physical stress",
      "Greater comfort and ease of movement",
      "Support for recovery from activity, pregnancy, surgery, or other physical demands",
      "Improved relaxation and body awareness",
      "Support for healthy lymphatic movement and circulation",
      "A dedicated space for rest, recovery, and restoration",
    ],
    approachLead:
      "Massage and bodywork at TAB are personalized around the individual—not just the appointment type.",
    approach: [
      "We consider how you feel, move, recover, and function, along with your current health circumstances, goals, and stage of life.",
      "Sessions may range from relaxation and therapeutic bodywork to prenatal massage, recovery-focused work, manual lymphatic drainage, and supportive massage for people managing chronic health conditions.",
    ],
    method: {
      transform: "Address tension, restrictions and recovery needs.",
      adapt: "Improve the body’s ability to respond and recover.",
      balance: "Recalibrate effort, restoration and physical demand.",
    },
    anchor: "Restore capacity so the body has more room to move, recover and respond.",
    focusAreas: [
      { title: "Relaxation and everyday tension", body: "Unwind stress and ease the tension that builds up in daily life." },
      { title: "Training recovery", body: "Support recovery from strength training, sport, and physically demanding work." },
      { title: "Prenatal and postpartum", body: "Comfort-focused care adapted to pregnancy and the months after." },
      { title: "Post-surgical support", body: "Gentle, appropriate care when you have medical clearance to begin." },
      { title: "Manual lymphatic drainage", body: "Light, specialized technique to support healthy lymphatic movement." },
      { title: "Chronic illness comfort", body: "Supportive care designed around changing health needs and energy." },
    ],
    whatToExpect: [
      { title: "Before", body: "A short intake covers what brings you in, relevant health information, and your preferences for pressure and focus." },
      { title: "During", body: "Your session is adapted to how you feel today. You can adjust pressure, positioning, or focus at any time." },
      { title: "After", body: "We close with what changed, what to notice, and what might support you next." },
    ],
    scopeNote:
      "When medical circumstances are involved, services are provided within the appropriate scope of practice and may require medical clearance or coordination with your healthcare team.",
    faqs: [
      { q: "Is this my first massage? What should I expect?", a: "We’ll start with a brief conversation about what brings you in and any preferences. You stay in control of pressure and comfort throughout, and you can ask questions at any time.", draft: true },
      { q: "Can I get a massage while pregnant?", a: "Yes. Prenatal massage is adapted for comfort and safety at each stage of pregnancy. Let us know how far along you are when you book.", draft: true },
      { q: "When is medical clearance needed?", a: "After recent surgery, during some treatments, or with certain health conditions, we may ask for clearance from your healthcare provider before your session.", draft: true },
      { q: "How often should I book?", a: "It depends on your goals. We’ll suggest a rhythm that fits what you’re working on and your schedule—never more than you need.", draft: true },
    ],
    primaryCta: { label: "Book Massage & Bodywork", kind: "book" },
    secondaryCta: { label: "Find the Right Starting Point", kind: "start" },
    icon: "/brand/icons/massage-bodywork.svg",
  },
  {
    slug: "personal-strength-training",
    path: "functional-strength",
    name: "Functional Strength",
    metaDescription: "Functional strength training in Brighton and Howell, MI, or virtually, built around your abilities, goals and everyday life.",
    shortName: "Strength",
    headline: "Build strength for the way you want to live.",
    summary:
      "Individualized strength, movement, confidence, physical capability, and sustainable training for everyday life.",
    description:
      "Individualized strength training based on your abilities, goals, experience, and lifestyle—not a one-size-fits-all workout. Whether you’re new to strength training, returning to exercise, working toward greater mobility and independence, or simply wanting to feel stronger and more capable, TAB builds a progressive approach around you.",
    whoItsFor: [
      "Building strength and physical confidence",
      "Beginning strength training in a supportive, non-intimidating environment",
      "Returning to regular exercise after time away",
      "Improving balance, stability, mobility, and coordination",
      "Maintaining strength and independence with age",
      "Supporting recreational, athletic, or outdoor activities",
      "Progressing safely after rehabilitation, injury, or surgery when cleared",
    ],
    gains: [
      "Greater overall strength",
      "Improved movement quality and physical confidence",
      "Better balance, stability, coordination, and mobility",
      "Increased capacity for everyday activities",
      "A clearer understanding of how to train effectively",
      "Sustainable exercise habits and measurable progress toward your goals",
    ],
    approachLead: "Functional strength training at TAB starts with the person, not the workout.",
    approach: [
      "We consider where you are today, what you want your body to be capable of, what gets in the way, and what kind of training realistically fits your life.",
      "Programs are individualized and progressively adapted as strength, confidence, movement quality, and goals change—especially for people who don’t identify as “gym people.”",
    ],
    method: {
      transform: "Build strength, movement skill and confidence.",
      adapt: "Progressively respond to changing loads and demands.",
      balance: "Match challenge with recovery and sustainable progression.",
    },
    anchor: "Build strength that transfers to real life.",
    focusAreas: [
      { title: "New to strength", body: "A supportive start with the fundamentals, at your pace." },
      { title: "Returning after time away", body: "Rebuild capacity and confidence without starting from zero." },
      { title: "Healthy aging", body: "Strength, balance, and stability for independence over time." },
      { title: "Return to activity", body: "Progress back toward the sports and activities you love, when cleared." },
    ],
    whatToExpect: [
      { title: "Assessment", body: "We look at your current strength, movement, history, and goals—no judgment, no fitness test theatrics." },
      { title: "Your plan", body: "A progressive program that may include resistance, functional movement, mobility, stability, balance, and recovery." },
      { title: "Progression", body: "We adjust as you get stronger and as your goals and life change." },
    ],
    scopeNote:
      "When an injury, surgery, or medical condition affects training, services remain within professional scope and may require clearance or collaboration with your healthcare or rehabilitation providers.",
    faqs: [
      { q: "Do I need experience?", a: "No. Training starts from where you are today, whether that’s brand new or returning after years away.", draft: true },
      { q: "Is virtual training available?", a: "Yes. Training can be delivered in person or virtually, with a plan built around your space and equipment.", draft: true },
      { q: "What if I have an injury or recent surgery?", a: "We’ll ask about it during intake and may request clearance from your provider. Training is adapted to what’s appropriate for you.", draft: true },
      { q: "How often will we train?", a: "We’ll recommend a frequency based on your goals and schedule, including what you can do on your own between sessions.", draft: true },
    ],
    primaryCta: { label: "Schedule a Strength Consultation", kind: "book" },
    secondaryCta: { label: "Find Your Starting Point", kind: "start" },
    icon: "/brand/icons/functional-strength.svg",
  },
  {
    slug: "womens-wellness-coaching",
    path: "womens-wellness",
    name: "Women’s Wellness",
    metaDescription: "Women’s wellness coaching in Brighton and Howell, MI, or virtually: practical support for your health, habits, stress and life’s transitions.",
    shortName: "Women’s Wellness",
    headline: "Wellness that adapts to your life.",
    summary:
      "Personalized support for women’s health-supporting habits, life-stage changes, self-awareness, and practical wellbeing.",
    description:
      "Personalized support for navigating your health, habits, priorities, and changing needs through different stages of life. Whether you’re building more sustainable routines, managing stress, reconnecting with your wellbeing, or adapting to a major life transition, TAB provides a practical approach centered on you.",
    whoItsFor: [
      "Building sustainable wellness habits",
      "Improving energy, consistency, and daily routines",
      "Pregnancy and postpartum lifestyle support, within appropriate scope",
      "Perimenopause and menopause lifestyle support",
      "Stress management and recovery habits",
      "Sleep, movement, nourishment, and self-care routines",
      "Reconnecting with your own needs after caregiving or major life change",
      "Preparing questions and goals to discuss with licensed healthcare professionals",
    ],
    gains: [
      "Greater clarity around your wellness goals",
      "More realistic and sustainable daily routines",
      "Improved consistency with movement, recovery, sleep, and other health-supporting habits",
      "Greater confidence navigating life-stage changes",
      "Increased ability to advocate for your own needs",
      "A practical plan for turning intentions into everyday behaviors",
    ],
    approachLead:
      "Women’s Wellness at TAB starts with the whole person—not a checklist of symptoms, habits, or expectations.",
    approach: [
      "Coaching is collaborative rather than prescriptive: we help you identify what matters, understand what may be getting in the way, and create strategies that fit your real life.",
      "Needs shift through pregnancy, postpartum, perimenopause, menopause, caregiving years, and other transitions. Rather than treating those as problems to “fix,” coaching helps you adapt and make informed choices.",
    ],
    method: {
      transform: "Change patterns or routines that no longer fit.",
      adapt: "Respond to changing life stages and circumstances.",
      balance: "Recalibrate priorities, support, movement, recovery and self-care.",
    },
    anchor: "Build the capacity to adapt as life and the body change.",
    focusAreas: [
      { title: "Perimenopause and menopause", body: "Lifestyle support for energy, sleep, stress, movement, and routines through midlife change." },
      { title: "Pregnancy and postpartum", body: "Practical, supportive habits for a demanding season, within appropriate scope." },
      { title: "Caregiving and transitions", body: "Reconnect with your own needs when life has been about everyone else’s." },
      { title: "Health advocacy", body: "Organize your questions, goals, and observations for conversations with your healthcare team." },
    ],
    whatToExpect: [
      { title: "Conversation", body: "We start with your goals, routines, stressors, and stage of life." },
      { title: "Your plan", body: "Practical, realistic next steps—built together, not handed to you." },
      { title: "Check-ins", body: "Scheduled conversations plus support between sessions, virtual or in person." },
    ],
    scopeNote:
      "Coaching does not diagnose or treat medical conditions. Where symptoms, medications, or medical concerns are involved, diagnosis and treatment remain with qualified healthcare professionals.",
    faqs: [
      { q: "Is coaching a replacement for my doctor?", a: "No. Coaching works alongside your healthcare team. We focus on habits, routines, and practical change; diagnosis and treatment stay with licensed professionals.", draft: true },
      { q: "Can we work together virtually?", a: "Yes. Coaching is available virtually and in person.", draft: true },
      { q: "What does a coaching engagement look like?", a: "Most clients work with us over a defined period with scheduled sessions and support in between. We’ll recommend a structure that fits your goals.", draft: true },
    ],
    primaryCta: { label: "Schedule a Wellness Conversation", kind: "book" },
    secondaryCta: { label: "Find Your Starting Point", kind: "start" },
    icon: "/brand/icons/womens-wellness.svg",
  },
  {
    slug: "integrated-nutrition",
    path: "integrated-nutrition",
    name: "Integrated Nutrition",
    metaDescription: "Practical nutrition coaching in Brighton and Howell, MI, or virtually, connecting what you eat to energy, strength, recovery and real life.",
    shortName: "Nutrition",
    headline: "Nourishment that works with your real life.",
    summary:
      "Practical nutrition coaching that connects nourishment to energy, strength, recovery, stress and everyday life.",
    description:
      "Practical nutrition coaching that connects nourishment to energy, strength, recovery, stress, lifestyle, preferences and the realities of everyday life. The focus is workable routines, not rigid rules or another diet.",
    whoItsFor: [
      "People who want to eat in a way that supports strength and recovery",
      "People overwhelmed by conflicting nutrition advice",
      "People rebuilding consistency after restrictive or all-or-nothing approaches",
      "People seeking practical meal structure, fueling habits and better energy",
      "Clients whose training, recovery and nutrition need to work together",
    ],
    gains: [
      "More consistent nourishment",
      "Improved energy and recovery support",
      "Greater confidence with food decisions",
      "Practical meal and fueling routines",
      "Less all-or-nothing thinking",
      "Better integration with strength, recovery and life",
    ],
    approachLead: "Integrated Nutrition at TAB starts with how you actually live, train, recover and eat.",
    approach: [
      "We look at your routines, preferences, energy, training and recovery together, then build fueling habits that fit your life rather than handing you a rigid plan.",
      "Because it sits alongside strength, massage and coaching at TAB, nutrition can be coordinated with the rest of your support when that genuinely helps.",
    ],
    method: {
      transform: "Replace unhelpful food patterns with workable routines.",
      adapt: "Adjust fueling to training, stress, life stage and changing demands.",
      balance: "Create nourishment that is effective without becoming rigid or obsessive.",
    },
    anchor: "Nourish capacity without making food another full-time job.",
    whatToExpect: [
      { title: "Conversation", body: "We start with your current routines, preferences, schedule, training and goals." },
      { title: "Your plan", body: "Practical meal structure and fueling habits, built together rather than handed to you." },
      { title: "Check-ins", body: "We adjust as your training, stress and life change." },
    ],
    // Scope (Step 15 §15.8; plans design ruling 2026-09-29): nutrition coaching within an IIN health-coach scope.
    scopeNote:
      "Integrated Nutrition is nutrition coaching, not medical nutrition therapy. It does not diagnose or treat medical conditions or eating disorders, or prescribe diets for them. Those needs stay with your physician or a registered dietitian, and we’ll help you find the right professional.",
    faqs: [
      { q: "Will you give me a meal plan?", a: "We build practical meal structure and routines with you rather than a rigid plan to follow. Diets for medical conditions stay with your physician or a registered dietitian.", draft: true },
      { q: "Can nutrition coaching work alongside strength training?", a: "Yes. Fueling, training and recovery work best together, and we can coordinate them when that helps your goals.", draft: true },
      { q: "Can we work together virtually?", a: "Yes. Nutrition coaching is available virtually and in person.", draft: true },
    ],
    primaryCta: { label: "Schedule a Nutrition Conversation", kind: "book" },
    secondaryCta: { label: "Find Your Starting Point", kind: "start" },
    icon: "/brand/icons/integrated-nutrition.svg",
  },
  {
    slug: "holistic-life-coaching",
    path: "holistic-life-coaching",
    name: "Holistic Life Coaching",
    metaDescription: "Holistic life coaching in Brighton and Howell, MI, or virtually, to bring more clarity, balance and practical next steps to the life you want.",
    shortName: "Life Coaching",
    headline: "Bring the way you live closer to what matters most.",
    summary:
      "Clarity, alignment, accountability, intentional change, and practical strategies for a more coherent and fulfilling life.",
    description:
      "Personalized support for creating greater clarity, balance, and intention in your life. Whether you’re navigating change, feeling stuck, working toward a personal goal, or trying to bring your priorities and everyday life into better alignment, TAB helps you understand the whole picture and create practical next steps that fit your reality.",
    whoItsFor: [
      "Clarifying personal goals and priorities",
      "Navigating major life transitions",
      "Feeling stuck or unsure about what comes next",
      "Creating better balance between work, family, health, and personal needs",
      "Improving follow-through and accountability",
      "Developing stronger boundaries",
      "Reducing overwhelm with clearer priorities and next steps",
    ],
    gains: [
      "Greater clarity about goals, priorities, and direction",
      "Better alignment between values, responsibilities, and daily choices",
      "More confidence in decision-making",
      "Stronger boundaries and healthier use of time and energy",
      "Greater accountability and follow-through",
      "Sustainable progress toward personal goals",
    ],
    approachLead:
      "Holistic life coaching at TAB starts by looking at the whole picture—not just the goal in front of you.",
    approach: [
      "Work affects health. Stress affects relationships. Responsibilities affect routines. We help you step back and understand how those pieces interact.",
      "Coaching is collaborative and practical. Accountability is part of the process, and it should feel supportive rather than punitive.",
    ],
    method: {
      transform: "Change patterns and choices that limit agency.",
      adapt: "Build flexibility when life changes.",
      balance: "Bring time, energy, relationships, priorities and recovery into balance.",
    },
    anchor: "Turn insight into agency and action.",
    whatToExpect: [
      { title: "Clarify", body: "We start with what feels out of alignment and what you want to be different." },
      { title: "Plan", body: "Together we build realistic steps that fit your responsibilities and energy." },
      { title: "Adapt", body: "Progress isn’t linear. We adjust as circumstances and priorities change." },
    ],
    scopeNote:
      "Coaching does not replace licensed mental health, medical, legal, financial, or other professional care. When needs fall into those areas, we’ll encourage you to work with the right qualified professional.",
    faqs: [
      { q: "How is coaching different from therapy?", a: "Coaching focuses on goals, priorities, habits, and practical next steps. Therapy addresses mental health treatment and is provided by licensed professionals. We’ll help you find the right support if you need it.", draft: true },
      { q: "Can coaching happen virtually?", a: "Yes. Coaching is available virtually and in person.", draft: true },
      { q: "How is accountability handled?", a: "We agree on commitments together and check in regularly. Accountability is supportive, not punitive.", draft: true },
    ],
    primaryCta: { label: "Schedule a Coaching Conversation", kind: "book" },
    secondaryCta: { label: "Start with What Matters", kind: "start" },
    icon: "/brand/icons/holistic-life-coaching.svg",
  },
];

export const getService = (slug: string) => services.find((s) => s.slug === slug);
/** Find a service by its public URL segment (`/services/[path]`). */
export const getServiceByPath = (path: string) => services.find((s) => s.path === path);
export const serviceHref = (s: Service) => `/services/${s.path}`;
