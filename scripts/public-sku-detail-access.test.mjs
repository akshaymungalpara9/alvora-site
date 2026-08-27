import assert from "node:assert/strict";
import test from "node:test";
import { chromium } from "playwright-core";

const pageUrl = process.env.PUBLIC_CATALOG_TEST_URL || "http://localhost:3000/availability";
const collections = [
  { button: /^Fancy Colour/, count: "684" },
  { button: /^White/, count: "1155" },
  { button: /^Statement/, count: "593" },
];

test("every active public collection card exposes a no-login full SKU detail disclosure", async () => {
  const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    await page.goto(pageUrl, { waitUntil: "networkidle" });
    for (const collection of collections) {
      const tab = page.getByRole("button", { name: collection.button });
      await tab.click();
      await page.waitForFunction((expected) => Array.from(document.querySelectorAll(".catalog-collection-tabs button")).some((button) => button.textContent?.includes(expected)), collection.count);
      await page.waitForFunction(() => document.querySelectorAll(".catalog-stone").length > 0, undefined, { timeout: 15_000 });
      const cardCount = await page.locator(".catalog-stone").count();
      const detailCount = await page.locator(".catalog-stone-details").count();
      assert.equal(detailCount, cardCount, `${collection.count} collection cards all expose detail controls`);
      await page.locator(".catalog-stone-details summary").first().click();
      await page.waitForFunction(() => document.querySelector(".catalog-stone-details[open]") !== null, undefined, { timeout: 5_000 });
      const visibleDetail = await page.locator(".catalog-stone-details[open]").first().textContent() || "";
      for (const requiredLabel of ["Stock no.", "Shape", "Carat", "Carat band", "Colour", "Clarity"]) {
        assert.ok(visibleDetail.includes(requiredLabel), `${collection.count} first card exposes ${requiredLabel}`);
      }
      assert.doesNotMatch(visibleDetail, /price|origin partner|standard menu|import id/i);
      assert.doesNotMatch(await page.locator("body").innerText(), /Sign in to view availability/i);
    }
  } finally {
    await browser.close();
  }
});
