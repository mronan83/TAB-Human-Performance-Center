#!/usr/bin/env node
// Renders the Supabase Auth emails (content/auth-emails.ts) in the shared branded layout (lib/email-template.ts) and,
// with --push, installs them on the TAB Supabase project (owner request 2026-10-06). Supabase can't attach files, so
// the logo is the same PNG as our other emails (lib/email-logo.ts), hosted in a public Storage bucket: the site itself
// stays behind Vercel login until launch, and an email image there would not load.
//
//   npm run emails:supabase -- --out <dir>   preview page with sample values (for review)
//   npm run emails:supabase -- --push        upload the logo, then set the subjects, templates and sender name
//
// --push needs SUPABASE_ACCESS_TOKEN (allowed org only, CLAUDE.md). It reads the project's service key through the
// Management API to upload the logo and never prints it.
import { createJiti } from "jiti";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const REF = "vpaaeblqndcenftrfrms"; // TAB Wellness Collective Website (CLAUDE.md: the only allowed project)
const PROJECT_URL = `https://${REF}.supabase.co`;
const BUCKET = "brand";
const LOGO_PATH = "email-logo.png";
const LOGO_URL = `${PROJECT_URL}/storage/v1/object/public/${BUCKET}/${LOGO_PATH}`;

const root = fileURLToPath(new URL("..", import.meta.url));
const jiti = createJiti(import.meta.url, { alias: { "@": root } });
const { authEmails } = await jiti.import("../content/auth-emails.ts");
const { renderEmail } = await jiti.import("../lib/email-template.ts");
const { EMAIL_LOGO } = await jiti.import("../lib/email-logo.ts");
const { siteConfig, siteUrl } = await jiti.import("../config/site.ts");

const rendered = Object.entries(authEmails).map(([key, e]) => ({ key, subject: e.subject, html: renderEmail(e.content, { logoSrc: LOGO_URL }).html }));

// Every variable a template uses must be one Supabase provides for it, or the email goes out with a blank.
const VARS = { ConfirmationURL: 1, Token: 1, TokenHash: 1, RedirectTo: 1, NewEmail: 1, Email: 1, OldEmail: 1, Provider: 1, SiteURL: 1 };
for (const r of rendered) {
  for (const [, name] of r.html.matchAll(/\{\{\s*\.(\w+)\s*\}\}/g)) {
    if (!VARS[name]) throw new Error(`${r.key}: unknown Supabase variable {{ .${name} }}`);
  }
  if (/\{\{/.test(r.subject)) throw new Error(`${r.key}: subjects stay generic (guardrail 5)`);
}

const args = process.argv.slice(2);
const outIdx = args.indexOf("--out");

if (outIdx >= 0) {
  const dir = args[outIdx + 1];
  if (!dir) throw new Error("--out needs a folder");
  mkdirSync(dir, { recursive: true });
  const sample = {
    ConfirmationURL: `${siteUrl}/practice/auth/callback`,
    RedirectTo: `${siteUrl}/practice/auth/callback`,
    TokenHash: "pkce_3f2a9c0e7b1d",
    Token: "48213907",
    NewEmail: "new.address@example.com",
    Email: "you@example.com",
    OldEmail: "old.address@example.com",
    Provider: "Google",
    SiteURL: siteUrl,
  };
  const logo = `data:image/png;base64,${EMAIL_LOGO.base64}`; // the hosted copy may not exist yet when reviewing
  const fill = (s) => s.replace(/\{\{\s*\.(\w+)\s*\}\}/g, (_, n) => sample[n]).replaceAll(LOGO_URL, logo);
  const cards = rendered
    .map(
      (r) => `<section><h2>${r.key.replaceAll("_", " ")}</h2><p class="subj">Subject: <b>${r.subject}</b></p>` +
        `<iframe title="${r.key}" srcdoc="${fill(r.html).replaceAll("&", "&amp;").replaceAll('"', "&quot;")}"></iframe></section>`,
    )
    .join("\n");
  writeFileSync(
    join(dir, "supabase-emails.html"),
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>TAB Sign-in Emails</title><style>
:root{--bg:#FBF6F1;--ink:#2E2E2E;--muted:#5A5953;--line:#D8D2C6}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){--bg:#232323;--ink:#F4F1EC;--muted:#C9C4BA;--line:#444}}
:root[data-theme="dark"]{--bg:#232323;--ink:#F4F1EC;--muted:#C9C4BA;--line:#444}
body{margin:0;background:var(--bg);color:var(--ink);font-family:Montserrat,Helvetica,Arial,sans-serif}
main{max-width:1320px;margin:0 auto;padding:32px 16px}h1{font-family:Spectral,Georgia,serif;font-weight:500;font-size:34px;margin:0 0 8px}
.lead{color:var(--muted);max-width:70ch;margin:0 0 28px;line-height:1.6}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,620px),1fr));gap:24px}
section{border:1px solid var(--line);border-radius:16px;padding:16px;overflow:hidden}h2{font-size:13px;letter-spacing:1.4px;text-transform:uppercase;margin:0 0 6px}
.subj{margin:0 0 12px;color:var(--muted);font-size:14px}iframe{width:100%;height:640px;border:0;border-radius:10px;background:#FBF6F1}
</style></head><body><main><h1>Sign-in and account emails</h1>
<p class="lead">The ${rendered.length} emails Supabase sends for ${siteConfig.brand.name}, in the same layout as the website emails. Sample values stand in for the real link, code and addresses. The two most people will see are the sign-in link and the My TAB invitation.</p>
<div class="grid">${cards}</div></main></body></html>`,
  );
  console.log(`Preview: ${rendered.length} emails → ${join(dir, "supabase-emails.html")}`);
}

if (args.includes("--push")) {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  if (!token) throw new Error("SUPABASE_ACCESS_TOKEN is not set");
  const api = async (method, path, body) => {
    const res = await fetch(`https://api.supabase.com/v1/projects/${REF}${path}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(`${method} ${path}: ${res.status} ${(await res.text()).slice(0, 300)}`);
    return res.json();
  };

  // 1. The logo, in a public bucket that holds brand artwork only (no client files ever go here).
  const keys = await api("GET", "/api-keys?reveal=true");
  const service = keys.find((k) => k.name === "service_role")?.api_key;
  if (!service) throw new Error("service key not found");
  const storage = (path, init) => fetch(`${PROJECT_URL}/storage/v1${path}`, { ...init, headers: { apikey: service, Authorization: `Bearer ${service}`, ...init.headers } });
  const bucket = await storage(`/bucket/${BUCKET}`, { method: "GET" });
  if (bucket.status !== 200) {
    const made = await storage("/bucket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true, allowed_mime_types: ["image/png"], file_size_limit: 1048576 }),
    });
    if (!made.ok) throw new Error(`create bucket: ${made.status} ${await made.text()}`);
  }
  const up = await storage(`/object/${BUCKET}/${LOGO_PATH}`, {
    method: "POST",
    headers: { "Content-Type": "image/png", "x-upsert": "true", "Cache-Control": "max-age=86400" },
    body: Buffer.from(EMAIL_LOGO.base64, "base64"),
  });
  if (!up.ok) throw new Error(`upload logo: ${up.status} ${await up.text()}`);
  const check = await fetch(LOGO_URL);
  if (!check.ok || check.headers.get("content-type") !== "image/png") throw new Error(`logo not public: ${check.status}`);

  // 2. Subjects, templates and the sender name (always the full name, guardrail 1).
  const patch = { smtp_sender_name: siteConfig.brand.name };
  for (const r of rendered) {
    patch[`mailer_subjects_${r.key}`] = r.subject;
    patch[`mailer_templates_${r.key}_content`] = r.html;
  }
  const after = await api("PATCH", "/config/auth", patch);
  const wrong = Object.keys(patch).filter((k) => after[k] !== patch[k]);
  if (wrong.length) throw new Error(`not applied: ${wrong.join(", ")}`);
  console.log(`Pushed ${rendered.length} templates, subjects and the sender name; logo at ${LOGO_URL}`);
}

if (outIdx < 0 && !args.includes("--push")) console.log(`Checked ${rendered.length} templates. Use --out <dir> to preview or --push to install.`);
