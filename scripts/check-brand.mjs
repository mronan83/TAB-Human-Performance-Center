#!/usr/bin/env node
// Brand consistency (owner, 2026-10-05: "We can't have misaligned verbiage and content").
//
// Fails when a retired name, the old philosophy, an old service name or a wrong pillar count appears anywhere in the
// site's source: pages, components, content, config, the portal and emails. The pillar count is read from
// content/services.ts, so adding or removing a pillar moves the expected number with it. Legacy redirect keys
// (old URLs we must keep answering) are the only allowed mentions, listed in ALLOW below.
//
//   npm run test:brand

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const DIRS = ["app", "components", "lib", "content", "config"];
const EXT = /\.(ts|tsx|mjs|js)$/;

const services = readFileSync(join(root, "content/services.ts"), "utf8");
const pillars = (services.match(/^ {4}slug: "/gm) ?? []).length;
const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
const countWord = `(?:${WORDS.join("|")}|\\d+)`;

const RULES = [
  { name: "retired name", re: /Wellness Collective/i },
  { name: "retired name", re: /Human Performance Practice/i },
  { name: "retired name", re: /\bTAB (?:HPC|HPP)\b/ },
  { name: "old philosophy", re: /Transform\W+Align|Align\W+Become/i },
  { name: "old stage name", re: /\b(?:Align|Become)\b/ },
  { name: "old service name", re: /Personal Strength Training/i },
  { name: "retired plan name (now TAB Performance Plan)", re: /(?<!Women['’]s )Wellness Plan/i },
  { name: "old service name", re: /Wellness Coaching/i },
  { name: "old master category", re: /whole-person wellness|stronger bodies and fuller lives/i },
  { name: "wrong coaching count", re: /\bboth coaching\b/i },
  {
    name: `wrong pillar count (there are ${pillars})`,
    re: new RegExp(`(?<!(?:Step|§|S)\\s?)\\b(${countWord})\\b(?:\\W+(?:connected|integrated|service|equally|weighted|core|distinct)){0,3}\\W+(?:pillars?|areas of support|services? pillars)\\b`, "i"),
    check: (m) => WORDS.indexOf(m[1].toLowerCase()) !== pillars && Number(m[1]) !== pillars,
  },
  {
    name: `wrong pillar count (there are ${pillars})`,
    re: /\["(One|Two|Three|Four|Six|Seven)",\s*"Connected service pillars"\]/,
  },
];

// Old URLs the redirect map must keep answering, and the domain placeholder (backlog A1).
const ALLOW = [
  { file: "config/redirects.ts", re: /personal-strength-training|womens-wellness-coaching/ },
];

const files = [];
const walk = (d) => {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (EXT.test(f)) files.push(p);
  }
};
DIRS.forEach((d) => walk(join(root, d)));

let failures = 0;
for (const file of files) {
  const rel = relative(root, file);
  readFileSync(file, "utf8").split("\n").forEach((line, i) => {
    for (const rule of RULES) {
      const m = line.match(rule.re);
      if (!m || (rule.check && !rule.check(m))) continue;
      if (ALLOW.some((a) => a.file === rel && a.re.test(line))) continue;
      failures++;
      console.log(`FAIL  ${rel}:${i + 1}  ${rule.name}: "${m[0]}"`);
    }
  });
}
console.log(failures ? `\n${failures} brand inconsistencies` : `Brand language consistent across ${files.length} files (${pillars} pillars).`);
process.exit(failures ? 1 : 0);
