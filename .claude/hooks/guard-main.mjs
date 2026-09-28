#!/usr/bin/env node
// PreToolUse guard: keeps Claude from changing `main` directly.
//
// GitHub cannot enforce branch protection on this private repo on the current
// (free) plan, so this hook is the enforced control for Claude sessions:
//   - Bash: blocks `git push` that would update or delete `main`.
//   - GitHub MCP: blocks merging PRs / enabling auto-merge (the owner's review
//     gate) and file writes whose target branch is `main`.
// Everything else passes through untouched.

import { execFileSync } from "node:child_process";

const PROTECTED = "main";

const deny = (reason) => {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: `${reason} See CLAUDE.md: work on a claude/* branch and open a PR; the owner merges.`,
      },
    }),
  );
  process.exit(0);
};

const isProtected = (ref) =>
  ref.replace(/^\+/, "").replace(/^refs\/heads\//, "") === PROTECTED;

const currentBranch = (cwd) => {
  try {
    return execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
};

// Push options that consume the following token as their value.
const VALUE_FLAGS = new Set(["-o", "--push-option", "--repo", "--receive-pack", "--exec"]);

function checkGitPush(command, cwd) {
  // Split on shell separators; each segment is checked on its own.
  for (const segment of command.split(/&&|\|\||[;|\n]/)) {
    const tokens = segment.trim().replace(/["']/g, "").split(/\s+/).filter(Boolean);
    const gitIdx = tokens.indexOf("git");
    if (gitIdx === -1) continue;

    // Allow `git -C <dir> push` and similar global options before the subcommand.
    let i = gitIdx + 1;
    let dir = cwd;
    while (i < tokens.length && tokens[i].startsWith("-")) {
      if (tokens[i] === "-C") dir = tokens[++i] ?? dir;
      else if (tokens[i] === "-c") i++;
      i++;
    }
    if (tokens[i] !== "push") continue;

    const positional = [];
    for (let j = i + 1; j < tokens.length; j++) {
      const t = tokens[j];
      if (t === "--all" || t === "--mirror" || t === "--branches") {
        deny(`Blocked \`git push ${t}\`: it would push ${PROTECTED}.`);
      }
      if (VALUE_FLAGS.has(t)) {
        j++;
        continue;
      }
      if (t.startsWith("-")) continue;
      positional.push(t);
    }

    const refspecs = positional.slice(1); // first positional is the remote
    const branch = currentBranch(dir);
    if (refspecs.length === 0) {
      if (branch === PROTECTED) deny(`Blocked \`git push\` while on ${PROTECTED}.`);
      continue;
    }
    for (const spec of refspecs) {
      const src = spec.includes(":") ? spec.slice(0, spec.indexOf(":")) : spec;
      const dst = spec.includes(":") ? spec.slice(spec.indexOf(":") + 1) : spec;
      if (isProtected(dst)) deny(`Blocked push to ${PROTECTED} (refspec \`${spec}\`).`);
      if (!spec.includes(":") && src.replace(/^\+/, "") === "HEAD" && branch === PROTECTED) {
        deny(`Blocked \`git push ... HEAD\` while on ${PROTECTED}.`);
      }
    }
  }
}

function checkGitHubTool(toolName, input) {
  const action = toolName.split("__").pop();
  if (action === "merge_pull_request" || action === "enable_pr_auto_merge") {
    deny(`Blocked ${action}: merging is the owner's review gate (G2).`);
  }
  if (["create_or_update_file", "push_files", "delete_file"].includes(action)) {
    // A missing branch means the repo's default branch, which is main.
    if (!input?.branch || isProtected(String(input.branch))) {
      deny(`Blocked ${action} on ${PROTECTED}.`);
    }
  }
}

let raw = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => (raw += chunk));
process.stdin.on("end", () => {
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    process.exit(0); // Unparseable input: nothing to judge.
  }
  const { tool_name: toolName = "", tool_input: input = {}, cwd = process.cwd() } = payload;
  if (toolName === "Bash" && typeof input.command === "string") checkGitPush(input.command, cwd);
  else if (/github/i.test(toolName)) checkGitHubTool(toolName, input);
  process.exit(0);
});
