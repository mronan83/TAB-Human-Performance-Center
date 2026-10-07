import { expect, test, type Page } from "@playwright/test";
import { bookingHref, clientLoginHref } from "../lib/links";
import { accountLink } from "../lib/settings";

/** S19 §19.15 critical smoke tests that can run without live third-party services (NFR-007). */

const inquiryOk = async (page: Page) => {
  const sent: Record<string, unknown>[] = [];
  await page.route("**/api/inquiry", async (route) => {
    sent.push(route.request().postDataJSON());
    await route.fulfill({ json: { ok: true, copy: true } });
  });
  return sent;
};

test("homepage → service page → booking", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toBeVisible();
  await page.getByRole("link", { name: "Explore Massage & Bodywork" }).click();
  await expect(page).toHaveURL(/\/services\/massage-bodywork$/);
  await expect(page.locator("main h1")).toBeVisible();

  // Booking goes to Timely when configured (D-003), otherwise to /book.
  const book = bookingHref();
  const headerBook = page.locator("header").getByRole("link", { name: "Book", exact: true }).first();
  await expect(headerBook).toHaveAttribute("href", book.href);
  if (!book.external) {
    await headerBook.click();
    await expect(page).toHaveURL(/\/book$/);
    await expect(page.locator("main h1")).toBeVisible();
  }
});

test("account link: My TAB only once the client portal is open, never a Client Login (WEB-020)", async ({ page }) => {
  // Owner ruling 2026-10-06: no Client Login until the portal is live; Book covers Timely meanwhile.
  await page.goto("/");
  const account = await accountLink();
  for (const area of ["header", "footer"]) await expect(page.locator(area).getByRole("link", { name: "Client Login" })).toHaveCount(0);
  if (account) await expect(page.locator("header").getByRole("link", { name: account.label }).first()).toHaveAttribute("href", account.href);
  else await expect(page.locator("header").getByRole("link", { name: "My TAB" })).toHaveCount(0);
  // The interim /my-tab page (old bookmarks, /employee-login) still opens Timely, never the contact form.
  expect(clientLoginHref().href).not.toBe("/contact");
  if (bookingHref().external) expect(clientLoginHref().external).toBe(true);
});

test("demo portal: sign in as client or practitioner, sign out (owner demo request 2026-09-28)", async ({ page }) => {
  // Local builds are not production deployments, so the portal runs in demo mode here.
  await page.goto("/");
  await page.locator("footer").getByRole("link", { name: "Practitioner login" }).click();
  await expect(page).toHaveURL(/\/my-tab\/login$/);
  await page.getByRole("button", { name: "Practitioner: TAB Practice" }).click();
  await expect(page).toHaveURL(/\/practice$/);

  await page.goto("/my-tab/login");
  await page.getByRole("button", { name: "Client: My TAB" }).click();
  await expect(page).toHaveURL(/\/my-tab$/);
  await expect(page.locator("main h1")).toContainText("Dana");

  await page.getByRole("button", { name: "Sign out" }).first().click();
  await expect(page).toHaveURL(/\/$/);
  await page.goto("/my-tab");
  await expect(page).toHaveURL(/\/my-tab\/login$/);
});

test("progress review: the practitioner confirms a stage change and the client sees it (design §5.2)", async ({ page, context, baseURL }) => {
  await context.addCookies([{ name: "tab_demo_role", value: "owner", url: baseURL! }]);
  await page.goto("/practice/clients/demo-client-dana");
  await page.getByRole("link", { name: "Progress review" }).click();
  await expect(page.locator("main h1")).toHaveText("Progress review");

  await page.getByLabel("What has changed? What feels better or easier?").fill("Three sessions most weeks; stairs feel easier.");
  await page.getByLabel("Adjust approach").check();
  await page.getByLabel("TAB Method stage", { exact: true }).selectOption("adapt");
  // Changing the stage needs the practitioner to confirm the conversation with the client.
  await page.getByRole("button", { name: "Save review and update stage" }).click();
  await expect(page).toHaveURL(/\/review$/);
  await page.getByLabel(/I’ve discussed this stage change/).check();
  await page.getByLabel("Summary for Dana").fill("You’re ready to bring strength, sleep and recovery together.");
  await page.getByRole("button", { name: "Save review and update stage" }).click();

  await expect(page).toHaveURL(/\/practice\/clients\/demo-client-dana\?review=saved/);
  await expect(page.getByRole("status")).toContainText("Stage updated to Adapt");
  await expect(page.getByText("You’re ready to bring strength, sleep and recovery together.")).toBeVisible();

  await context.addCookies([{ name: "tab_demo_role", value: "client", url: baseURL! }]);
  await page.goto("/my-tab");
  await expect(page.getByRole("status").filter({ hasText: "Your stage was updated to Adapt" })).toBeVisible();
  await expect(page.locator('[aria-current="step"]')).toContainText("Adapt");
});

test("plans: a practitioner creates and shares a service plan; the client sees only what's shared (design §2)", async ({ page, context, baseURL }) => {
  await context.addCookies([{ name: "tab_demo_role", value: "owner", url: baseURL! }]);
  await page.goto("/practice/clients/demo-client-dana");
  await page.getByRole("link", { name: "Life Coaching", exact: true }).click();
  await expect(page.locator("main h1")).toHaveText("New Life Coaching plan");
  await page.getByLabel("Title").fill("Make room for what matters");
  await page.getByLabel("Values").fill("Family time and steady energy.");
  await page.getByLabel("Plan status").selectOption("active");
  await page.getByLabel(/Share this plan with the client/).check();
  await page.getByRole("button", { name: "Create plan" }).click();
  await expect(page.getByRole("status")).toContainText("Plan saved. It’s shared with the client");

  await page.getByLabel("New log entry").fill("Named two evenings a week as protected family time.");
  await page.getByLabel("Share with client").check();
  await page.getByRole("button", { name: "Add entry" }).click();
  await expect(page.getByText("Entry added.")).toBeVisible();

  await context.addCookies([{ name: "tab_demo_role", value: "client", url: baseURL! }]);
  await page.goto("/my-tab/plan");
  await expect(page.getByRole("heading", { name: "Make room for what matters" })).toBeVisible();
  await expect(page.getByText("Family time and steady energy.")).toBeVisible();
  await expect(page.getByText("Named two evenings a week as protected family time.")).toBeVisible();
  // Shared massage sections and entries show; practitioner-only sections, internal entries and draft plans don't.
  await expect(page.getByText("Upper back, shoulders, and hips.")).toBeVisible();
  await expect(page.getByText("Prefers side-lying for hip work.")).toHaveCount(0);
  await expect(page.getByText("Guarding around the right shoulder")).toHaveCount(0);
  await expect(page.getByText("Strength block 2")).toHaveCount(0);
});

test("programs: a practitioner assigns and personalizes a program; the client sees their version (design §2.4)", async ({ page, context, baseURL }) => {
  await context.addCookies([{ name: "tab_demo_role", value: "owner", url: baseURL! }]);
  await page.goto("/practice/clients/demo-client-dana");
  await page.getByRole("link", { name: "Assign program" }).click();
  await page.getByRole("link", { name: "Choose Rest & Reset" }).click();
  await expect(page.locator("main h1")).toHaveText("Assign Rest & Reset");
  await page.getByLabel("Supports plan").selectOption({ label: "Performance Plan: Stronger, steadier, and back in routine" });
  await page.getByLabel("Note to the client").fill("Start small: evenings first, then bedtime.");
  await page.getByLabel("Skip for this client (Read: Why sleep changes in midlife)").check();
  await page.getByLabel("Frequency (Screens off 30 minutes before bed)").fill("2 nights");
  await page.getByLabel("Note for this client (Note when you start winding down each evening)").fill("Jot it on your phone; no need for detail.");
  await page.getByRole("button", { name: "Assign program" }).click();
  await expect(page.getByRole("status")).toContainText("Program saved. The client sees it in My TAB with your changes.");
  await expect(page.getByLabel("Frequency (Screens off 30 minutes before bed)")).toHaveValue("2 nights");
  await expect(page.getByLabel("Skip for this client (Read: Why sleep changes in midlife)")).toBeChecked();
  const programId = new URL(page.url()).pathname.split("/").pop();

  await context.addCookies([{ name: "tab_demo_role", value: "client", url: baseURL! }]);
  await page.goto(`/my-tab/programs/${programId}`);
  await expect(page.getByRole("heading", { name: "A note from your practitioner" })).toBeVisible();
  await expect(page.getByText("Start small: evenings first, then bedtime.")).toBeVisible();
  await expect(page.getByText(/frequency 2 nights — adjusted for you/)).toBeVisible();
  await expect(page.getByText("Jot it on your phone; no need for detail.")).toBeVisible();
  await expect(page.getByText("Why sleep changes in midlife")).toHaveCount(0);
});

test("program editor: build a draft, publish it, then edit it as a new version (design §3.1)", async ({ page, context, baseURL }) => {
  await context.addCookies([{ name: "tab_demo_role", value: "owner", url: baseURL! }]);
  page.on("dialog", (d) => d.accept());
  await page.goto("/practice/programs");
  await page.getByRole("link", { name: "New program" }).click();
  await page.getByLabel("Program title").fill("Morning Mobility");
  await page.getByLabel("Summary").fill("Ten easy minutes to start the day.");
  await page.getByRole("button", { name: "Add activity (week section 1)" }).click();
  await expect(page.getByLabel("Activity (week section 1, activity 1)", { exact: true })).toBeFocused();
  await page.getByLabel("Activity (week section 1, activity 1)", { exact: true }).fill("Cat-cow");
  await page.getByRole("button", { name: "Add prescription (week section 1, activity 1)" }).click();
  await page.getByLabel("Value (week section 1, activity 1, sets)").fill("2");
  await page.getByRole("button", { name: "Add week" }).click();
  await page.getByLabel("Title (week section 2)").fill("Hips");
  await page.getByRole("button", { name: "Add activity (week section 2)" }).click();
  await page.getByLabel("Type (week section 2, activity 1)").selectOption("habit");
  await page.getByLabel("Activity (week section 2, activity 1)", { exact: true }).fill("Hip circles before breakfast");
  await page.getByRole("button", { name: "Create draft" }).click();
  await expect(page.getByRole("status")).toHaveText("Draft saved.");
  await expect(page.getByLabel("Activity (week section 2, activity 1)", { exact: true })).toHaveValue("Hip circles before breakfast");

  await page.getByRole("button", { name: "Publish" }).click();
  await expect(page.getByRole("status")).toContainText("Published.");
  await expect(page.getByRole("button", { name: "Save draft" })).toHaveCount(0); // published versions are read-only
  await expect(page.getByText("sets 2")).toBeVisible();
  const v1 = new URL(page.url()).pathname;

  await page.goto("/practice/clients/demo-client-dana/programs/new");
  await expect(page.getByRole("link", { name: "Choose Morning Mobility" })).toBeVisible();

  await page.goto(v1);
  await page.getByRole("button", { name: "Edit as a new version" }).click();
  await expect(page.getByRole("status")).toContainText("New draft version started");
  await expect(page.getByText("Version 2 (this page)")).toBeVisible();
  await page.getByLabel("Value (week section 1, activity 1, sets)").fill("3");
  await page.getByRole("button", { name: "Save draft" }).click();
  await expect(page.getByRole("status")).toHaveText("Draft saved.");
  await page.getByRole("button", { name: "Publish" }).click();
  await expect(page.getByRole("status")).toContainText("Published.");
  await expect(page.getByText("sets 3")).toBeVisible();
  await page.goto(v1);
  await expect(page.getByText("sets 2")).toBeVisible(); // version 1 is unchanged...
  await expect(page.getByText("This version can’t be assigned any more.")).toBeVisible(); // ...and retired
});

test("program versions: move a client to a newer version, add a client-only activity (C7b)", async ({ page, context, baseURL }) => {
  await context.addCookies([{ name: "tab_demo_role", value: "owner", url: baseURL! }]);
  page.on("dialog", (d) => d.accept());
  // Publish version 2 of Strength Foundations with a heavier first exercise.
  await page.goto("/practice/programs/tpl-strength-foundations");
  await page.getByRole("button", { name: "Edit as a new version" }).click();
  await expect(page.getByRole("status")).toContainText("New draft version started");
  await page.getByLabel("Value (week section 1, activity 1, sets)").fill("4");
  await page.getByRole("button", { name: "Save draft" }).click();
  await expect(page.getByRole("status")).toHaveText("Draft saved.");
  await page.getByRole("button", { name: "Publish" }).click();
  await expect(page.getByRole("status")).toContainText("Published.");

  // Dana is still on version 1 until her practitioner moves her.
  await page.goto("/practice/clients/demo-client-dana/programs/cp-strength");
  await expect(page.getByText("Version 2 is available")).toBeVisible();
  await page.getByRole("button", { name: "Move to version 2" }).click();
  await expect(page.getByRole("status")).toContainText(/Moved to version 2\. \d+ completed activit(y|ies) carried over/);
  await expect(page.getByText("Version 2 is available")).toHaveCount(0);

  await page.getByRole("button", { name: "Add an activity for this client" }).click();
  await expect(page.getByLabel("Activity (added activity 2)")).toBeFocused();
  await page.getByLabel("Activity (added activity 2)").fill("Balance on one foot while brushing your teeth");
  await page.getByLabel("Week (added activity 2)").selectOption("1");
  await page.getByRole("button", { name: "Save program" }).click();
  await expect(page.getByRole("status")).toContainText("Program saved.");

  await context.addCookies([{ name: "tab_demo_role", value: "client", url: baseURL! }]);
  await page.goto("/my-tab/programs/cp-strength");
  await expect(page.getByText(/sets 4/)).toBeVisible(); // the new version
  await expect(page.getByText("Use the low box and hold the rail.")).toBeVisible(); // personalization carried over
  const added = page.getByRole("checkbox", { name: /Balance on one foot while brushing your teeth/ });
  await expect(page.getByText(/added for you/).first()).toBeVisible();
  await added.check();
  await page.reload();
  await expect(page.getByRole("checkbox", { name: /Balance on one foot while brushing your teeth/ })).toBeChecked();
});

test("team: only the owner grants the publishing permission (C7b)", async ({ page, context, baseURL }) => {
  await context.addCookies([{ name: "tab_demo_role", value: "owner", url: baseURL! }]);
  await page.goto("/practice/team");
  const publish = page.getByLabel("Can publish and retire programs (Avery Brooks (demo practitioner))");
  await expect(publish).not.toBeChecked();
  await publish.check();
  await page.getByRole("button", { name: "Save Avery Brooks (demo practitioner)" }).click();
  await expect(page.getByText("Saved.")).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Can publish and retire programs (Avery Brooks (demo practitioner))")).toBeChecked();
  await context.addCookies([{ name: "tab_demo_role", value: "client", url: baseURL! }]);
  const res = await page.goto("/practice/team");
  expect(page.url()).not.toContain("/practice/team");
  expect(res?.status()).toBeLessThan(500);
});

test("TAB Practice for the pilot: invite to My TAB, assign a form, share a resource (C4)", async ({ page, context, baseURL }) => {
  await context.addCookies([{ name: "tab_demo_role", value: "owner", url: baseURL! }]);
  await page.goto("/practice/clients/demo-client-tom");
  await expect(page.getByText("They can't sign in to My TAB until you invite them.")).toBeVisible();
  await page.getByRole("button", { name: "Invite to My TAB" }).click();
  await expect(page.getByRole("status")).toContainText("Marked as invited. No email was sent");
  await expect(page.getByRole("button", { name: "Send the invitation again" })).toBeVisible();

  await page.goto("/practice/clients/demo-client-dana");
  await expect(page.getByText(/Using My TAB since/)).toBeVisible();
  await page.getByLabel("Form", { exact: true }).selectOption({ label: "Your weekly routine" });
  await page.getByRole("button", { name: "Assign form" }).click();
  await expect(page.getByText("Form assigned. It's waiting in their My TAB.")).toBeVisible();
  await page.getByRole("button", { name: "Withdraw Your weekly routine" }).click();
  await expect(page.getByRole("button", { name: "Withdraw Your weekly routine" })).toHaveCount(0);
  await page.getByLabel("Form", { exact: true }).selectOption({ label: "Your weekly routine" });
  await page.getByRole("button", { name: "Assign form" }).click();
  await expect(page.getByText("Form assigned. It's waiting in their My TAB.")).toBeVisible();

  await page.getByLabel("From the Resources page (optional)").selectOption({ label: "A planned subject" });
  await expect(page.getByLabel("Title", { exact: true })).toHaveValue("A planned subject");
  await page.getByLabel("Note to the client (optional)").fill("Read before Thursday.");
  await page.getByRole("button", { name: "Share resource" }).click();
  await expect(page.getByText("Shared. It's in their My TAB resources.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Remove A planned subject" })).toBeVisible();

  await context.addCookies([{ name: "tab_demo_role", value: "client", url: baseURL! }]);
  await page.goto("/my-tab/forms");
  await expect(page.getByText("Your weekly routine")).toBeVisible();
  await page.goto("/my-tab/resources");
  await page.getByRole("link", { name: /A planned subject/ }).click();
  // The link records the view, then navigates; /\/resources$/ would already match /my-tab/resources.
  await page.waitForURL((url) => url.pathname === "/resources");

  await context.addCookies([{ name: "tab_demo_role", value: "owner", url: baseURL! }]);
  await page.goto("/practice/clients/demo-client-dana");
  await expect(page.getByRole("listitem").filter({ hasText: "Read before Thursday." })).toContainText(", viewed");
});

test("a partial refund waits for the owner's decision in TAB Practice (C3b, owner ruling 2026-10-03)", async ({ page, context, baseURL }) => {
  await context.addCookies([{ name: "tab_demo_role", value: "owner", url: baseURL! }]);
  await page.goto("/practice");
  const panel = page.getByRole("region", { name: "Purchases to review" });
  await expect(panel).toContainText("Tom Brennan");
  await expect(panel).toContainText("refunded $100 of $397");
  await panel.getByRole("button", { name: "Keep access for Tom Brennan" }).click();
  await expect(page.getByRole("region", { name: "Purchases to review" })).toHaveCount(0);
});

test("Performance Plan goals: start with one, add and remove rows, up to 100 (owner request 2026-09-29)", async ({ page, context, baseURL }) => {
  test.setTimeout(60_000);
  await context.addCookies([{ name: "tab_demo_role", value: "owner", url: baseURL! }]);
  await page.goto("/practice/clients/demo-client-ruth/plans/new?type=wellness");
  await expect(page.getByLabel(/^Goal \d+$/)).toHaveCount(1);
  await page.getByLabel("Title").fill("Move with less tension");
  await page.getByLabel("Goal 1", { exact: true }).fill("Turn my head fully when driving");
  await page.getByRole("button", { name: "Add goal" }).click();
  await expect(page.getByLabel("Goal 2", { exact: true })).toBeFocused();
  await page.getByLabel("Goal 2", { exact: true }).fill("Temporary goal");
  await page.getByRole("button", { name: "Add goal" }).click();
  await page.getByLabel("Goal 3", { exact: true }).fill("Sleep through the night without hip ache");
  await page.getByRole("button", { name: "Remove goal 2" }).click();
  await expect(page.getByLabel(/^Goal \d+$/)).toHaveCount(2);
  await page.getByLabel("Plan status").selectOption("active");
  await page.getByRole("button", { name: "Create plan" }).click();
  await expect(page.getByRole("status")).toContainText("Plan saved");

  // Saved: two goals, in order, without the removed one.
  const titles = page.getByLabel(/^Goal \d+$/);
  await expect(titles).toHaveCount(2);
  await expect(titles.nth(0)).toHaveValue("Turn my head fully when driving");
  await expect(titles.nth(1)).toHaveValue("Sleep through the night without hip ache");

  // The limit: 100 rows, then Add goal is disabled.
  const add = page.getByRole("button", { name: "Add goal" });
  for (let n = 2; n < 100; n++) await add.click();
  await expect(titles).toHaveCount(100);
  await expect(add).toBeDisabled();
  await expect(page.getByText("100 of 100 goals")).toBeVisible();
});

test("plan editor: status and date fields don't overlap at iPad width (owner bug report 2026-09-29)", async ({ page, context, baseURL }) => {
  await context.addCookies([{ name: "tab_demo_role", value: "owner", url: baseURL! }]);
  for (const width of [1024, 834]) { // iPad landscape (split portal layout) and iPad portrait
    await page.setViewportSize({ width, height: 1200 });
    await page.goto("/practice/clients/demo-client-dana/plans/plan-dana-massage");
    const boxes = await Promise.all(["Plan status", "Start date", "Next review"].map(async (l) => (await page.getByLabel(l, { exact: true }).boundingBox())!));
    for (let i = 1; i < boxes.length; i++) {
      const [a, b] = [boxes[i - 1], boxes[i]];
      const sameRow = Math.abs(a.y - b.y) < 4;
      if (sameRow) expect(a.x + a.width, `${width}px: field ${i} ends before field ${i + 1} starts`).toBeLessThanOrEqual(b.x);
    }
  }
});

test("Start Where You Are: submits choices only (D-059)", async ({ page }) => {
  const sent = await inquiryOk(page);
  await page.goto("/start");
  await page.fill("#name", "Test Person");
  await page.fill("#email", "test@example.com");
  await page.check('input[name="help"][value="stronger"]');
  await page.check('input[name="service"][value="not-sure"]');
  await page.check('input[name="consentContact"]');
  await page.waitForTimeout(2_600); // the minimum fill time (lib/spam.ts)
  await page.getByRole("button", { name: "Send and find my starting point" }).click();
  await expect(page.getByRole("heading", { name: /Thank you/ })).toBeFocused();

  expect(sent).toHaveLength(1);
  const typed = Object.entries(sent[0]).filter(([k, v]) => typeof v === "string" && v && !["kind", "name", "email", "phone", "website", "turnstileToken"].includes(k));
  // Every other string must be one of our option values, never free text.
  for (const [k, v] of typed) expect(String(v), `field ${k}`).toMatch(/^[a-z-]+$/);
  expect(sent[0]).not.toHaveProperty("message");
});

test("Start Where You Are: an empty submit explains and focuses the first problem", async ({ page }) => {
  await page.goto("/start");
  await page.getByRole("button", { name: "Send and find my starting point" }).click();
  await expect(page.locator("#form-error")).toBeVisible();
  await expect(page.locator("#name")).toBeFocused();
});

test("contact form sends a message", async ({ page }) => {
  const sent = await inquiryOk(page);
  await page.goto("/contact");
  await page.fill("#name", "Test Person");
  await page.fill("#email", "test@example.com");
  await page.check('input[name="topic"][value="booking"]');
  await page.fill("#message", "Do you have Saturday times?");
  await page.check('input[name="consentContact"]');
  await page.waitForTimeout(2_600);
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByRole("heading", { name: /Thank you/ })).toBeFocused();
  expect(sent[0]).toMatchObject({ kind: "contact", topic: "booking", message: "Do you have Saturday times?" });
});

test("inquiry API refuses other sites and bad input (SEC-013)", async ({ request, baseURL }) => {
  expect((await request.post("/api/inquiry", { data: { kind: "contact" } })).status()).toBe(403);
  const invalid = await request.post("/api/inquiry", { data: { kind: "contact" }, headers: { origin: new URL(baseURL!).origin } });
  expect(invalid.status()).toBe(422);
});

test("unknown URLs get the branded 404 with header and footer (NFR-002)", async ({ page }) => {
  const res = await page.goto("/no-such-page-for-tests");
  expect(res?.status()).toBe(404);
  await expect(page.locator("main h1")).toHaveText("This page has moved or no longer exists.");
  await expect(page.locator("header")).toBeVisible();
  await expect(page.locator("footer")).toBeVisible();
});

test("header menus: Escape returns focus, focus-out closes (WEB-001, NFR-001)", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/about");
  const trigger = page.locator('nav[aria-label="Primary"] button', { hasText: "Services" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#menu-Services")).toBeVisible();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Escape");
  await expect(page.locator("#menu-Services")).toBeHidden();
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Enter");
  // Tab through every link in the menu, then once more: focus leaves the menu and it closes.
  const links = await page.locator("#menu-Services a").count();
  for (let i = 0; i <= links; i++) await page.keyboard.press("Tab");
  await expect(page.locator("#menu-Services")).toBeHidden();
});

