/**
 * Build-time prerender script.
 *
 * Spins up a minimal static server over dist/public/, uses Playwright to load
 * each public marketing route, waits for React to hydrate, and saves the
 * #root innerHTML to dist/prerendered/<key>.html + a manifest.json index.
 *
 * The Express production handler reads the manifest at startup and injects the
 * prerendered body alongside the normal server-side SEO tags.
 *
 * Exits 0 on any Chromium/launch failure — prerender is a best-effort build
 * enhancement, not a build blocker.
 */

import { chromium } from "playwright-core";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPublic = path.resolve(__dirname, "../dist/public");
const outDir = path.resolve(__dirname, "../dist/prerendered");

// Routes whose #root content we want to prerender. Must match the route keys
// that serveStatic checks in vite.ts.
const ROUTES = [
  "/",
  "/fr",
  "/it",
  "/us",
  "/calibrated-diamond-layouts",
  "/matched-pair-diamonds",
  "/custom-cut-diamonds",
  "/melee-diamonds",
  "/certifications",
  "/about",
  "/for-jewelry-brands",
  "/request-a-quote",
  "/insights",
  "/privacy",
  "/terms",
];
const PORT = 4173;

function routeKey(route) {
  return route === "/" ? "index" : route.slice(1).replace(/\//g, "-");
}

// ── 1. Minimal static server ──────────────────────────────────────────────────
// Serves dist/public/ without SEO injection — React runs in Playwright and
// calls applyPublicSeo() client-side, so meta tags are set correctly too.
// We only extract #root innerHTML, so the SEO origin doesn't matter here.

const indexHtml = fs.readFileSync(path.join(distPublic, "index.html"), "utf-8");
const staticApp = express();
staticApp.use(express.static(distPublic, { index: false }));
staticApp.use("*", (_req, res) => res.type("html").send(indexHtml));

const staticServer = await new Promise((resolve, reject) => {
  const s = staticApp.listen(PORT, () => resolve(s));
  s.on("error", reject);
});
console.log(`[prerender] Static server ready on http://localhost:${PORT}`);

// ── 2. Locate Chromium ────────────────────────────────────────────────────────
// Try env override first, then the paths used by every other script in this
// repo, then a snap path. Exit 0 (non-blocking) if nothing is found.

const candidates = [
  process.env.CHROMIUM_PATH,
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/snap/bin/chromium",
].filter(Boolean);

const executablePath = candidates.find((p) => fs.existsSync(p));

if (!executablePath) {
  console.warn(
    "[prerender] Chromium binary not found. Skipping prerender.\n" +
    "  Tried: " + candidates.join(", ") + "\n" +
    "  Set CHROMIUM_PATH env var to override, or add chromium-browser to nixpacks.toml.\n" +
    "  Routes will be served with the SEO-injected HTML shell."
  );
  staticServer.close();
  process.exit(0);
}

console.log(`[prerender] Using Chromium at: ${executablePath}`);

// ── 3. Launch browser ─────────────────────────────────────────────────────────
let browser;
try {
  browser = await chromium.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
} catch (err) {
  console.warn(`[prerender] Browser launch failed: ${err.message}. Skipping prerender.`);
  staticServer.close();
  process.exit(0);
}

// ── 4. Snapshot each route ────────────────────────────────────────────────────
fs.mkdirSync(outDir, { recursive: true });

const manifest = {};
const failures = [];

for (const route of ROUTES) {
  let page;
  try {
    page = await browser.newPage();
    await page.goto(`http://localhost:${PORT}${route}`, {
      waitUntil: "networkidle",
      timeout: 30_000,
    });

    // Wait until React has mounted at least one child inside #root.
    await page.waitForFunction(
      () => (document.getElementById("root")?.children.length ?? 0) > 0,
      { timeout: 15_000 }
    );

    const rootHtml = await page.evaluate(
      () => document.getElementById("root")?.innerHTML ?? ""
    );

    if (!rootHtml.trim()) throw new Error("#root is empty after hydration");

    const filename = `${routeKey(route)}.html`;
    fs.writeFileSync(path.join(outDir, filename), rootHtml, "utf-8");
    manifest[route] = filename;
    console.log(
      `[prerender] ✓ ${route.padEnd(12)} → ${filename.padEnd(18)} (${(rootHtml.length / 1024).toFixed(1)} kB)`
    );
  } catch (err) {
    console.error(`[prerender] ✗ ${route}: ${err.message}`);
    failures.push(route);
  } finally {
    await page?.close().catch(() => {});
  }
}

await browser.close();
staticServer.close();

// ── 5. Write manifest ─────────────────────────────────────────────────────────
fs.writeFileSync(
  path.join(outDir, "manifest.json"),
  JSON.stringify(manifest, null, 2) + "\n",
  "utf-8"
);
console.log(`[prerender] Manifest written: ${Object.keys(manifest).length} route(s)`);

if (failures.length) {
  console.warn(
    `[prerender] ${failures.length}/${ROUTES.length} route(s) failed ` +
    `(${failures.join(", ")}). Those routes will fall back to the SEO shell.`
  );
} else {
  console.log(`[prerender] All ${ROUTES.length} routes snapshotted.`);
}
