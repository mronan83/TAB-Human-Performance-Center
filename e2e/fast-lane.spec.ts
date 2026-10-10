import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import keystaticConfig from "../keystatic.config";
import { EDITOR_BOT, coAuthors, eligibility, isContentFile, isDocsFile, releasable } from "../scripts/fast-lane";

/**
 * The content fast lane's rules (C32, proposed D-070; scripts/fast-lane.mjs): only the owner's own content changes,
 * made in the content editor and touching nothing but content files, go live without a separate approval.
 */
const root = path.resolve(__dirname, "..");
const ownerCommit = (sha: string, msg = "Update content/pages/home") => ({ sha, parents: [{}], commit: { author: { name: EDITOR_BOT }, message: `${msg}\n\nCo-authored-by: mronan83 <matthew@example.com>` } });
const file = (filename: string) => ({ filename, status: "modified" });

test("the fast lane covers exactly the files the content editor writes", () => {
  // Every editor path is covered...
  const editorFiles = [
    ...Object.values(keystaticConfig.singletons ?? {}).map((s) => `${(s as { path: string }).path}.json`),
    ...Object.values(keystaticConfig.collections ?? {}).map((c) => (c as { path: string }).path.replace("*", "some-entry") + ".json"),
    "content/resource-files/your-first-massage/kind/value/file.pdf",
    "public/images/team/members/0/photo.jpg",
  ];
  for (const f of editorFiles) expect(isContentFile(f), f).toBe(true);
  // ...and nothing that is code, rules, configuration or outside the content folders.
  for (const f of ["content/schema.ts", "content/pages.ts", "content/services.ts", "content/images.ts", "keystatic.config.ts", "package.json", ".github/workflows/ci.yml",
    "scripts/fast-lane.mjs", "content/resource-files/x/../../../package.json", "content/resource-files/guide/file.exe", "public/brand/logo.svg", "app/(site)/page.tsx"]) {
    expect(isContentFile(f), f).toBe(false);
  }
  // Every content JSON file in the repository today is one the lane covers.
  const json = fs.readdirSync(path.join(root, "content"), { recursive: true }).map(String).filter((f) => f.endsWith(".json")).map((f) => `content/${f}`);
  expect(json.filter((f) => !isContentFile(f))).toEqual([]);
});

test("only the owner's own editor changes qualify; anything else waits for approval, saying why", () => {
  const owner = "mronan83";
  expect(eligibility({ owner, files: [file("content/pages/home.json")], commits: [ownerCommit("a1"), ownerCommit("a2")] })).toEqual({ ok: true, reasons: [] });
  const admin = { sha: "b1", parents: [{}], commit: { author: { name: EDITOR_BOT }, message: "Update\n\nCo-authored-by: some-admin <a@example.com>" } };
  expect(eligibility({ owner, files: [file("content/pages/home.json")], commits: [ownerCommit("a1"), admin] }).reasons).toEqual(["Commit b1 wasn't made by the owner."]);
  const byHand = { sha: "c1", parents: [{}], commit: { author: { name: "mronan83" }, message: "Edit on github.com" } };
  expect(eligibility({ owner, files: [file("content/pages/home.json")], commits: [byHand] }).reasons).toEqual(["Commit c1 wasn't made in the content editor."]);
  const noCoAuthor = { sha: "d1", parents: [{}], commit: { author: { name: EDITOR_BOT }, message: "Update" } };
  expect(eligibility({ owner, files: [file("content/pages/home.json")], commits: [noCoAuthor] }).ok).toBe(false);
  const merge = { ...ownerCommit("e1"), parents: [{}, {}] };
  expect(eligibility({ owner, files: [file("content/pages/home.json")], commits: [merge] }).reasons).toEqual(["Commit e1 is a merge."]);
  const code = eligibility({ owner, files: [file("content/pages/home.json"), file("content/schema.ts")], commits: [ownerCommit("f1")] });
  expect(code.reasons).toEqual(["It changes files outside the editable content: content/schema.ts."]);
  const renamedFromCode = eligibility({ owner, files: [{ filename: "content/pages/x.json", previous_filename: "lib/x.ts", status: "renamed" }], commits: [ownerCommit("g1")] });
  expect(renamedFromCode.ok).toBe(false);
  expect(eligibility({ owner: "", files: [file("content/pages/home.json")], commits: [ownerCommit("h1")] }).ok).toBe(false);
  expect(coAuthors("x\n\nCo-authored-by: MRonan83 <m@x>\nCo-authored-by: Other Person <o@x>")).toEqual(["mronan83", "other person"]);
});

test("a fast-lane change goes live on its own only when nothing that changes the site is waiting for release", () => {
  expect(releasable({ liveSha: "abc", mainSha: "abc" })).toBe(true);
  expect(releasable({ liveSha: "abc", mainSha: "def" })).toBe(false); // a merged PR or a save waits for the owner's promotion
  expect(releasable({ liveSha: undefined, mainSha: "def" })).toBe(false);
  // Documentation waiting since the last release never reaches the website, so it doesn't hold the owner's edit (C41).
  const docs = (...names: string[]) => ({ status: "ahead", files: names.map((filename) => ({ filename })) });
  expect(releasable({ liveSha: "abc", mainSha: "def", waiting: docs("docs/BACKLOG.md", "docs/images/content-guide/editor-resource.png", "CLAUDE.md") })).toBe(true);
  expect(releasable({ liveSha: "abc", mainSha: "def", waiting: docs("docs/BACKLOG.md", "lib/resources.ts") })).toBe(false);
  expect(releasable({ liveSha: "abc", mainSha: "def", waiting: docs("content/pages/home.json") })).toBe(false); // someone else's content
  expect(releasable({ liveSha: "abc", mainSha: "def", waiting: { status: "ahead", files: [{ filename: "docs/old.md", previous_filename: "app/page.tsx" }] } })).toBe(false);
  expect(releasable({ liveSha: "abc", mainSha: "def", waiting: { ...docs("docs/BACKLOG.md"), status: "diverged" } })).toBe(false); // live isn't behind main
  expect(releasable({ liveSha: "abc", mainSha: "def", waiting: docs() })).toBe(false);
  expect(releasable({ liveSha: "abc", mainSha: "def", waiting: docs(...Array.from({ length: 300 }, (_, i) => `docs/${i}.md`)) })).toBe(false); // too long to check
  for (const f of ["docs/TRACEABILITY.md", "docs/source/batch-5/x.pdf", "README.md", "CLAUDE.md"]) expect(isDocsFile(f), f).toBe(true);
  for (const f of ["app/docs/page.tsx", "public/docs/a.md", "content/pages/home.json", "docs/../app/page.tsx", "package.json"]) expect(isDocsFile(f), f).toBe(false);
});

test("the workflow runs main's copy of the lane, only after CI passes on a content branch", () => {
  const wf = fs.readFileSync(path.join(root, ".github/workflows/content-fast-lane.yml"), "utf8");
  expect(wf).toContain("workflow_run:");
  expect(wf).toContain("github.event.workflow_run.conclusion == 'success'");
  expect(wf).toContain("startsWith(github.event.workflow_run.head_branch, 'content/')");
  expect(wf).not.toMatch(/ref:\s*\$\{\{\s*github\.event\.workflow_run\.head/); // never checks out the content branch's code
  expect(wf).toContain("secrets.VERCEL_TOKEN");
});
