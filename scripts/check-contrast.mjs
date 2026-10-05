#!/usr/bin/env node
// WCAG 2.2 AA contrast check for the design tokens (DS-005, CON-011).
//
// Reads the color custom properties from the @theme block in app/globals.css and checks every
// pairing the design system permits. Add a pairing here before using a new text/background or
// UI-boundary combination in a component. Clay, Sage and Ochre are decorative only and therefore
// never appear as text or behind white text below.

import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
const theme = css.match(/@theme\s*{([\s\S]*?)\n}/)?.[1] ?? "";
const tokens = Object.fromEntries(
  [...theme.matchAll(/--color-([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)].map(([, name, hex]) => [name, hex]),
);

const TEXT = 4.5; // 1.4.3 normal text
const UI = 3; // 1.4.11 non-text: component boundaries and focus indicators

const pairings = [
  // Body and secondary text on every light field
  ...["background", "surface", "surface-muted", "surface-warm"].flatMap((bg) => [
    ["text-primary", bg, TEXT],
    ["text-secondary", bg, TEXT],
  ]),
  // Text on tinted accent fields
  ["text-primary", "accent-soft", TEXT],
  ["secondary-hover", "accent-soft", TEXT], // accent badge
  ["success", "success-soft", TEXT], // portal confirmations
  ["text-primary", "success-soft", TEXT],
  ...["text-primary", "text-secondary"].map((fg) => [fg, "note-soft", TEXT]), // notes shared with the client
  ["text-primary", "warning-soft", TEXT],
  // White/bone text on filled controls and dark fields
  ...["primary", "primary-hover", "primary-active", "secondary", "secondary-hover", "surface-brand", "graphite"].map(
    (bg) => ["white", bg, TEXT],
  ),
  ["bone", "surface-brand", TEXT],
  // Links and interactive text
  ...["background", "surface", "surface-muted"].map((bg) => ["primary", bg, TEXT]),
  ...["background", "surface"].map((bg) => ["secondary", bg, TEXT]),
  // Status text
  ...["danger", "success", "warning"].flatMap((fg) => ["background", "surface"].map((bg) => [fg, bg, TEXT])),
  // Form-field boundaries
  ...["background", "surface", "surface-muted"].map((bg) => ["border-input", bg, UI]),
  // Focus indicators: default ring on light fields, inverse ring on dark fields
  ...["background", "surface", "surface-muted"].map((bg) => ["focus", bg, UI]),
  ...["surface-brand", "primary", "graphite"].map((bg) => ["focus-inverse", bg, UI]),
];

const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

let failures = 0;
for (const [fg, bg, min] of pairings) {
  if (!tokens[fg] || !tokens[bg]) {
    console.log(`MISSING  --color-${!tokens[fg] ? fg : bg} is not defined in app/globals.css`);
    failures++;
    continue;
  }
  const r = ratio(tokens[fg], tokens[bg]);
  const ok = r >= min;
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${r.toFixed(2).padStart(5)}:1 (min ${min})  ${fg} on ${bg}`);
}

console.log(`\n${pairings.length - failures}/${pairings.length} pairings meet WCAG 2.2 AA`);
process.exit(failures ? 1 : 0);
