import { siteConfig } from "@/config/site";
import { isBot } from "@/lib/site-stats";
import { RESOURCE_EVENT_PREFIX } from "@/lib/resource-constants";

/**
 * Counts a resource being opened (a link followed or a document downloaded) as a daily total, `Resource: <slug>`, for
 * the owner's stats page (owner request 2026-10-07). Counted on the server by the route that serves it, with the same
 * rules as /api/stats: no cookies or visitor identifiers, and nothing for bots or visitors who ask not to be tracked.
 * The key is the resource's address from the library, never anything a visitor sends.
 */

export async function countResourceOpen(req: Request, slug: string): Promise<void> {
  if (!siteConfig.analytics.firstParty) return;
  if (req.headers.get("sec-gpc") === "1" || req.headers.get("dnt") === "1" || isBot(req.headers.get("user-agent"))) return;
  try {
    const { createSupabaseServiceClient } = await import("@/lib/supabase/server");
    const sb = await createSupabaseServiceClient();
    await sb.rpc("record_site_stat", { p_kind: "event", p_key: `${RESOURCE_EVENT_PREFIX}${slug}`.slice(0, 120) });
  } catch (e) {
    console.error("[resources] not counted", e instanceof Error ? e.message : e); // counts are best effort
  }
}
