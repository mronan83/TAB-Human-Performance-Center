/**
 * Massage & Bodywork techniques (owner request 2026-10-06): the eight modalities from tabmassage.com's "Introduction to
 * Massage", rewritten in the new voice, plus manual lymphatic drainage. Shaped as a Payload collection (D-036).
 *
 * Copy rules: plain language, no diagnosis or treatment claims (guardrail 8, Step 15 §15.8): "often chosen for", never
 * "treats" or "cures". Every technique stays `draft: true` until the owner confirms TAB's current training in it
 * (guardrail 10: never imply a credential that isn't held); `reviewNote` says what to confirm, shown on previews only.
 */

export type TechniqueGroup = "release" | "move" | "calm";
/** How the work usually feels, lightest first. The page shows it as words and a four-step scale. */
export type Pressure = "Very light" | "Gentle" | "Moderate" | "Firm";
export const PRESSURE_LEVELS: Pressure[] = ["Very light", "Gentle", "Moderate", "Firm"];

export type Technique = {
  slug: string;
  name: string;
  /** Other names people search for. */
  aka?: string;
  group: TechniqueGroup;
  pressure: Pressure;
  /** One sentence: what it is. */
  summary: string;
  feelsLike: string;
  oftenChosenFor: string[];
  goodToKnow?: string;
  draft: boolean;
  reviewNote?: string;
};

export const techniqueGroups: { key: TechniqueGroup; title: string; lead: string }[] = [
  { key: "release", title: "Release deep or stubborn tension", lead: "Focused, firmer work for knots, overworked muscles and tension that keeps coming back." },
  { key: "move", title: "Free up movement", lead: "Slow, sustained work on the connective tissue (fascia) that wraps and links everything, for stiffness and restricted range." },
  { key: "calm", title: "Calm, restore and recover", lead: "Lighter, quieter work for stress, recovery and comfort when your body needs less, not more." },
];

const TRAINING = "Confirm TAB’s current training in this technique before launch.";

export const techniques: Technique[] = [
  {
    slug: "deep-tissue",
    name: "Deep tissue massage",
    group: "release",
    pressure: "Firm",
    summary: "Slower, firmer pressure that works through the surface muscles into the deeper layers of muscle and connective tissue.",
    feelsLike: "Firm and focused, but never a contest. You set the pressure, and we check in as we go.",
    oftenChosenFor: ["Persistent tightness that lighter massage doesn’t reach", "Recovery from heavy training or physically demanding work", "Areas that have been tense for a long time"],
    goodToKnow: "Some muscle soreness for a day or two afterwards is common. Gentle movement and staying hydrated help.",
    draft: true,
    reviewNote: TRAINING,
  },
  {
    slug: "trigger-point",
    name: "Trigger point therapy",
    group: "release",
    pressure: "Firm",
    summary: "Steady pressure on tight, tender spots in a muscle (trigger points) until they ease. These spots can send sensation elsewhere, like shoulder tension you feel as a tension headache.",
    feelsLike: "Pinpoint pressure that may feel intense, then softens as the spot releases. You stay in control of how much.",
    oftenChosenFor: ["Knots you can put a finger on", "Tension that seems to travel, such as from the shoulders up into the head", "Tightness from desk work, driving or repetitive tasks"],
    draft: true,
    reviewNote: TRAINING,
  },
  {
    slug: "neuromuscular",
    name: "Neuromuscular therapy",
    aka: "NMT",
    group: "release",
    pressure: "Moderate",
    summary: "A methodical approach that works muscle by muscle, looking at posture, movement and tender areas together to find and ease the pattern behind recurring tension.",
    feelsLike: "Thorough and precise: moderate to firm pressure, with more conversation about what you notice.",
    oftenChosenFor: ["Tension that keeps returning to the same places", "Strain linked to posture or how you move at work", "Understanding your own tension patterns, not just easing them for a day"],
    draft: true,
    reviewNote: TRAINING,
  },
  {
    slug: "active-release",
    name: "Active Release Techniques",
    aka: "A.R.T.",
    group: "release",
    pressure: "Moderate",
    summary: "Precise pressure combined with movement: we hold contact on a specific spot while you (or we) move the area through its range, to free tissue that has become stuck.",
    feelsLike: "Active and specific. Short, focused passes rather than long strokes, and you’ll be asked to move.",
    oftenChosenFor: ["A movement that feels caught or restricted", "Tightness from repetitive use in sport, trades or desk work", "Getting back to an activity after a period of strain"],
    goodToKnow: "A.R.T. is a certified technique. We’ll use it where it fits your session, often alongside other work.",
    draft: true,
    reviewNote: "Active Release Techniques is a trademarked, certification-based method. Confirm current A.R.T. certification (and which areas) before launch, or remove.",
  },
  {
    slug: "myofascial-release",
    name: "Myofascial release",
    group: "move",
    pressure: "Moderate",
    summary: "Slow, sustained pressure and stretching of the fascia, the connective tissue that wraps and links your muscles, to ease restrictions between layers. Often uses little or no oil, and may include skin rolling.",
    feelsLike: "Slow and patient: a gradual stretch or melting sensation rather than kneading.",
    oftenChosenFor: ["General stiffness or feeling ‘tight all over’", "Restricted range of motion", "Areas around old, fully healed scars"],
    draft: true,
    reviewNote: TRAINING,
  },
  {
    slug: "visceral",
    name: "Organ-specific fascial mobilization",
    aka: "Visceral manipulation",
    group: "move",
    pressure: "Gentle",
    summary: "Gentle, specific pressure through the abdomen, ribs and pelvis to ease tension in the connective tissue around the organs, so the trunk can move more freely.",
    feelsLike: "Quiet and gentle. Light, sustained hands-on contact, mostly over clothing or a drape.",
    oftenChosenFor: ["Long-standing back, neck or pelvic tension that hasn’t eased with other work", "A tight or restricted feeling through the ribs, belly or pelvis", "Restriction after abdominal surgery, once fully healed and cleared"],
    goodToKnow: "After surgery, or during pregnancy, we’ll talk first and may ask for clearance from your healthcare team.",
    draft: true,
    reviewNote: "Visceral manipulation is usually taught through specific certification programs. Confirm TAB’s training before launch.",
  },
  {
    slug: "craniosacral",
    name: "Craniosacral therapy",
    group: "calm",
    pressure: "Very light",
    summary: "Very light, still holds at the head, spine and sacrum, the area at the base of the spine, to help the body settle and release tension.",
    feelsLike: "Deeply calm. Little movement, often fully clothed, and many people drift toward sleep.",
    oftenChosenFor: ["Stress and a nervous system that feels ‘switched on’", "Tension in the head, jaw and neck", "When firmer massage feels like too much"],
    draft: true,
    reviewNote: TRAINING,
  },
  {
    slug: "lymphatic-drainage",
    name: "Manual lymphatic drainage",
    aka: "MLD, lymphatic massage",
    group: "calm",
    pressure: "Very light",
    summary: "Very light, slow, rhythmic strokes that follow the direction of the lymphatic system, the network that carries fluid back toward the heart, to support healthy fluid movement.",
    feelsLike: "Light and soothing, much lighter than people expect. It works on the skin and just below it, not the muscles.",
    oftenChosenFor: ["Swelling or puffiness after surgery, once your surgeon has cleared you", "Feeling heavy or fluid-retentive, such as in late pregnancy, with clearance", "Gentle recovery and relaxation"],
    goodToKnow: "Not suitable with an active infection, a blood clot or some heart and kidney conditions. After surgery, or if you have lymphedema, we’ll ask for clearance and coordinate with your healthcare team.",
    draft: true,
    reviewNote: "New technique (owner request 2026-10-06). Confirm TAB’s MLD training. Lymphedema care usually calls for a certified lymphedema therapist (CLT): confirm whether TAB holds CLT, or keep the referral wording.",
  },
  {
    slug: "myomassology",
    name: "Myomassology",
    aka: "Integrative massage",
    group: "calm",
    pressure: "Gentle",
    summary: "A whole-person approach that blends relaxation (Swedish) massage with reflexology, aromatherapy, craniosacral and energy-balancing work, chosen around how you feel that day.",
    feelsLike: "Flowing and restorative, adapted as the session goes. Pressure ranges from gentle to moderate.",
    oftenChosenFor: ["Relaxation and stress relief", "A first massage, or returning after a long break", "A session built around the whole person, not one area"],
    draft: true,
    reviewNote: TRAINING,
  },
];

export const techniquesPage = {
  path: "/services/massage-bodywork/techniques",
  title: "Massage techniques",
  metaDescription: "Massage techniques in Brighton, MI, from deep tissue and myofascial release to craniosacral therapy and manual lymphatic drainage.",
  lead: "Nine techniques, one approach: each session is built around how you feel, move and recover. Here is what each technique is, how it feels, and when it’s often chosen.",
  notSure: {
    title: "You don’t need to choose",
    body: "Most sessions blend several techniques. Tell us how you feel and what you’d like to be different, and we’ll choose and adjust as we go. If you have a preference, say so when you book.",
  },
};

export const techniquesBySlug = (slug: string) => techniques.find((t) => t.slug === slug);
