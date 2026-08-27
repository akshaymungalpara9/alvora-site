import assert from "node:assert/strict";
import test from "node:test";
import { chromium } from "playwright-core";

const baseUrl = process.env.PUBLIC_CATALOG_BASE_URL || "http://localhost:3000";

for (const path of ["/fr/availability", "/it/availability"]) {
  test(`anonymous visitor can create a localized current-view PDF at ${path}`, async () => {
    const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
    try {
      const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
      await page.goto(`${baseUrl}${path}`, { waitUntil: "networkidle" });
      await page.waitForFunction(() => document.querySelector(".catalog-collection-tabs button")?.textContent?.includes("684") === true, undefined, { timeout: 15_000 });
      const responsePromise = page.waitForResponse((response) => response.url().includes("availability.downloadCurrentView") && response.status() === 200, { timeout: 15_000 });
      await page.locator(".catalog-download").click();
      const response = await responsePromise;
      const payload = await response.json();
      const json = payload?.[0]?.result?.data?.json;
      assert.equal(page.url(), `${baseUrl}${path}`);
      assert.equal(json?.stoneCount, 48);
      assert.match(json?.storageUrl || "", /^\/manus-storage\/public-current-views\/core\//);
    } finally {
      await browser.close();
    }
  });
}
