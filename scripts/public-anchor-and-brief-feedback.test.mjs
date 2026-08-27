import assert from "node:assert/strict";
import test from "node:test";
import { chromium } from "playwright-core";

const baseUrl = process.env.PUBLIC_CATALOG_BASE_URL || "http://localhost:3000";

async function withPage(run) {
  const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
  try {
    await run(await browser.newPage({ viewport: { width: 1280, height: 720 } }));
  } finally {
    await browser.close();
  }
}

for (const target of ["production", "made-to-spec", "how-we-work", "production-brief"]) {
  test(`direct #${target} navigation reaches a visible public section`, async () => {
    await withPage(async (page) => {
      await page.goto(`${baseUrl}/#${target}`, { waitUntil: "networkidle" });
      await page.waitForFunction((id) => {
        const section = document.getElementById(id);
        if (!section) return false;
        const bounds = section.getBoundingClientRect();
        const style = window.getComputedStyle(section);
        return bounds.top < window.innerHeight && bounds.bottom > 72 && style.visibility !== "hidden" && style.opacity !== "0";
      }, target, { timeout: 12_000 });
      assert.equal(await page.evaluate(() => window.location.hash), `#${target}`);
    });
  });
}

test("header anchors and production-brief confirmation remain usable without a real lead submission", async () => {
  await withPage(async (page) => {
    await page.route("**/api/trpc/productionBrief.submit**", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify([{ result: { data: { json: { id: 1, alertStatus: "sent" } } } }]),
      });
    });
    await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
    await page.getByRole("link", { name: "Our production", exact: true }).click();
    await page.waitForFunction(() => {
      const bounds = document.getElementById("production")?.getBoundingClientRect();
      return Boolean(bounds && bounds.top < window.innerHeight && bounds.bottom > 72);
    });

    await page.getByRole("button", { name: "Commission a make" }).first().click();
    await page.waitForFunction(() => {
      const bounds = document.getElementById("production-brief")?.getBoundingClientRect();
      return Boolean(bounds && bounds.top < window.innerHeight && bounds.bottom > 72);
    });
    await page.locator('input[name="name"]').fill("Audit Test");
    await page.locator('input[name="email"]').fill("audit@example.com");
    await page.locator('textarea[name="brief"]').fill("AUDIT TEST — browser feedback verification only.");
    await page.getByRole("button", { name: "Send production brief" }).click();
    const confirmation = page.locator(".form-confirmation-sent");
    await confirmation.waitFor({ state: "visible", timeout: 12_000 });
    await assert.doesNotReject(async () => confirmation.textContent());
    assert.match(await confirmation.textContent() || "", /recorded and sent/i);
  });
});
