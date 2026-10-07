import { makeRouteHandler } from "@keystatic/next/route-handler";
import config, { keystaticMode } from "../../../../keystatic.config";

/**
 * Keystatic's server route. Keystatic Cloud doesn't use it; local mode (a developer's machine only) reads and writes the
 * content files through it. Anywhere else it answers 404, so a deployed site can never write files.
 */
const local = keystaticMode === "local" ? makeRouteHandler({ config }) : null;
const notFound = () => new Response("Not found", { status: 404 });

export const GET = (req: Request) => (local ? local.GET(req) : notFound());
export const POST = (req: Request) => (local ? local.POST(req) : notFound());
