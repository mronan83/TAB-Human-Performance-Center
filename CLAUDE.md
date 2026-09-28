# TAB Wellness Collective — operating rules for Claude

Public website and client portal for TAB Wellness Collective. Claude acts as principal
engineer, tester and deployment manager; the owner (Matthew Ronan) approves at review gates.

## Cloud accounts — hard rules

Only these accounts may be used for this project:

| Service  | Allowed                                                                 |
|----------|-------------------------------------------------------------------------|
| Vercel   | Team `tab-wellness-collective` (`team_5I53XjJhXpJmwzAyhKU7I7Fi`)        |
| Supabase | Org `TAB Wellness Collective` (`zkzjplwevlkpufogkdmh`)                  |
|          | Project `vpaaeblqndcenftrfrms` ("TAB Wellness Collective Website", us-east-1) |

Never create, modify, deploy to or read data from these (the owner's other accounts):

- Vercel team `team_A8TfHlLyTc2toipq0WsMVKvK` ("mronan83's projects"), including its
  unrelated project also named `tab-wellness-collective` (`prj_SqUFclQhmnpWyxLzG2wjAx2wgtz6`).
- Supabase org `ezvgbzioftldoydozvfd` ("MOO") and its projects `fxaixvudbwlgocqpyhqz`,
  `mhlacualaabkvdelsfmr` (WayPoint).

The claude.ai **Vercel and Supabase MCP connectors are signed in to the forbidden accounts**.
Do not use them for this project. Use the REST APIs or CLIs with the environment variables
`VERCEL_TOKEN` and `SUPABASE_ACCESS_TOKEN`, which belong to the allowed accounts, and always
pass the team ID / project ref explicitly. Never print, log or commit token values.

## Branches and review gates

- `main` is the default branch. Work happens on `claude/*` branches and lands via PR.
- GitHub does not enforce branch protection on this private repo on the free plan. For Claude
  sessions the rule is enforced by the PreToolUse hook `.claude/hooks/guard-main.mjs`
  (blocks pushes to `main`, PR merges and auto-merge). Do not disable or work around it.
  Revisit GitHub-side protection when paid plans are bought for go-live.
- G1 Design — architecture, data model and plan approved before build.
- G2 Pull request — owner reviews each PR on its Vercel preview URL; CI must be green.
- G3 Release — owner approves every production promotion and every production migration.
- Never push directly to `main` or run a production migration without G3 approval.

## Requirements intake

- Source documents from the owner are stored under `docs/source/batch-N/`.
- Requirements are tracked with stable IDs in `docs/requirements-register.md`; conflicts,
  gaps and assumptions are logged there, never resolved silently.

## Secrets

Never commit `.env*` files, keys, tokens or database passwords. Local values go in
`.env.local` (git-ignored); deployed values live in Vercel / Supabase / GitHub secrets.
