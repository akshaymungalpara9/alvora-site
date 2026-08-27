import assert from "node:assert/strict";
import test from "node:test";
import { chromium } from "playwright-core";

const pageUrl = process.env.PUBLIC_CATALOG_TEST_URL || "http://localhost:3000/availability";

test("public current catalog resolves active data and controls at a mobile viewport without horizontal overflow", async () => {
  const browser = await chromium.launch({
    executablePath: "/usr/bin/chromium",
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  try {
    const page = await browser.newPage({ viewport: { width: 375, height: 812 }, isMobile: true });
    const consoleErrors = [];
    page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
    const startedAt = Date.now();
    await page.goto(pageUrl, { waitUntil: "networkidle" });
    await page.waitForFunction(() => document.querySelector(".catalog-collection-tabs button")?.textContent?.includes("684") === true, undefined, { timeout: 15_000 });
    const elapsedMs = Date.now() - startedAt;
    const result = await page.evaluate(() => {
      const download = document.querySelector(".catalog-download");
      const rect = download?.getBoundingClientRect();
      return {
        scrollWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
        downloadInViewport: Boolean(rect && rect.left >= 0 && rect.right <= window.innerWidth),
        hasCurrentView: document.body.textContent?.includes("Download current view") ?? false,
        hasPublicCards: document.querySelectorAll(".catalog-stone").length > 0,
      };
    });
    assert.ok(elapsedMs < 15_000, `catalog active data took ${elapsedMs}ms to resolve`);
    assert.equal(result.scrollWidth, result.viewportWidth);
    assert.equal(result.downloadInViewport, true);
    assert.equal(result.hasCurrentView, true);
    assert.equal(result.hasPublicCards, true);
    assert.deepEqual(consoleErrors, []);
  } finally {
    await browser.close();
  }
});
