import { siteConfig } from "@/config/site";
import { limiter, sameOrigin } from "@/lib/spam";
import { isBot, statRows } from "@/lib/site-stats";

/**
 * Receives page views and fixed events from public pages (owner ruling A4, NFR-005/006) and adds them to daily totals.
 * Always answers 204, so it tells a caller nothing. Skipped for other sites, bots, visitors who ask not to be tracked
 * (Global Privacy Control or Do Not Track), excluded pages, and anything over a generous per-address limit.
 */
const limited = limiter(300, 10 * 60_000);
const done = () => new Response(null, { status: 204 });

export async function POST(req: Request) {
  if (!siteConfig.analytics.firstParty || !sameOrigin(req)) return done();
  if (req.headers.get("sec-gpc") === "1" || req.headers.get("dnt") === "1" || isBot(req.headers.get("user-agent"))) return done();
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (limited(ip)) return done();
  const raw = await req.text().catch(() => "");
  if (raw.length > 2_000) return done();
  const rows = statRows((() => { try { return JSON.parse(raw); } catch { return {}; } })());
  if (!rows.length) return done();
  try {
    const { createSupabaseServiceClient } = await import("@/lib/supabase/server");
    const sb = await createSupabaseServiceClient();
    await Promise.all(rows.map((r) => sb.rpc("record_site_stat", { p_kind: r.kind, p_key: r.key })));
  } catch (e) {
    console.error("[stats] not recorded", e instanceof Error ? e.message : e); // counts are best effort
  }
  return done();
}
