import { z } from "zod";

/**
 * Start Where You Are (GS-001) asks the Step 14 §14.4.1 Get Started questions; the contact form is a short,
 * general-purpose form. Owner rulings 2026-09-28 (proposed D-059):
 * - Start: every answer is a choice we define. Apart from name, email and phone (character-restricted), nothing
 *   typed on it reaches our email, the submitter's copy or the database.
 * - Contact: keeps its message box, with the "no medical details" note (R-027). The submitter's copy confirms
 *   receipt without repeating the message, so the form can't relay someone's text to another address (RSK-011).
 */

type Option = { readonly value: string; readonly label: string };

/** "Where are you starting from?" (S14 "Start where you are"; one choice). */
export const journeyOptions = [
  { value: "exploring", label: "New to TAB and exploring my options" },
  { value: "ready", label: "Ready to get started soon" },
  { value: "returning", label: "Returning after some time away" },
  { value: "current-client", label: "A current client interested in another service" },
] as const;

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
  { value: "other", label: "Something else (we’ll ask when we talk)" },
] as const;

/** "Which service are you interested in?" (S14 §14.4.1, one choice). */
export const serviceOptions = [
  { value: "massage-bodywork", label: "Massage & Bodywork" },
  { value: "personal-strength-training", label: "Functional Strength" },
  { value: "womens-wellness-coaching", label: "Women’s Wellness" },
  { value: "integrated-nutrition", label: "Integrated Nutrition" },
  { value: "holistic-life-coaching", label: "Holistic Life Coaching" },
  { value: "not-sure", label: "I’m not sure" },
] as const;

/**
 * S14's IMPORTANT QUESTION: "If things improved, what would you like to be able to feel, do, or experience
 * differently?" Outcomes, never conditions or treatment claims (scope of practice, S15 §15.8).
 */
export const outcomeOptions = [
  { value: "ease", label: "Move with more ease and comfort" },
  { value: "strength", label: "Feel stronger and more capable" },
  { value: "energy", label: "Have more energy" },
  { value: "rest", label: "Rest and recover better" },
  { value: "calm", label: "Feel calmer and more balanced" },
  { value: "keep-up", label: "Keep up with family, work or the activities I love" },
  { value: "independence", label: "Stay independent and active as I get older" },
  { value: "confidence", label: "Feel more confident in my body" },
  { value: "habits", label: "Build habits that last" },
  { value: "clarity", label: "Get clear on my goals or next chapter" },
  { value: "talk", label: "Not sure yet; I’d like to talk it through" },
] as const;

/**
 * S14 immediate consideration: "Is there anything we should know before helping you determine the right starting
 * point?" The health option is a flag only, so a practitioner follows up privately before anything is booked.
 */
export const considerationOptions = [
  { value: "health-private", label: "There’s something health-related I’d like to discuss privately first" },
  { value: "talk-first", label: "I’d like a conversation before booking anything" },
  { value: "access", label: "I have access needs we should plan for" },
  { value: "schedule", label: "My schedule is limited or changes often" },
  { value: "pricing", label: "I’d like to understand pricing first" },
  { value: "none", label: "Nothing right now" },
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

export const availabilityOptions = [
  { value: "weekday-mornings", label: "Weekday mornings" },
  { value: "weekday-afternoons", label: "Weekday afternoons" },
  { value: "weekday-evenings", label: "Weekday evenings" },
  { value: "weekends", label: "Weekends" },
  { value: "flexible", label: "I’m flexible" },
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

/** Contact form: "What can we help with?" (one choice). */
export const topicOptions = [
  { value: "booking", label: "Booking or scheduling" },
  { value: "services", label: "Services and pricing" },
  { value: "gift-cards", label: "Gift cards" },
  { value: "appointment", label: "An existing appointment" },
  { value: "billing", label: "Billing or payments" },
  { value: "partnerships", label: "Partnerships, press or community events" },
  { value: "other", label: "Something else" },
] as const;

/** S14 §14.4.1 routing outcomes: every Start submission ends with exactly one next step (GS-004). */
export const routingOptions = [
  { value: "book", label: "Direct booking" },
  { value: "discovery", label: "Brief discovery conversation" },
  { value: "intake", label: "Service-specific intake" },
  { value: "more_info", label: "More information needed" },
  { value: "referral", label: "Outside referral / TAB may not be the right fit" },
] as const;
export type RoutingOutcome = (typeof routingOptions)[number]["value"];

const values = <T extends readonly Option[]>(opts: T) => opts.map((o) => o.value) as [T[number]["value"], ...T[number]["value"][]];
const choice = <T extends readonly Option[]>(opts: T) => z.enum(values(opts)).optional();
const choices = <T extends readonly Option[]>(opts: T) => z.array(z.enum(values(opts))).max(opts.length).optional();

export const inquirySchema = z
  .object({
    kind: z.enum(["start", "contact", "resource"]),
    // A resource request (C35): which document they asked for, by its address in the library.
    resource: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).max(90).optional(),
    // The only typed fields. Restricted so they can't carry links or messages into the emails we send.
    name: z
      .string()
      .trim()
      .min(1, "Please tell us your name.")
      .max(80, "Please shorten your name to 80 characters.")
      .regex(/^[\p{L}\p{M}][\p{L}\p{M}'’ .-]*$/u, "Please use letters only for your name."),
    email: z.string().trim().email("Please enter a valid email address.").max(200),
    phone: z
      .string()
      .trim()
      .regex(/^[0-9+().\-\s]{7,25}$/, "Please enter a phone number using digits only.")
      .optional()
      .or(z.literal("")),
    contactPreference: choice(contactOptions),
    // Start Where You Are
    journey: choice(journeyOptions),
    help: choices(helpOptions),
    service: choice(serviceOptions),
    outcomes: choices(outcomeOptions),
    considerations: choices(considerationOptions),
    delivery: choice(deliveryOptions),
    availability: choices(availabilityOptions),
    foundVia: choice(foundViaOptions),
    // Contact
    topic: choice(topicOptions),
    message: z.string().trim().max(3000, "Please keep your message under 3,000 characters.").optional(),
    consentContact: z.literal(true, { errorMap: () => ({ message: "Please confirm we can contact you about your inquiry." }) }),
    marketingOptIn: z.boolean().optional(),
    // Spam defenses (lib/spam.ts, SEC-013); never stored or emailed.
    website: z.string().max(200).optional(), // honeypot: hidden from people; bots that fill it are dropped quietly
    elapsedMs: z.number().int().nonnegative().max(86_400_000).optional(), // time from page load to submit
    turnstileToken: z.string().max(4096).optional(),
  })
  .superRefine((d, ctx) => {
    if (d.kind === "start" && !d.help?.length) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["help"], message: "Please choose at least one." });
    }
    if (d.kind === "contact" && !d.topic) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["topic"], message: "Please choose what we can help with." });
    }
    if (d.kind === "resource" && !d.resource) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["resource"], message: "Please choose a resource." });
    }
    if (d.kind === "contact" && !d.message) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["message"], message: "Please write a short message." });
    }
  })
  // Only the contact form has free text: drop a message if one is sent with anything else.
  .transform((d) => (d.kind === "contact" ? d : { ...d, message: undefined }));

/** A Start or contact submission: the kinds that are stored and listed in TAB Practice → Submissions. */
export type StoredInquiry = Omit<Inquiry, "website" | "elapsedMs" | "turnstileToken"> & { kind: "start" | "contact" };

export type Inquiry = z.infer<typeof inquirySchema>;

export const labelFor = (opts: readonly Option[], value?: string) => opts.find((o) => o.value === value)?.label ?? value ?? "";
export const labelsFor = (opts: readonly Option[], list?: readonly string[]) => (list ?? []).map((v) => labelFor(opts, v));
