import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end launch checks (NFR-007, NFR-008; S19 §19.15 critical smoke tests, final redirect test, link crawl).
 * By default they run against a local production build (`npm run build` first). Set E2E_BASE_URL to run them
 * against a deployment; for protected Vercel previews also set VERCEL_AUTOMATION_BYPASS_SECRET.
 * No retries: a failure is a finding, not a flake.
 */
const PORT = 3100;
export const LIBRARY_FIXTURES = "e2e/fixtures/resource-library";
const external = process.env.E2E_BASE_URL;
const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["github"], ["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: external ?? `http://localhost:${PORT}`,
    extraHTTPHeaders: bypass ? { "x-vercel-protection-bypass": bypass, "x-vercel-set-bypass-cookie": "true" } : undefined,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] }, testIgnore: /settings\.spec\.ts/ },
    // Owner settings change the whole demo site (banner, pages, Book links), so they run alone, after everything else.
    { name: "settings", use: { ...devices["Desktop Chrome"] }, testMatch: /settings\.spec\.ts/, dependencies: ["chromium"] },
  ],
  webServer: external
    ? undefined
    : {
        command: `npx next start -p ${PORT}`, url: `http://localhost:${PORT}`, reuseExistingServer: !process.env.CI, timeout: 120_000,
        // The resource library's fixture copy (lib/resources.ts): build with the same setting (ci.yml) so the page matches.
        env: { ...(process.env as Record<string, string>), RESOURCE_LIBRARY_ROOT: LIBRARY_FIXTURES },
      },
});
