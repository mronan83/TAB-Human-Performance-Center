import { z } from "zod";

/**
 * Start Where You Are (GS-001) follows the Step 14 §14.4.1 Get Started form; the general contact form is a
 * short subset. Submissions are emailed, never stored (D-054), so every free-text field carries the
 * "no medical details" guidance in the form (R-027).
 */

/** "What would you most like help with?" (S14 §14.4.1, multiple selections). */
export const helpOptions = [
  { value: "feel-better", label: "Feeling better physically" },
  { value: "reduce-tension", label: "Reducing tension or discomfort" },
  { value: "massage-bodywork", label: "Massage / bodywork" },
  { value: "recovery", label: "Recovery" },
  { value: "stronger", label: "Becoming stronger" },
  { value: "movement", label: "Improving movement or mobility" },
  { value: "exercise", label: "Starting or returning to exercise" },
  { value: "womens-wellness", label: "Women’s wellness" },
  { value: "habits", label: "Building healthier habits" },
  { value: "life-transition", label: "Navigating a life transition" },
  { value: "balance", label: "Creating more balance" },
  { value: "goals", label: "Clarifying goals or priorities" },
  { value: "not-sure", label: "I’m not sure yet" },
  { value: "other", label: "Other" },
] as const;

/** "Which service are you interested in?" (S14 §14.4.1, one choice). */
export const serviceOptions = [
  { value: "massage-bodywork", label: "Massage & Bodywork" },
  { value: "personal-strength-training", label: "Personal Strength Training" },
  { value: "womens-wellness-coaching", label: "Women’s Wellness Coaching" },
  { value: "holistic-life-coaching", label: "Holistic Life Coaching" },
  { value: "not-sure", label: "I’m not sure" },
] as const;

export const contactOptions = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone call" },
  { value: "text", label: "Text message" },
] as const;

export const deliveryOptions = [
  { value: "in-person", label: "In person" },
  { value: "virtual", label: "Virtual" },
  { value: "either", label: "Either" },
] as const;

/** How they found TAB (S14 §14.3 Connect), using the S14 §14.2 Discover channels. */
export const foundViaOptions = [
  { value: "search", label: "Google or another search" },
  { value: "social", label: "Social media" },
  { value: "friend", label: "A friend or family member" },
  { value: "existing-client", label: "I’m a current or past client" },
  { value: "professional", label: "A healthcare or wellness professional" },
  { value: "community-event", label: "A community event" },
  { value: "local", label: "Signage or around town" },
  { value: "other", label: "Other" },
] as const;

const values = <T extends readonly { value: string }[]>(opts: T) => opts.map((o) => o.value) as [T[number]["value"], ...T[number]["value"][]];
const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));

export const inquirySchema = z.object({
  kind: z.enum(["start", "contact"]),
  name: z.string().trim().min(1, "Please tell us your name.").max(120),
  email: z.string().trim().email("Please enter a valid email address.").max(200),
  phone: optionalText(40),
  contactPreference: z.enum(values(contactOptions)).optional(),
  /** Start: "What brings you to TAB?" · Contact: "How can we help?" */
  message: z.string().trim().min(1, "Please share a little about what brings you here.").max(3000),
  help: z.array(z.enum(values(helpOptions))).max(helpOptions.length).optional(),
  service: z.enum(values(serviceOptions)).optional(),
  /** "If things improved, what would you like to be able to feel, do, or experience differently?" */
  improved: optionalText(2000),
  /** "Is there anything we should know before helping you determine the right starting point?" */
  considerations: optionalText(2000),
  delivery: z.enum(values(deliveryOptions)).optional(),
  availability: optionalText(500),
  foundVia: z.enum(values(foundViaOptions)).optional(),
  consentContact: z.literal(true, { errorMap: () => ({ message: "Please confirm we can contact you about your inquiry." }) }),
  marketingOptIn: z.boolean().optional(),
  company: z.string().max(200).optional(), // honeypot: humans leave it empty; the route drops filled submissions quietly
});

export type Inquiry = z.infer<typeof inquirySchema>;

export const labelFor = (opts: readonly { value: string; label: string }[], value?: string) =>
  opts.find((o) => o.value === value)?.label ?? value ?? "";
