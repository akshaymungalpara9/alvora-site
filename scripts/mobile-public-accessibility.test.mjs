import assert from "node:assert/strict";
import test from "node:test";
import { chromium } from "playwright-core";

const pageUrl = process.env.PUBLIC_TEST_BASE_URL || "http://localhost:3000/it";

test("Italian skip link hands keyboard focus to main content at a mobile viewport", async () => {
  const browser = await chromium.launch({
    executablePath: "/usr/bin/chromium",
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  try {
    const page = await browser.newPage({ viewport: { width: 375, height: 812 }, isMobile: true });
    await page.goto(pageUrl, { waitUntil: "networkidle" });
    const skip = page.getByRole("link", { name: "Vai al contenuto principale" });
    await skip.focus();
    await assert.doesNotReject(async () => expectFocused(page, ".skip-link"));
    await page.keyboard.press("Enter");
    await page.waitForFunction(() => document.activeElement?.id === "main-content");
    const result = await page.evaluate(() => ({
      width: window.innerWidth,
      hash: window.location.hash,
      activeId: document.activeElement?.id,
      targetTabIndex: document.getElementById("main-content")?.tabIndex,
    }));
    assert.equal(result.width, 375);
    assert.equal(result.hash, "#main-content");
    assert.equal(result.activeId, "main-content");
    assert.equal(result.targetTabIndex, -1);
  } finally {
    await browser.close();
  }
});

async function expectFocused(page, selector) {
  const focused = await page.evaluate((target) => document.activeElement?.matches(target), selector);
  assert.equal(focused, true);
}
