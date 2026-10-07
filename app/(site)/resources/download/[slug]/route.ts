import fs from "node:fs/promises";
import { NextResponse } from "next/server";
import { documentFile, findResource, validDownloadSignature } from "@/lib/resources";
import { countResourceOpen } from "@/lib/resource-stats";

/**
 * Serves an uploaded document (C35). An open document is served to anyone; one that asks for an email address needs
 * the signed link we email (lib/resources.ts). An expired or altered link goes back to the Resources page, which
 * explains and offers to send a new one.
 */
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = findResource(slug);
  const file = r ? documentFile(r) : null;
  if (!r?.document || !file) return new NextResponse("Not found", { status: 404 });
  const url = new URL(req.url);
  if (r.document.requireEmail && !validDownloadSignature(slug, url.searchParams.get("e"), url.searchParams.get("s"))) {
    return NextResponse.redirect(new URL(`/resources?link=expired&r=${slug}#${slug}`, url), 303);
  }
  const data = await fs.readFile(file);
  await countResourceOpen(req, slug);
  return new NextResponse(new Uint8Array(data), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(data.length),
      "Content-Disposition": `inline; filename="${slug}.pdf"`,
      // An emailed link is personal to its message: never cached by a shared cache or listed by search engines.
      "Cache-Control": r.document.requireEmail ? "private, no-store" : "public, max-age=3600",
      ...(r.document.requireEmail ? { "X-Robots-Tag": "noindex, nofollow" } : {}),
    },
  });
}
