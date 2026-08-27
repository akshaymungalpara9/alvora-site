import assert from "node:assert/strict";
import test from "node:test";
import { chromium } from "playwright-core";

const baseUrl = process.env.PUBLIC_CATALOG_BASE_URL || "http://localhost:3000";
const routes = [
  { path: "/availability", expected: "Current production availability." },
  { path: "/buyer-availability", expected: "Current production availability." },
  { path: "/fr/availability", expected: "Disponibilités de production actuelles." },
  { path: "/it/availability", expected: "Disponibilità di produzione attuale." },
];

for (const viewport of [{ width: 1280, height: 720 }, { width: 375, height: 812, isMobile: true }]) {
  test(`public catalog routes resolve without authentication at ${viewport.width}px`, async () => {
    const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
    try {
      const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height }, isMobile: viewport.isMobile });
      for (const route of routes) {
        await page.goto(`${baseUrl}${route.path}`, { waitUntil: "networkidle" });
        await page.waitForFunction(() => document.querySelector(".catalog-collection-tabs button")?.textContent?.includes("684") === true, undefined, { timeout: 15_000 });
        const result = await page.evaluate(() => {
          const download = document.querySelector(".catalog-download")?.getBoundingClientRect();
          return {
            body: document.body.textContent || "",
            cardCount: document.querySelectorAll(".catalog-stone").length,
            scrollWidth: document.documentElement.scrollWidth,
            viewportWidth: window.innerWidth,
            downloadInViewport: Boolean(download && download.left >= 0 && download.right <= window.innerWidth),
          };
        });
        assert.ok(result.body.includes(route.expected), `${route.path} has localized catalog heading`);
        assert.ok(!result.body.includes("Sign in to view availability"), `${route.path} has no buyer sign-in gate`);
        assert.ok(result.cardCount > 0, `${route.path} renders active catalog cards`);
        assert.equal(result.scrollWidth, result.viewportWidth, `${route.path} has no horizontal overflow`);
        assert.equal(result.downloadInViewport, true, `${route.path} keeps public current-view control visible`);
      }
    } finally {
      await browser.close();
    }
  });
}
