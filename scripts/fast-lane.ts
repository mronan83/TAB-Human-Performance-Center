/**
 * The content fast lane (C32, proposed D-070; .github/workflows/content-fast-lane.yml). After CI passes on a content
 * editor branch, this merges its change request and promotes that exact production build, without a separate approval,
 * when every rule holds:
 *   1. every file it changes is editable content (FAST_LANE_PATHS: the editor's own files, never code or rules);
 *   2. every commit was made by the content editor (keystatic-cloud[bot]) on the owner's behalf: its only co-author is
 *      the owner's GitHub account (FAST_LANE_OWNER). An admin's or anyone else's change keeps the normal approvals;
 *   3. CI passed on the change request's latest commit (the run that started this);
 *   4. the live site is exactly main before the merge, and the merge lands directly on that commit, so nothing else
 *      rides along. Otherwise it merges and leaves the release to the owner with the rest (CLAUDE.md, G3).
 * It needs VERCEL_TOKEN (a GitHub secret, backlog A32); without it the lane stays off and changes wait for approval.
 * If main has moved on since the content branch was made, the merged result is built by Vercel before anything is
 * promoted: a build that fails (the content rules run in it) stops the lane and the live site stays as it was.
 * The rules are pure functions, checked by e2e/fast-lane.spec.ts; the steps below only call GitHub's and Vercel's APIs.
 * Self-contained TypeScript (type annotations only) so Node runs it as is: node --experimental-strip-types.
 */

/** Files the content editor writes (keystatic.config.ts). Anything else, including content/*.ts, is code. */
export const FAST_LANE_PATHS = [
  /^content\/services\/[a-z0-9-]+\.json$/,
  /^content\/massage-techniques\.json$/,
  /^content\/pages\/[a-z0-9-]+\.json$/,
  /^content\/resources\/[a-z0-9-]+\.json$/,
  /^content\/resource-topics\/[a-z0-9-]+\.json$/,
  /^content\/resource-files\/[a-z0-9-]+\/[\w./-]+\.pdf$/,
  /^public\/images\/team\/[\w./-]+\.(jpe?g|png|webp)$/i,
];
export const EDITOR_BOT = "keystatic-cloud[bot]";
export const VERCEL = { teamId: "team_A8TfHlLyTc2toipq0WsMVKvK", projectId: "prj_djrXZfNVt5JmpqUK7w4CjegZSwmf", liveHost: "tab-human-performance-center.vercel.app" };
const MARKER = "<!-- content-fast-lane -->";

export const isContentFile = (path: string): boolean => !path.includes("..") && FAST_LANE_PATHS.some((re) => re.test(path));

/** The GitHub logins named in a commit message's Co-authored-by trailers. */
export function coAuthors(message: string): string[] {
  return [...String(message).matchAll(/^Co-authored-by:\s*([^<\n]+?)\s*</gim)].map((m) => m[1].trim().toLowerCase());
}

/**
 * Whether a change request may take the fast lane. `files` and `commits` are GitHub's pull request files and commits.
 * Returns the reasons it may not, in plain words for the change request's comment.
 */
export type PullFile = { filename: string; previous_filename?: string; status?: string };
export type PullCommit = { sha: string; parents?: unknown[]; commit?: { author?: { name?: string }; message?: string } };

export function eligibility({ files, commits, owner }: { files: PullFile[]; commits: PullCommit[]; owner: string }): { ok: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const want = String(owner || "").toLowerCase();
  if (!want) reasons.push("The fast lane has no owner account configured.");
  if (!files?.length) reasons.push("It changes no files.");
  const outside = (files ?? []).flatMap((f) => [f.filename, f.previous_filename].filter((p): p is string => Boolean(p))).filter((p) => !isContentFile(p));
  if (outside.length) reasons.push(`It changes files outside the editable content: ${[...new Set(outside)].join(", ")}.`);
  if (!commits?.length) reasons.push("It has no commits.");
  for (const c of commits ?? []) {
    const sha = String(c.sha).slice(0, 7);
    if ((c.parents?.length ?? 1) > 1) { reasons.push(`Commit ${sha} is a merge.`); continue; }
    const author = c.commit?.author?.name ?? "";
    const co = coAuthors(c.commit?.message ?? "");
    if (author !== EDITOR_BOT) reasons.push(`Commit ${sha} wasn't made in the content editor.`);
    else if (!co.length || co.some((login) => login !== want)) reasons.push(`Commit ${sha} wasn't made by the owner.`);
  }
  return { ok: reasons.length === 0, reasons };
}

/** Whether the merged build can go live on its own: the live site must be exactly main as it was before the merge. */
export const releasable = ({ liveSha, mainSha }: { liveSha?: string; mainSha: string }): boolean => Boolean(liveSha) && liveSha === mainSha;

// ---------------------------------------------------------------------------------------------------------------------
// The workflow step. Everything below talks to GitHub and Vercel; nothing above does.

const env = (k: string) => process.env[k] ?? "";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Json = any;

async function api(base: string, token: string, path: string, init: RequestInit = {}): Promise<Json> {
  const res = await fetch(`${base}${path}`, { ...init, headers: { authorization: `Bearer ${token}`, accept: "application/json", "content-type": "application/json", ...(init.headers ?? {}) } });
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(`${init.method ?? "GET"} ${path}: ${res.status} ${body?.message ?? body?.error?.message ?? text.slice(0, 200)}`);
  return body;
}

async function main() {
  const repo = env("GITHUB_REPOSITORY");
  const branch = env("HEAD_BRANCH");
  const sha = env("HEAD_SHA");
  const owner = env("FAST_LANE_OWNER");
  const gh = (path: string, init?: RequestInit) => api("https://api.github.com", env("GH_TOKEN"), path, init);
  const vercel = (path: string, init?: RequestInit) => api("https://api.vercel.com", env("VERCEL_TOKEN"), `${path}${path.includes("?") ? "&" : "?"}teamId=${VERCEL.teamId}`, init);
  const say = async (n: number, text: string) => gh(`/repos/${repo}/issues/${n}/comments`, { method: "POST", body: JSON.stringify({ body: `${MARKER}\n${text}\n\n---\n_Content fast lane (content-fast-lane.yml)_` }) });

  if (!branch.startsWith("content/")) return console.log(`${branch} isn't a content branch.`);
  const [pr] = await gh(`/repos/${repo}/pulls?state=open&base=main&head=${encodeURIComponent(`${repo.split("/")[0]}:${branch}`)}`);
  if (!pr) return console.log(`No open change request for ${branch}.`);
  if (pr.head.sha !== sha) return console.log(`#${pr.number} has a newer commit than ${sha.slice(0, 7)}; its own checks decide.`);

  const files = await gh(`/repos/${repo}/pulls/${pr.number}/files?per_page=100`);
  const commits = await gh(`/repos/${repo}/pulls/${pr.number}/commits?per_page=100`);
  const verdict = eligibility({ files, commits, owner });
  if (!verdict.ok) {
    console.log(`#${pr.number} isn't eligible:\n- ${verdict.reasons.join("\n- ")}`);
    const comments = await gh(`/repos/${repo}/issues/${pr.number}/comments?per_page=100`);
    if (!comments.some((c: Json) => c.body?.includes(MARKER) && c.body.includes(sha.slice(0, 7)))) {
      await say(pr.number, `This change needs the owner's approval as usual (checked at ${sha.slice(0, 7)}):\n${verdict.reasons.map((r) => `- ${r}`).join("\n")}`);
    }
    return;
  }
  if (!env("VERCEL_TOKEN")) return console.log("The fast lane isn't switched on yet (no VERCEL_TOKEN secret, backlog A32); this change waits for approval.");

  const live = await vercel(`/v13/deployments/${VERCEL.liveHost}`);
  const mainSha = (await gh(`/repos/${repo}/branches/main`)).commit.sha;
  const goLive = releasable({ liveSha: live.meta?.githubCommitSha, mainSha });
  // DRY_RUN=1: say what would happen, change nothing (for trying the lane on a real change request).
  if (env("DRY_RUN")) return console.log(`Dry run: #${pr.number} qualifies; it would be merged${goLive ? " and promoted" : ", but not promoted (other changes are waiting for release)"}.`);
  const merged = await gh(`/repos/${repo}/pulls/${pr.number}/merge`, { method: "PUT", body: JSON.stringify({ merge_method: "squash", sha, commit_title: `${pr.title} (#${pr.number})` }) });
  console.log(`Merged #${pr.number} as ${merged.sha}.`);
  // If anything else reached main between the check above and this merge, the build would carry it too: don't promote.
  const parent = (await gh(`/repos/${repo}/commits/${merged.sha}`)).parents?.[0]?.sha;
  if (goLive && parent !== mainSha) {
    await say(pr.number, `Merged. **Not live yet:** main moved while this was merging (${String(parent).slice(0, 7)}, not ${mainSha.slice(0, 7)}), so this goes live with the next release the owner promotes.`);
    return;
  }
  if (!goLive) {
    await say(pr.number, `Merged. **Not live yet:** other changes on main are waiting for release (live is ${String(live.meta?.githubCommitSha).slice(0, 7)}, main was ${mainSha.slice(0, 7)}), so this goes live with them when the owner promotes the next release.`);
    return;
  }

  let build: Json;
  for (let i = 0; i < 60 && !build; i++) {
    const { deployments } = await vercel(`/v6/deployments?projectId=${VERCEL.projectId}&target=production&limit=20`);
    const d = (deployments as Json[]).find((x) => x.meta?.githubCommitSha === merged.sha);
    if (d?.state === "ERROR" || d?.state === "CANCELED") throw new Error(`The production build ${d.uid} ended ${d.state}.`);
    if (d?.state === "READY") build = d;
    else await sleep(20_000);
  }
  if (!build) throw new Error(`No ready production build for ${merged.sha} after 20 minutes.`);
  await vercel(`/v10/projects/${VERCEL.projectId}/promote/${build.uid}`, { method: "POST", body: "{}" });
  let now: Json;
  for (let i = 0; i < 30; i++) {
    now = await vercel(`/v13/deployments/${VERCEL.liveHost}`);
    if (now.id === build.uid) break;
    await sleep(10_000);
  }
  if (now?.id !== build.uid) throw new Error(`Promoted ${build.uid}, but the live site still shows ${now?.id}.`);
  await say(pr.number, `**Live.** Merged and promoted ${build.uid} (\`${merged.sha.slice(0, 7)}\`). To undo it, promote the previous build, ${live.id}, or ask Claude to roll back.`);
  console.log(`Live: ${build.uid} (previous ${live.id}).`);
}

if (process.argv[1]?.endsWith("fast-lane.ts")) {
  main().catch((e: Error) => {
    console.error(`::error::${e.message}`);
    process.exit(1);
  });
}
