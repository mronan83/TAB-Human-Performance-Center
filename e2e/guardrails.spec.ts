import { expect, test } from "@playwright/test";
import { analyticsAllowed, dropExcluded, isServicePage, pixelAllowed } from "../lib/analytics";
import { buildInquiryEmails, type InquiryAnswers } from "../lib/inquiry-emails";
import { authEmails } from "../content/auth-emails";
import { stageUpdatedEmail } from "../content/emails";
import { services } from "../content/services";
import { bookingHref } from "../lib/links";

/**
 * Checks for guardrails that only code review protected before (C15): analytics exclusion (NFR-005, guardrail 6),
 * no personal or health details in email subjects or the submitter's copy (TG-3, guardrail 5), one next step for each
 * Start submission and its arrival in TAB Practice (TG-8, GS-004/005), and the service-page anatomy (WEB-004 to 007).
 */

test("analytics never runs on My TAB, TAB Practice or the contact form; no ad pixel on Start either (NFR-005)", () => {
  for (const path of ["/my-tab", "/my-tab/plan", "/practice", "/practice/settings", "/practice/inquiries/abc", "/contact"]) {
    expect(analyticsAllowed(path), path).toBe(false);
    expect(pixelAllowed(path), path).toBe(false);
  }
  for (const path of ["/", "/start", "/services/massage-bodywork", "/about", "/contact-us-elsewhere"]) expect(analyticsAllowed(path), path).toBe(true);
  expect(pixelAllowed("/start")).toBe(false);
  // The tracker itself drops anything from an excluded page, even after client-side navigation into one.
  for (const p of ["/my-tab", "/my-tab/plan", "/practice/settings", "/contact"]) {
    expect(dropExcluded({ type: "pageview", url: `https://www.tabhumanperformance.com${p}` }), p).toBeNull();
    expect(dropExcluded({ type: "event", url: `https://www.tabhumanperformance.com${p}?x=1` }), p).toBeNull();
  }
  expect(dropExcluded({ type: "event", url: "https://www.tabhumanperformance.com/services/massage-bodywork" })).not.toBeNull();
  expect(isServicePage("/services/massage-bodywork")).toBe(true);
  expect(isServicePage("/services")).toBe(false);
});

test("emails: subjects carry no personal details and the submitter's copy never repeats a message (TG-3)", () => {
  const secret = { name: "Quinn Sentinelname", email: "quinn.sentinel@example.com", phone: "555-0199", message: "SENTINEL knee surgery details" };
  const base = { name: secret.name, email: secret.email, phone: secret.phone, contactPreference: "email", marketingOptIn: false } as const;
  const start = { ...base, kind: "start", help: ["stronger"], considerations: ["health-private"], outcomes: [], availability: [], service: "not-sure" } as unknown as InquiryAnswers;
  const contact = { ...base, kind: "contact", topic: "booking", message: secret.message, help: [], outcomes: [], considerations: [], availability: [] } as unknown as InquiryAnswers;

  for (const [d, flags] of [[start, []], [contact, []], [contact, ["links"]]] as const) {
    const { staff, copy } = buildInquiryEmails(d, "ABC123", [...flags], false);
    for (const subject of [staff.subject, copy.subject]) {
      for (const value of Object.values(secret)) expect(subject).not.toContain(value);
    }
    expect(staff.subject).toMatch(/^(\[Check\] )?(Start Where You Are|Website message): new submission \(ABC123\)$/);
    expect(copy.subject).toBe("We’ve received your message – TAB Human Performance Center");
    // RSK-011: what someone typed reaches TAB only.
    expect(copy.html).not.toContain("SENTINEL");
    expect(copy.text).not.toContain("SENTINEL");
  }
  // GS-004: a Start submission asks TAB for exactly one next step.
  const { staff } = buildInquiryEmails(start, "ABC123", [], false);
  expect(staff.text.match(/Next step \(choose one\)/g)).toHaveLength(1);
  // Fixed subjects elsewhere: My TAB notices and Supabase's sign-in emails.
  expect(stageUpdatedEmail.subject).not.toMatch(/\{|\$/);
  for (const e of Object.values(authEmails)) expect(e.subject).not.toMatch(/\{\{|@/);
});

test("a Start submission reaches TAB Practice and takes exactly one next step (TG-8)", async ({ page, context, baseURL }) => {
  // Names allow letters only; a random letter suffix keeps reruns apart in the shared demo store.
  const name = `Morgan Tgeight${Array.from({ length: 6 }, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join("")}`;
  await page.goto("/start");
  await page.fill("#name", name);
  await page.fill("#email", "morgan.tg8@example.com");
  await page.check('input[name="help"][value="stronger"]');
  await page.check('input[name="service"][value="not-sure"]');
  await page.check('input[name="consentContact"]');
  await page.waitForTimeout(2_600); // the minimum fill time (lib/spam.ts)
  await page.getByRole("button", { name: "Send and find my starting point" }).click();
  await expect(page.getByRole("heading", { name: /Thank you/ })).toBeFocused();

  await context.addCookies([{ name: "tab_demo_role", value: "owner", url: baseURL! }]);
  await page.goto("/practice/inquiries");
  await page.getByRole("link", { name: new RegExp(name) }).first().click();
  // "Needs a next step" also shows on the list, so wait for the submission's own page before looking at it.
  await expect(page).toHaveURL(/\/practice\/inquiries\/[^/]+$/);
  await expect(page.locator("main h1")).toContainText(name);
  await expect(page.locator("main").getByText("Needs a next step").first()).toBeVisible();
  // One choice only: the next step is a radio group, and nothing is chosen yet.
  const choices = page.locator('input[type="radio"][name="outcome"]');
  await expect(choices.first()).toBeVisible();
  expect(await choices.count()).toBeGreaterThan(1);
  await expect(page.locator('input[name="outcome"]:checked')).toHaveCount(0);
  const label = (await choices.first().locator("xpath=..").innerText()).split("\n")[0].trim();
  await choices.first().check();
  await page.getByRole("button", { name: "Save next step" }).click();
  await page.reload();
  await expect(page.locator('input[name="outcome"]:checked')).toHaveCount(1);
  await expect(page.locator("main").getByText(label, { exact: true }).first()).toBeVisible();
});

test("every service page keeps its booking CTA, a not-sure path to Start, and related services (WEB-004 to WEB-007)", async ({ page }) => {
  await page.goto("/services");
  for (const s of services) await expect(page.locator(`main a[href="/services/${s.path}"]`).first()).toBeVisible();

  for (const s of services) {
    await page.goto(`/services/${s.path}`);
    const main = page.locator("main");
    // The owner can point each service's Book buttons at its own Timely page (C23b), so find them by their marker.
    const bookLinks = main.locator('a[data-event="Booking: Clicked"]'); // counted (C18)
    expect(await bookLinks.count(), `${s.name}: booking CTA`).toBeGreaterThan(0);
    const fallback = bookingHref(s.slug).href;
    for (const href of await bookLinks.evaluateAll((as) => as.map((a) => a.getAttribute("href")))) expect(href === fallback || /^https:\/\//.test(href ?? "")).toBe(true);
    await expect(main.getByRole("link", { name: /not sure/i }), `${s.name}: not-sure path`).toHaveAttribute("href", "/start");
    const related = main.locator('section:has(h2:text("Connected support")) a');
    const hrefs = await related.evaluateAll((as) => as.map((a) => a.getAttribute("href")));
    expect(hrefs.length, `${s.name}: related services`).toBeGreaterThan(0);
    expect(hrefs).not.toContain(`/services/${s.path}`);
    for (const h of hrefs) expect(services.map((x) => `/services/${x.path}`)).toContain(h);
  }
});
