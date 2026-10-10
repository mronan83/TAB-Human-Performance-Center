#!/usr/bin/env node
// Prints a guide TAB wrote for the resource library (C35) from its source, design/resources/<slug>.html (styles in
// design/resources/guide.css), to design/resources/out/<slug>.pdf (git-ignored). The source uses the site's own fonts
// (app/fonts), logo artwork (public/brand) and photos (public/images/library), so the guide matches the brand without a
// design tool. Uses Playwright's Chromium, already a dev dependency; the PDF is tagged, with bookmarks from its headings
// (content guide: "Make it accessible"), and its document properties name TAB as author, from the source's <title> and
// author and description meta tags. The PDF is then uploaded in the content editor (Resources) like any other document
// and linked to its subject, so the library's copy arrives by the editor's own path and checks.
//
//   npm run resource:pdf -- lymphatic-drainage-basics

import { appendFileSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";

const root = new URL("..", import.meta.url).pathname;
const slug = process.argv[2];
if (!slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
  console.error("Usage: npm run resource:pdf -- <slug>   (renders design/resources/<slug>.html)");
  process.exit(1);
}
const source = join(root, "design/resources", `${slug}.html`);
const out = join(root, "design/resources/out", `${slug}.pdf`);
statSync(source);
mkdirSync(dirname(out), { recursive: true });

let doc;
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.goto(pathToFileURL(source).href, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  doc = await page.evaluate(() => ({
    title: document.title,
    author: document.querySelector('meta[name="author"]')?.getAttribute("content") ?? "",
    subject: document.querySelector('meta[name="description"]')?.getAttribute("content") ?? "",
    headings: [...document.querySelectorAll("h1, h2, h3, h4, h5, h6")].map((h) => h.textContent.replace(/\s+/g, " ").trim()),
  }));
  await page.pdf({ path: out, width: "8.5in", height: "11in", printBackground: true, preferCSSPageSize: true, tagged: true, outline: true });
} finally {
  await browser.close();
}
finish(out, { Title: doc.title, Author: doc.author, Subject: doc.subject, Creator: doc.author }, doc.headings);
const bytes = statSync(out).size;
console.log(`${out.slice(root.length)}: ${(bytes / 1024).toFixed(0)} KB`);
if (bytes > 10 * 1048576) { console.error("Over the library's 10 MB limit (content/schema.ts MAX_DOCUMENT_BYTES)."); process.exit(1); }

/**
 * Two fixes Chromium can't make itself, written as one incremental update (new versions of the changed objects, an xref
 * for them and a trailer pointing back to the original), which leaves the tagged structure untouched and needs no PDF
 * library: the document properties (Chromium sets only the title and its own name), and the bookmark titles, from which
 * Chromium drops the space wherever a heading wraps ("Your FirstMassage") and which show CSS-uppercased text. A bookmark
 * is retitled only when it matches a heading letter for letter, ignoring spaces and case.
 */
function finish(file, info, headings) {
  const pdf = readFileSync(file);
  const text = pdf.toString("latin1");
  const tail = text.slice(-2048);
  const trailer = tail.slice(tail.lastIndexOf("trailer"));
  const size = Number(/\/Size (\d+)/.exec(trailer)?.[1]);
  const rootRef = /\/Root (\d+ \d+ R)/.exec(trailer)?.[1];
  const prev = Number(/startxref\s+(\d+)/.exec(tail.slice(tail.lastIndexOf("startxref")))?.[1]);
  if (!size || !rootRef || !prev) throw new Error(`${file}: unexpected PDF trailer; can't finish the document.`);
  const infoNum = Number(/\/Info (\d+) 0 R/.exec(trailer)?.[1] ?? size);

  // PDF text strings: ASCII as literal strings, anything else as UTF-16BE hex.
  const str = (v) => (/^[\x20-\x7e]*$/.test(v) ? `(${v.replace(/[\\()]/g, (c) => `\\${c}`)})` : `<FEFF${Buffer.from(v, "utf16le").swap16().toString("hex")}>`);
  const decode = (s) => (s.startsWith("<")
    ? Buffer.from(s.slice(5, -1), "hex").swap16().toString("utf16le")
    : s.slice(1, -1).replace(/\\([\\()])/g, "$1"));
  const key = (s) => s.replace(/\s+/g, "").toLowerCase();
  const byKey = new Map(headings.map((h) => [key(h), h]));

  const objects = new Map();
  const d = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);
  const props = { ...info, Producer: "TAB Human Performance Center (scripts/render-resource-pdf.mjs, Chromium)", CreationDate: `D:${d}Z`, ModDate: `D:${d}Z` };
  objects.set(infoNum, `<<${Object.entries(props).filter(([, v]) => v).map(([k, v]) => `/${k} ${str(v)}`).join("\n")}>>`);

  const item = /(\d+) 0 obj\n<<\/Title (\((?:\\.|[^\\)])*\)|<FEFF[0-9A-Fa-f]*>)([^]*?)>>\nendobj/g;
  for (const [, num, raw, rest] of text.matchAll(item)) {
    if (Number(num) === infoNum || !rest.includes("/Parent")) continue;
    const title = decode(raw);
    const heading = byKey.get(key(title));
    if (heading && heading !== title) objects.set(Number(num), `<</Title ${str(heading)}${rest}>>`);
  }

  let body = "";
  const xref = [];
  for (const [num, dict] of [...objects].sort(([a], [b]) => a - b)) {
    xref.push(`${num} 1\n${String(pdf.length + body.length + 1).padStart(10, "0")} 00000 n \n`);
    body += `\n${num} 0 obj\n${dict}\nendobj\n`;
  }
  const xrefAt = pdf.length + body.length;
  appendFileSync(file, Buffer.from(
    `${body}xref\n0 1\n0000000000 65535 f \n${xref.join("")}trailer\n<</Size ${Math.max(size, infoNum + 1)} /Root ${rootRef} /Info ${infoNum} 0 R /Prev ${prev}>>\nstartxref\n${xrefAt}\n%%EOF\n`,
    "latin1",
  ));
}
