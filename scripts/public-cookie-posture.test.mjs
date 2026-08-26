import assert from "node:assert/strict";
import test from "node:test";
import { chromium } from "playwright-core";

const pageUrl = process.env.PUBLIC_TEST_BASE_URL || "http://localhost:3000/us";

test("public route loads the documented tracker without consent UI or public tracker cookies", async () => {
  const browser = await chromium.launch({
    executablePath: "/usr/bin/chromium",
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(pageUrl, { waitUntil: "networkidle" });
    const result = await page.evaluate(() => ({
      cookies: document.cookie,
      consentElements: Array.from(document.querySelectorAll('[id*="consent" i],[class*="consent" i],[id*="cookie" i],[class*="cookie" i]')).length,
      analyticsScripts: Array.from(document.scripts)
        .filter((script) => script.src.includes("umami"))
        .map((script) => ({ src: script.src, websiteId: script.getAttribute("data-website-id") })),
      unexpectedTrackerScripts: Array.from(document.scripts)
        .map((script) => script.src)
        .filter((src) => /google-analytics|googletagmanager|facebook\.net|hotjar|clarity\.ms|fullstory|segment\.com/i.test(src)),
    }));
    assert.equal(result.cookies, "");
    assert.equal(result.consentElements, 0);
    assert.equal(result.analyticsScripts.length, 1);
    assert.match(result.analyticsScripts[0].src, /\/umami(?:\?|$)/);
    assert.ok(result.analyticsScripts[0].websiteId);
    assert.deepEqual(result.unexpectedTrackerScripts, []);
    await context.close();
  } finally {
    await browser.close();
  }
});
