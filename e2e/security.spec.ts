import { expect, test, type Page } from "@playwright/test";
import { extraPages, sitemapPaths } from "./helpers";

/**
 * SEC-013: every page sends a Content-Security-Policy (lib/csp.ts), nothing the site loads breaks it, and the
 * Next.js client still starts under it. The portal runs in demo mode here (local builds are not production).
 */

const clientPages = ["/my-tab", "/my-tab/plan", "/my-tab/programs", "/my-tab/progress", "/my-tab/appointments", "/my-tab/resources", "/my-tab/forms", "/my-tab/billing", "/my-tab/profile"];
const staffPages = ["/practice", "/practice/programs", "/practice/inquiries", "/practice/clients/demo-client-dana", "/practice/clients/demo-client-dana/review", "/practice/clients/demo-client-dana/plans/plan-dana-massage", "/practice/clients/demo-client-dana/programs/new?template=tpl-rest-reset", "/practice/clients/demo-client-dana/programs/cp-strength", "/practice/programs/new", "/practice/programs/tpl-desk-reset", "/practice/programs/tpl-strength-foundations", "/practice/team"];

/** Records CSP violations from the moment each document is created. */
const watchViolations = async (page: Page) => {
  const seen: string[] = [];
  page.on("console", (m) => { if (m.text().includes("Content Security Policy")) seen.push(m.text().slice(0, 200)); });
  await page.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (e) => console.error(`Content Security Policy: ${e.violatedDirective} blocked ${e.blockedURI || "inline"}`));
  });
  return seen;
};

/** The App Router sets window.next once its client scripts have run; blocked scripts leave it unset. */
const clientStarted = (page: Page) => page.waitForFunction(() => !!(window as unknown as { next?: unknown }).next, null, { timeout: 10_000 });

test("public pages: policy sent, no violations, Next.js client starts", async ({ page, request }) => {
  test.setTimeout(120_000);
  const seen = await watchViolations(page);
  for (const path of [...(await sitemapPaths(request)), ...extraPages]) {
    const res = await page.goto(path);
    const csp = res?.headers()["content-security-policy"] ?? "";
    expect(csp, path).toContain("frame-ancestors 'none'");
    expect(csp, path).toContain("object-src 'none'");
    expect(csp, path).not.toContain("'unsafe-eval'");
    await clientStarted(page);
  }
  expect(seen, seen.join("\n")).toEqual([]);
});

test("portal pages: fresh nonce per request, scripts carry it, no violations", async ({ page, context, request, baseURL }) => {
  test.setTimeout(90_000);
  const nonceOf = (csp: string) => /'nonce-([^']+)'/.exec(csp)?.[1];
  const [a, b] = await Promise.all([request.get("/my-tab"), request.get("/my-tab")]);
  const [na, nb] = [nonceOf(a.headers()["content-security-policy"] ?? ""), nonceOf(b.headers()["content-security-policy"] ?? "")];
  expect(na, "portal CSP has a nonce").toBeTruthy();
  expect(na).not.toBe(nb);
  expect(a.headers()["content-security-policy"]).toContain("'strict-dynamic'");
  expect(/script-src ([^;]*)/.exec(a.headers()["content-security-policy"] ?? "")?.[1]).not.toContain("'unsafe-inline'");
  const html = await a.text();
  expect(html).toContain(`nonce="${na}"`);

  const seen = await watchViolations(page);
  await context.addCookies([{ name: "tab_demo_role", value: "client", url: baseURL! }]);
  for (const path of clientPages) {
    await page.goto(path);
    await clientStarted(page);
  }
  await context.addCookies([{ name: "tab_demo_role", value: "owner", url: baseURL! }]);
  for (const path of staffPages) {
    await page.goto(path);
    await clientStarted(page);
  }
  expect(seen, seen.join("\n")).toEqual([]);
});

test("pages can't be framed by other sites (clickjacking)", async ({ request }) => {
  for (const path of ["/", "/start", "/my-tab"]) {
    // maxRetries retries only a network error such as a reused keep-alive socket the server already closed (ECONNRESET,
    // seen on CI 2026-10-07), never a status (see links.spec.ts).
    const h = (await request.get(path, { maxRetries: 2 })).headers();
    expect(h["x-frame-options"], path).toBe("DENY");
    expect(h["content-security-policy"], path).toContain("frame-ancestors 'none'");
  }
});
