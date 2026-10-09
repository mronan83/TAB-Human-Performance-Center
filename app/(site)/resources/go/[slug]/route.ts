import { NextResponse } from "next/server";
import { findResource } from "@/lib/resources";
import { countResourceOpen } from "@/lib/resource-stats";

/**
 * Follows a resource link, counting it first (C35): another website, or a page on this site (a path). Only addresses
 * from the library are used.
 */
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = findResource(slug);
  if (r?.kind.discriminant !== "link") return new NextResponse("Not found", { status: 404 });
  await countResourceOpen(req, slug);
  return NextResponse.redirect(new URL(r.kind.value.url, req.url), 307);
}
