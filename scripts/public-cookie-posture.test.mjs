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
      // GA4 (googletagmanager.com/gtag/js) is approved with client_storage:'none' — cookie-free.
      // All other third-party trackers remain blocked.
      unexpectedTrackerScripts: Array.from(document.scripts)
        .map((script) => script.src)
        .filter((src) => /google-analytics|facebook\.net|hotjar|clarity\.ms|fullstory|segment\.com/i.test(src)),
      // If GA4 is configured, it must only load the gtag.js script — not an arbitrary GTM container.
      ga4Scripts: Array.from(document.scripts)
        .map((script) => script.src)
        .filter((src) => /googletagmanager\.com/i.test(src)),
    }));
    // No cookies — GA4 is configured with client_storage:'none' so it sets none.
    assert.equal(result.cookies, "");
    assert.equal(result.consentElements, 0);
    assert.equal(result.analyticsScripts.length, 1);
    assert.match(result.analyticsScripts[0].src, /\/umami(?:\?|$)/);
    assert.ok(result.analyticsScripts[0].websiteId);
    assert.deepEqual(result.unexpectedTrackerScripts, []);
    // Any googletagmanager script must be the GA4 gtag.js endpoint only.
    for (const src of result.ga4Scripts) {
      assert.match(src, /^https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=/);
    }
    await context.close();
  } finally {
    await browser.close();
  }
});
