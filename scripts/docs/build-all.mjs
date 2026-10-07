#!/usr/bin/env node
/**
 * Renders the four living documentation pages into one folder, ready to republish to their artifacts
 * (addresses in docs/living-docs.json):
 *
 *   npm run docs:html -- --out-dir <folder>
 *
 * Writes traceability.html, architecture.html, data-model.html and content-guide.html. Run `npm run docs:check` first; each renderer also
 * refuses to build a page whose source is out of step with the code.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const i = process.argv.indexOf("--out-dir");
const dir = i > 0 ? process.argv[i + 1] : null;
if (!dir) { console.error("Usage: npm run docs:html -- --out-dir <folder>"); process.exit(1); }
fs.mkdirSync(dir, { recursive: true });
const here = path.dirname(new URL(import.meta.url).pathname);
for (const [script, file] of [["render-traceability.mjs", "traceability.html"], ["render-architecture.mjs", "architecture.html"], ["render-data-model.mjs", "data-model.html"], ["render-content-guide.mjs", "content-guide.html"]]) {
  execFileSync(process.execPath, [path.join(here, script), "--out", path.join(dir, file)], { stdio: "inherit" });
}
