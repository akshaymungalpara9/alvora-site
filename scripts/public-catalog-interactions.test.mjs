import assert from "node:assert/strict";
import test from "node:test";
import { chromium } from "playwright-core";

const baseUrl = process.env.PUBLIC_CATALOG_BASE_URL || "http://localhost:3000";

test("public catalogue keeps counts, verified 360 viewing, and populated STATEMENT details usable without a sign-in", async () => {
  const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    await page.goto(`${baseUrl}/availability`, { waitUntil: "networkidle" });
    await page.waitForFunction(() => document.querySelector(".catalog-collection-tabs button")?.textContent?.includes("684") === true, undefined, { timeout: 15_000 });

    const fancyTab = page.locator(".catalog-collection-tabs button").filter({ hasText: "Fancy Colour" });
    await fancyTab.click();
    await page.locator(".catalog-filter select").first().selectOption("Cushion");
    await page.waitForFunction(() => document.querySelectorAll(".catalog-stone").length === 2, undefined, { timeout: 12_000 });
    assert.equal((await fancyTab.locator("span").textContent())?.trim(), "2", "active tab badge follows applied filters");

    const statementTab = page.locator(".catalog-collection-tabs button").filter({ hasText: "Statement" });
    await statementTab.click();
    await page.waitForFunction(() => document.querySelectorAll(".catalog-stone").length > 0, undefined, { timeout: 15_000 });
    const video = page.locator("button.catalog-video").first();
    await video.waitFor({ state: "visible", timeout: 12_000 });
    const priorUrl = page.url();
    await video.click();
    const viewer = page.locator(".catalog-viewer");
    await viewer.waitFor({ state: "visible", timeout: 12_000 });
    assert.equal(page.url(), priorUrl, "360 action stays within the public catalogue");
    assert.match(await viewer.locator("iframe").getAttribute("src") || "", /^https:\/\//, "viewer keeps the verified supplied media URL");
    await viewer.getByRole("button", { name: "Close 360 viewer" }).click();

    await page.getByRole("button", { name: "List view" }).click();
    await page.waitForFunction(() => document.querySelectorAll(".catalog-statement-list-details").length > 0, undefined, { timeout: 12_000 });
    assert.ok(await page.locator(".catalog-statement-list-details").filter({ hasText: "Crown angle" }).count() > 0, "list view shows crown angle where supplied");
    const detail = page.locator(".catalog-stone-details").filter({ has: page.locator("dt", { hasText: "Crown angle" }) }).first();
    await detail.locator("summary").click();
    assert.ok(await detail.locator("dt", { hasText: "Crown angle" }).count() > 0, "full detail view retains populated crown angle");
    assert.ok(!(await page.locator("body").innerText()).toLowerCase().includes("per carat"), "public interactions do not expose price language");
  } finally {
    await browser.close();
  }
});
