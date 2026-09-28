import { expect, test, type Page } from "@playwright/test";

/**
 * WEB-001, NFR-001: the desktop header (logo, nav, Book, Start Where You Are, account) sits on one line with
 * nothing wrapped, at the default text size and at the larger defaults older visitors often choose (D-049).
 * Below the switch point (80rem) the Menu button takes over.
 *
 * Chromium on Linux renders text slightly narrower than Safari or Windows, so passing here with no spare room
 * would still wrap on the owner's Mac. HEADROOM is the spare width the row must keep; if a new nav item eats it,
 * this fails in CI instead of in front of visitors.
 */
const HEADROOM = 32;

const setDefaultTextSize = async (page: Page, px: number) => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Page.enable");
  await cdp.send("Page.setFontSizes", { fontSizes: { standard: px, fixed: 13 } });
};

const measureHeader = (page: Page) =>
  page.evaluate(async () => {
    await document.fonts.ready;
    const row = document.querySelector<HTMLElement>("header .container-page")!;
    const shown = (el: Element | null) => !!el && el.getClientRects().length > 0;
    const style = getComputedStyle(row);
    const kids = [...row.children].filter(shown);
    const inner = row.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const used = kids.reduce((sum, k) => sum + k.getBoundingClientRect().width, 0) + (parseFloat(style.columnGap) || 0) * (kids.length - 1);
    const items = [...row.querySelectorAll(':scope > nav[aria-label="Primary"] > ul > li > :is(a, button), :scope > div > a')].filter(shown);
    const wrapped = items
      .filter((el) => {
        const range = document.createRange();
        range.selectNodeContents(el);
        const tops = [...range.getClientRects()].map((r) => r.top);
        return Math.max(...tops) - Math.min(...tops) > parseFloat(getComputedStyle(el).fontSize) * 0.6;
      })
      .map((el) => el.textContent?.trim());
    const menu = [...row.querySelectorAll("button")].find((b) => /^(Menu|Close)$/.test(b.textContent?.trim() ?? ""));
    return {
      fullNav: shown(row.querySelector('nav[aria-label="Primary"]')),
      menuButton: shown(menu ?? null),
      startShown: items.some((el) => el.textContent?.trim() === "Start Where You Are"),
      spare: Math.floor(inner - used),
      wrapped,
      pageScrollsSideways: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });

for (const textSize of [16, 20, 24]) {
  test(`header fits on one line with ${textSize}px default text`, async ({ page }) => {
    await setDefaultTextSize(page, textSize);
    const switchPoint = 80 * textSize;

    await page.setViewportSize({ width: switchPoint, height: 800 });
    await page.goto("/about");
    const full = await measureHeader(page);
    expect(full.fullNav, "full nav at the switch point").toBe(true);
    expect(full.menuButton).toBe(false);
    expect(full.startShown, "Start Where You Are is in the header").toBe(true);
    expect(full.wrapped, "header items on more than one line").toEqual([]);
    expect(full.spare, `spare width in the header row (needs ${HEADROOM}px for Safari/Windows text)`).toBeGreaterThanOrEqual(HEADROOM);
    expect(full.pageScrollsSideways).toBe(false);

    await page.setViewportSize({ width: switchPoint - 1, height: 800 });
    const narrow = await measureHeader(page);
    expect(narrow.fullNav, "Menu button just below the switch point").toBe(false);
    expect(narrow.menuButton).toBe(true);
    expect(narrow.pageScrollsSideways).toBe(false);
  });
}
