import assert from "node:assert/strict";
import test from "node:test";
import { chromium } from "playwright-core";

const baseUrl = process.env.PUBLIC_CATALOG_BASE_URL || "http://localhost:3000";

const publicRoutes = [
  { path: "/", label: "home" },
  { path: "/calibrated-diamond-layouts", label: "product page" },
  { path: "/request-a-quote", label: "quote page" },
];

const adminRoute = { path: "/admin", label: "admin" };

test("floating WhatsApp button appears on public routes and is absent on admin routes", async () => {
  const browser = await chromium.launch({
    executablePath: "/usr/bin/chromium",
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

    for (const route of publicRoutes) {
      await page.goto(`${baseUrl}${route.path}`, { waitUntil: "networkidle" });
      const btn = await page.$(".whatsapp-quick-contact");
      assert.ok(btn !== null, `${route.label} (${route.path}): floating WhatsApp button missing`);

      const href = await btn.getAttribute("href");
      assert.ok(href?.startsWith("https://wa.me/"), `${route.label}: href must be a wa.me link`);

      const ariaLabel = await btn.getAttribute("aria-label");
      assert.ok(ariaLabel?.includes("WhatsApp"), `${route.label}: aria-label must mention WhatsApp`);

      const box = await btn.boundingBox();
      assert.ok(box !== null && box.height >= 44, `${route.label}: tap target must be ≥44px tall`);
    }

    await page.goto(`${baseUrl}${adminRoute.path}`, { waitUntil: "networkidle" });
    const adminBtn = await page.$(".whatsapp-quick-contact");
    assert.equal(adminBtn, null, `admin route (${adminRoute.path}): floating WhatsApp button must not render`);
  } finally {
    await browser.close();
  }
});

test("product page WhatsApp button includes product name in pre-filled message", async () => {
  const browser = await chromium.launch({
    executablePath: "/usr/bin/chromium",
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    await page.goto(`${baseUrl}/calibrated-diamond-layouts`, { waitUntil: "networkidle" });
    const btn = await page.$(".whatsapp-quick-contact");
    assert.ok(btn !== null, "product page: floating WhatsApp button missing");
    const href = await btn.getAttribute("href");
    assert.ok(
      href?.includes("availability") || href?.includes("pricing"),
      `product page href should contain contextual message: ${href}`,
    );
  } finally {
    await browser.close();
  }
});
