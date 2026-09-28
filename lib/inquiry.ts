import { z } from "zod";

export const interestOptions = [
  { value: "massage-bodywork", label: "Relief, recovery, or relaxation (Massage & Bodywork)" },
  { value: "personal-strength-training", label: "Strength, movement, or confidence (Personal Strength Training)" },
  { value: "womens-wellness-coaching", label: "Habits, routines, or a life-stage change (Women’s Wellness Coaching)" },
  { value: "holistic-life-coaching", label: "Clarity, direction, or balance (Holistic Life Coaching)" },
  { value: "not-sure", label: "I’m not sure yet" },
] as const;

export const inquirySchema = z.object({
  kind: z.enum(["start", "contact"]),
  name: z.string().trim().min(1, "Please tell us your name.").max(120),
  email: z.string().trim().email("Please enter a valid email address.").max(200),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  contactPreference: z.enum(["email", "phone", "text"]).optional(),
  interests: z.array(z.enum(interestOptions.map((o) => o.value) as [string, ...string[]])).optional(),
  delivery: z.enum(["in-person", "virtual", "either"]).optional(),
  message: z.string().trim().min(1, "Please share a little about what you’re looking for.").max(3000),
  availability: z.string().trim().max(500).optional().or(z.literal("")),
  referral: z.string().trim().max(200).optional().or(z.literal("")),
  consentContact: z.literal(true, { errorMap: () => ({ message: "Please confirm we can contact you about your inquiry." }) }),
  marketingOptIn: z.boolean().optional(),
  company: z.string().max(0).optional(), // honeypot: must stay empty
});

export type Inquiry = z.infer<typeof inquirySchema>;
