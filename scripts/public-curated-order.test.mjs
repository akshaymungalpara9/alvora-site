import assert from "node:assert/strict";
import test from "node:test";
import { chromium } from "playwright-core";

const baseUrl = process.env.PUBLIC_CATALOG_BASE_URL || "http://localhost:3000";
const expectedTabs = ["Fancy Colour", "White", "Statement"];

test("anonymous catalogue defaults to a curated, no-price first screen across all collections", async () => {
  const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    await page.addInitScript(() => {
      window.__alvoraAnalytics = [];
      window.umami = { track: (event, data) => window.__alvoraAnalytics.push({ event, data }) };
    });
    await page.goto(`${baseUrl}/availability`, { waitUntil: "networkidle" });
    await page.waitForSelector(".catalog-stone");
    const output = [];
    for (const tab of expectedTabs) {
      await page.getByRole("button", { name: new RegExp(`^${tab}`, "i") }).click();
      await page.waitForFunction((currentTab) => document.querySelector(".catalog-collection-tabs .is-active")?.textContent?.toLowerCase().includes(currentTab.toLowerCase()) && document.querySelectorAll(".catalog-stone").length > 0, tab);
      const evidence = await page.evaluate(() => ({
        sort: document.querySelector(".catalog-sort select")?.value,
        options: [...document.querySelectorAll(".catalog-sort option")].map((option) => option.textContent?.trim()),
        firstStockNos: [...document.querySelectorAll(".catalog-stone small")].slice(0, 8).map((node) => node.textContent?.trim()),
        body: document.body.textContent || "",
      }));
      assert.equal(evidence.sort, "curated", `${tab} opens in Curated order`);
      assert.deepEqual(evidence.options, ["Curated", "Carat: large to small", "Carat: small to large", "New arrivals"], `${tab} exposes only approved no-price sort choices`);
      assert.equal(evidence.firstStockNos.length, 8, `${tab} exposes eight first-screen stock numbers`);
      assert.ok(evidence.firstStockNos.every(Boolean), `${tab} has populated first-screen stock numbers`);
      assert.ok(!evidence.body.toLowerCase().includes("sort by price"), `${tab} never exposes price ordering`);
      output.push({ tab, firstStockNos: evidence.firstStockNos });
    }
    for (const sort of ["carat_desc", "carat_asc", "new_arrivals"]) {
      await page.locator(".catalog-sort select").selectOption(sort);
      await page.waitForFunction((selectedSort) => document.querySelector(".catalog-sort select")?.value === selectedSort && document.querySelectorAll(".catalog-stone").length > 0, sort);
      assert.equal(await page.locator(".catalog-sort select").inputValue(), sort, `buyers can select ${sort}`);
    }
    const analytics = await page.evaluate(() => window.__alvoraAnalytics);
    assert.deepEqual(analytics.map((event) => event.event), ["availability_first_screen_view", "availability_first_screen_view", "availability_first_screen_view"]);
    assert.deepEqual(analytics.map((event) => event.data.tab), ["Fancy Colour", "White", "statement"]);
    assert.ok(analytics.every((event) => Array.isArray(event.data.first_stock_nos) && event.data.first_stock_nos.length === 8));
    console.info("Curated top-eight evidence:", JSON.stringify(output));
  } finally {
    await browser.close();
  }
});
