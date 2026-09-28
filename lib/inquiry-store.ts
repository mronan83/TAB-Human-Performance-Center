import type { Inquiry } from "@/lib/inquiry";

/**
 * Saves a Start or contact submission (DIV-05). Server only: the website's API route writes with the service role,
 * because no signed-in role may insert submissions (row-level security in *_inquiries.sql). Called only while
 * `siteConfig.forms.storeSubmissions` is on.
 */
export async function storeInquiry(d: Inquiry, reference: string): Promise<void> {
  const { createSupabaseServiceClient } = await import("@/lib/supabase/server");
  const sb = await createSupabaseServiceClient();
  const blank = (v?: string) => v || null;
  const { error } = await sb.from("inquiries").insert({
    reference,
    kind: d.kind,
    name: d.name,
    email: d.email,
    phone: blank(d.phone),
    contact_preference: d.contactPreference ?? null,
    message: d.message,
    help: d.help ?? [],
    service_interest: d.service ?? null,
    improved: blank(d.improved),
    considerations: blank(d.considerations),
    delivery: d.delivery ?? null,
    availability: blank(d.availability),
    found_via: d.foundVia ?? null,
    consent_contact_at: new Date().toISOString(),
    marketing_opt_in: d.marketingOptIn ?? false,
  });
  if (error) throw new Error(error.message);
}
