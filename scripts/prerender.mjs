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
 * enhancement, not a build blocker. When Chromium is unavailable the script
 * falls back to committed snapshots in prerendered/ (project root) if they
 * exist, so Railway always deploys real body content even when the build
 * environment has no browser.
 *
 * After a successful run the fresh snapshots are mirrored to prerendered/
 * (project root) so they can be committed and used as the Railway fallback.
 * Run `pnpm prerender` locally after content changes and commit the result.
 */

import { chromium } from "playwright-core";
import { execFileSync } from "child_process";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPublic   = path.resolve(__dirname, "../dist/public");
const outDir       = path.resolve(__dirname, "../dist/prerendered");  // gitignored, built each run
const committedDir = path.resolve(__dirname, "../prerendered");        // tracked in git, Railway fallback

// Routes are sourced from scripts/publicRoutes.json — the single source of truth
// shared with server/publicSeoRoutes.ts. Do not add routes here directly.
const ROUTES = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "publicRoutes.json"), "utf-8")
);
const PORT = 4173;

function routeKey(route) {
  return route === "/" ? "index" : route.slice(1).replace(/\//g, "-");
}

// ── 1. Minimal static server ──────────────────────────────────────────────────

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

// Check if a system chromium is available in PATH (covers nixpkgs on Railway).
let pathChromium = null;
try {
  const result = execFileSync("which", ["chromium"], {
    encoding: "utf-8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();
  if (result) pathChromium = result;
} catch {}

// macOS: ~/Library/Caches/ms-playwright/<revision>/chrome-{mac,headless-shell}-{arm64,x64}/...
const macCache = `${process.env.HOME}/Library/Caches/ms-playwright`;
const macCandidates = fs.existsSync(macCache)
  ? fs.readdirSync(macCache).flatMap((dir) => [
      `${macCache}/${dir}/chrome-headless-shell-mac-arm64/chrome-headless-shell`,
      `${macCache}/${dir}/chrome-headless-shell-mac-x64/chrome-headless-shell`,
      `${macCache}/${dir}/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`,
      `${macCache}/${dir}/chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`,
    ])
  : [];

// Linux: ~/.cache/ms-playwright/<revision>/chrome-{headless-shell-,}linux{,-x64,-arm64}/...
const linuxCache = `${process.env.HOME}/.cache/ms-playwright`;
const linuxCandidates = fs.existsSync(linuxCache)
  ? fs.readdirSync(linuxCache).flatMap((dir) => [
      `${linuxCache}/${dir}/chrome-headless-shell-linux-x64/headless_shell`,
      `${linuxCache}/${dir}/chrome-headless-shell-linux-arm64/headless_shell`,
      `${linuxCache}/${dir}/chrome-linux-x64/chrome`,
      `${linuxCache}/${dir}/chrome-linux/chrome`,
    ])
  : [];

const candidates = [
  process.env.CHROMIUM_PATH,
  pathChromium,                    // nixpkgs chromium via PATH
  "/usr/bin/chromium",             // Debian package (not the Ubuntu snap wrapper)
  "/usr/bin/chromium-browser",
  "/snap/bin/chromium",
  ...linuxCandidates,
  ...macCandidates,
].filter(Boolean);

const executablePath = candidates.find((p) => fs.existsSync(p));

// ── 3. Committed-snapshot fallback ────────────────────────────────────────────
// Called from every early-exit path (binary not found, launch failure, etc.)
// so the server always gets prerendered content even when no browser is available.

function useCommittedFallback(reason) {
  const committedManifest = path.join(committedDir, "manifest.json");
  if (fs.existsSync(committedManifest)) {
    console.log(
      `[prerender] ${reason} — copying committed snapshots from prerendered/ to dist/prerendered/.\n` +
      "  Run `pnpm prerender` locally and commit prerendered/ to keep them current."
    );
    fs.mkdirSync(outDir, { recursive: true });
    for (const file of fs.readdirSync(committedDir)) {
      fs.copyFileSync(path.join(committedDir, file), path.join(outDir, file));
    }
    const manifest = JSON.parse(fs.readFileSync(committedManifest, "utf-8"));
    console.log(`[prerender] Copied ${Object.keys(manifest).length} committed snapshot(s).`);
  } else {
    console.warn(
      `[prerender] ${reason} and no committed prerendered/ folder exists.\n` +
      "  Routes will be served with SEO-injected head tags but no prerendered body.\n" +
      "  Fix: run `pnpm prerender` locally, commit the prerendered/ folder, and redeploy."
    );
  }
}

if (!executablePath) {
  useCommittedFallback("Chromium binary not found");
  staticServer.close();
  process.exit(0);
}

console.log(`[prerender] Using Chromium at: ${executablePath}`);

// ── 4. Launch browser ─────────────────────────────────────────────────────────
let browser;
try {
  browser = await chromium.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
} catch (err) {
  console.warn(`[prerender] Browser launch failed: ${err.message}`);
  useCommittedFallback("Browser launch failed");
  staticServer.close();
  process.exit(0);
}

// ── 5. Snapshot each route ────────────────────────────────────────────────────
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

// ── 6. Write manifest ─────────────────────────────────────────────────────────
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

// ── 7. Mirror to committed prerendered/ so Railway always has a fallback ───────
fs.mkdirSync(committedDir, { recursive: true });
for (const file of fs.readdirSync(outDir)) {
  fs.copyFileSync(path.join(outDir, file), path.join(committedDir, file));
}
console.log(
  `[prerender] Mirrored snapshots → prerendered/  (commit this folder; Railway uses it when Chromium is unavailable)`
);
