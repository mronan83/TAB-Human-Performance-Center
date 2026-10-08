/**
 * Saving on `main` is turned off in the content editor (owner request 2026-10-08, after two saves landed there and
 * skipped review). Keystatic always lets an editor save on the repository's default branch, and GitHub can't refuse it
 * on this plan (A34 declined), so /keystatic wraps the browser's fetch: a commit Keystatic sends for `main` (its
 * `createCommitOnBranch` GraphQL mutation) gets a GraphQL error back instead of reaching GitHub, and the editor shows
 * it. Creating a branch and saving on one pass through untouched. `.github/workflows/content-main-guard.yml` catches
 * anything that still reaches `main` some other way. Pure, so e2e/content.spec.ts checks it against Keystatic's own
 * request shape.
 */
export const PROTECTED_BRANCH = "main";
export const BLOCKED_MESSAGE =
  "Saving on main is turned off: main is the live website. Open the branch menu, choose New branch, give your change a short name, then save again.";

type GraphQLRequest = { query?: unknown; variables?: { input?: { branch?: { branchName?: unknown } } } };

/** True when a request body is a Keystatic commit to the protected branch. Anything unreadable passes through. */
export function isCommitToProtectedBranch(body: unknown, protectedBranch = PROTECTED_BRANCH): boolean {
  if (typeof body !== "string" || !body.includes("createCommitOnBranch")) return false;
  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    return false;
  }
  const ops = (Array.isArray(parsed) ? parsed : [parsed]) as GraphQLRequest[];
  return ops.some((op) => typeof op?.query === "string" && op.query.includes("createCommitOnBranch") && op.variables?.input?.branch?.branchName === protectedBranch);
}

/** The reply the editor gets instead of GitHub's: a GraphQL error carrying the instructions. */
export function blockedResponse(): Response {
  return new Response(JSON.stringify({ data: null, errors: [{ message: BLOCKED_MESSAGE, extensions: { code: "TAB_MAIN_PROTECTED" } }] }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

/** Wraps a fetch so commits to the protected branch never leave the browser. Calls `onBlocked` each time it refuses. */
export function guardFetch(inner: typeof fetch, onBlocked: () => void = () => {}): typeof fetch {
  return async (input, init) => {
    let body: unknown = init?.body;
    if (body === undefined && typeof Request !== "undefined" && input instanceof Request) body = await input.clone().text().catch(() => undefined);
    if (isCommitToProtectedBranch(body)) {
      onBlocked();
      return blockedResponse();
    }
    return inner(input, init);
  };
}

/** True when the editor is showing the protected branch (its addresses are /keystatic/branch/<name>/…). */
export const onProtectedBranch = (pathname: string, protectedBranch = PROTECTED_BRANCH) =>
  new RegExp(`^/keystatic/branch/${encodeURIComponent(protectedBranch)}(/|$)`).test(pathname);
