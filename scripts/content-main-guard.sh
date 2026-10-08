#!/usr/bin/env bash
# Safety net for content saved on main (owner request 2026-10-08; .github/workflows/content-main-guard.yml).
# The content editor refuses to save on main (lib/keystatic-guard.ts); if an editor commit still lands there, this
# reverts it on main and re-applies it on the content/saved-on-main branch, with a change request for review, so
# nothing skips the preview and checks. Only the editor's own commits (keystatic-cloud[bot]) that touch only editable
# content are moved; anything else is left alone and named in the log.
# Usage: content-main-guard.sh <before-sha> <after-sha>. Runs in GitHub Actions on main, with git and gh.
# GUARD_BRANCH names the live branch: main by default; the dry run uses a stand-in.
set -euo pipefail
before="$1"; after="$2"
LIVE="${GUARD_BRANCH:-main}"
BRANCH="content/saved-on-main"
EDITOR_AUTHOR='keystatic-cloud\[bot\]'
CONTENT_PATHS='^(content/|public/images/team/)'

if [ -z "$before" ] || [ "$before" = "0000000000000000000000000000000000000000" ]; then echo "New branch push; nothing to check."; exit 0; fi
mapfile -t found < <(git rev-list --reverse --author="$EDITOR_AUTHOR" "$before..$after")
moves=()
for sha in "${found[@]}"; do
  # A reviewed change request merged onto main can carry the editor as its author: never touch those.
  if git log -1 --format=%s "$sha" | grep -Eq '\(#[0-9]+\)$'; then continue; fi
  merged=$(gh api "repos/$GITHUB_REPOSITORY/commits/$sha/pulls" --jq '[.[] | select(.merged_at != null)] | length' 2>/dev/null || echo 0)
  if [ "${merged:-0}" != "0" ]; then continue; fi
  outside=$(git diff-tree --no-commit-id --name-only -r "$sha" | grep -Ev "$CONTENT_PATHS" || true)
  if [ -n "$outside" ]; then echo "::warning::$sha touches files outside the content folders; left on main for Claude to review: $outside"; continue; fi
  moves+=("$sha")
done
if [ ${#moves[@]} -eq 0 ]; then echo "No content editor saves on main in this push."; exit 0; fi
echo "Moving ${#moves[@]} content editor save(s) off main: ${moves[*]}"

git config user.name "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"

# 1. Take them back out of main, newest first, with a note in each revert.
for (( i=${#moves[@]}-1; i>=0; i-- )); do
  sha="${moves[$i]}"
  git revert --no-edit "$sha"
  git commit --amend -m "Move content editor save off main for review ($(git log -1 --format=%h "$sha"))" \
    -m "Saved on main by the content editor; re-applied on $BRANCH so it gets a preview, the checks and the owner's approval (content-main-guard.yml)." \
    -m "This reverts commit $sha."
done
pushed=""
for attempt in 1 2 3; do
  if git push origin "HEAD:$LIVE"; then pushed=1; break; fi
  echo "$LIVE moved on (attempt $attempt); rebasing the revert"
  git fetch origin "$LIVE" && git rebase "origin/$LIVE"
done
[ -n "$pushed" ] || { echo "::error::Couldn't push the revert to $LIVE"; exit 1; }
main_now=$(git rev-parse HEAD)

# 2. Re-apply them on the review branch: the open one if there is one, else a fresh branch from main.
open=$(gh pr list --head "$BRANCH" --base "$LIVE" --state open --json number --jq '.[0].number // empty')
if [ -n "$open" ] && git fetch origin "$BRANCH"; then
  git checkout -B guard-work FETCH_HEAD
else
  open=""
  git checkout -B guard-work "$main_now"
fi
for sha in "${moves[@]}"; do
  if ! git cherry-pick "$sha"; then
    git cherry-pick --abort
    echo "::error::$sha doesn't apply on $BRANCH; it's reverted on main and still in the history for Claude to re-apply."
    exit 1
  fi
done
git push --force origin "guard-work:$BRANCH"

# 3. The change request, and its checks (pushes made with the workflow token don't start other workflows).
if [ -z "$open" ]; then
  body=$(printf '%s\n' \
    "The content editor saved this on \`main\`, the live website's branch, so it was moved here for review (content-main-guard.yml)." \
    "" \
    "- **What happened:** the save was reverted on \`main\` and re-applied on \`$BRANCH\`. Nothing went live." \
    "- **Next:** check the preview below; the owner approves, Claude merges, and the owner promotes." \
    "- **Next time:** in the editor, choose **New branch** before editing (Website content guide).")
  gh pr create --head "$BRANCH" --base "$LIVE" --title "Content saved on main, moved here for review" --body "$body"
fi
gh workflow run ci.yml --ref "$BRANCH" || echo "::warning::Couldn't start CI on $BRANCH; it will run on the next push."
