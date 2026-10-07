import type { StoredInquiry } from "@/lib/inquiry";

/**
 * Saves a Start or contact submission (DIV-05). Server only: the website's API route writes with the service role,
 * because no signed-in role may insert submissions (row-level security in *_inquiries.sql). Called only while
 * `siteConfig.forms.storeSubmissions` is on.
 */
export async function storeInquiry(d: StoredInquiry, reference: string, flags: string[] = []): Promise<void> {
  const { createSupabaseServiceClient } = await import("@/lib/supabase/server");
  const sb = await createSupabaseServiceClient();
  const { error } = await sb.from("inquiries").insert({
    reference,
    kind: d.kind,
    name: d.name,
    email: d.email,
    phone: d.phone || null,
    contact_preference: d.contactPreference ?? null,
    journey: d.journey ?? null,
    help: d.help ?? [],
    service_interest: d.service ?? null,
    outcomes: d.outcomes ?? [],
    considerations: d.considerations ?? [],
    delivery: d.delivery ?? null,
    availability: d.availability ?? [],
    found_via: d.foundVia ?? null,
    topic: d.topic ?? null,
    message: d.kind === "contact" ? d.message || null : null,
    consent_contact_at: new Date().toISOString(),
    marketing_opt_in: d.marketingOptIn ?? false,
    flags,
  });
  if (error) throw new Error(error.message);
}
