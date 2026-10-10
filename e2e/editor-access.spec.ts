import { expect, test, type BrowserContext } from "@playwright/test";
import { afterSignIn, canEditWebsite, editorGate, nextParam, nextQuery } from "../lib/editor-access";
import type { Viewer } from "../lib/portal/types";

/**
 * The content editor's front door (C38, owner ruling 2026-10-10, proposed D-077): /keystatic opens only for the owner and
 * website admins, signed in to TAB Practice with two-step verification; sign-in brings them back to it. The browser tests
 * run on the demo sign-in (the chooser), where the editor shows its "not connected" page.
 */
const as = (context: BrowserContext, baseURL: string, role: "owner" | "admin" | "client") => context.addCookies([{ name: "tab_demo_role", value: role, url: baseURL }]);
const viewer = (role: Viewer["role"], staffVerified?: boolean): Viewer => ({ userId: "u", role, name: "x", staffVerified });

test("who may open the editor, and where everyone else is sent", () => {
  // Real sign-in (production): sign in, verify, then straight back to the editor.
  expect(editorGate(null, false)).toBe("/practice/login?next=editor");
  expect(editorGate(viewer("client"), false)).toBe("/practice/login?e=staff&next=editor");
  expect(editorGate(viewer("owner", false), false)).toBe("/practice/verify?next=editor");
  expect(editorGate(viewer("admin", false), false)).toBe("/practice/verify?next=editor");
  expect(editorGate(viewer("practitioner", true), false)).toBe("/practice/website?e=editor");
  expect(editorGate(viewer("owner", true), false)).toBeNull();
  expect(editorGate(viewer("admin", true), false)).toBeNull();
  // Demo sign-in (previews and tests): the chooser.
  expect(editorGate(null, true)).toBe("/my-tab/login");
  expect(editorGate(viewer("client"), true)).toBe("/my-tab/login");
  expect([canEditWebsite(viewer("owner")), canEditWebsite(viewer("admin")), canEditWebsite(viewer("practitioner")), canEditWebsite(viewer("client")), canEditWebsite(null)]).toEqual([true, true, false, false, false]);
});

test("after sign-in, only known places: the return address can't be pointed anywhere else", () => {
  expect(afterSignIn("editor")).toBe("/keystatic");
  for (const bad of [undefined, null, "", "https://evil.example", "//evil.example", "/keystatic", "constructor", "__proto__", "toString", 1]) {
    expect(afterSignIn(bad), String(bad)).toBe("/practice");
    expect(nextParam(bad), String(bad)).toBeUndefined();
    expect(nextQuery(bad), String(bad)).toBe("");
  }
  expect(nextQuery("editor")).toBe("?next=editor");
});

test("signed out, or signed in as a client: the editor sends you to sign in first", async ({ page, context, baseURL }) => {
  await page.goto("/keystatic");
  await expect(page).toHaveURL(/\/my-tab\/login$/);
  await page.goto("/keystatic/singleton/home");
  await expect(page).toHaveURL(/\/my-tab\/login$/);
  await as(context, baseURL!, "client");
  await page.goto("/keystatic");
  await expect(page).toHaveURL(/\/my-tab\/login$/);
});

test("the owner and website admins reach the editor from TAB Practice, with a full page load", async ({ page, context, baseURL }) => {
  for (const role of ["owner", "admin"] as const) {
    await context.clearCookies();
    await as(context, baseURL!, role);
    await page.goto("/practice/website");
    const nav = page.getByRole("navigation", { name: "Portal" }).first();
    const link = nav.getByRole("link", { name: "Edit the website" });
    await expect(link, role).toHaveAttribute("href", "/keystatic");
    await expect(page.getByRole("main").getByRole("link", { name: "Edit the website" }), role).toHaveAttribute("href", "/keystatic");
    const res = await Promise.all([page.waitForNavigation(), link.click()]).then(([r]) => r);
    await expect(page, role).toHaveURL(/\/keystatic$/);
    // A full load gets the editor's own content-security policy (in-app navigation would keep TAB Practice's).
    expect(res?.headers()["content-security-policy"], role).toContain("https://api.keystatic.cloud");
    await expect(page.getByRole("heading", { name: "The content editor isn’t connected yet" }), role).toBeVisible();
  }
});
