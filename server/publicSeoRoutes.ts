import fs from "fs";
import path from "path";
import type { Express, Request } from "express";

// ── Canonical origin ──────────────────────────────────────────────────────────
// Set CANONICAL_ORIGIN=https://www.alvoradiamonds.com in Railway Variables so
// that canonical tags, sitemaps, and robots.txt always resolve to the primary
// www domain regardless of which Railway host received the request.

export function getPublicOrigin(request: Pick<Request, "get" | "protocol">) {
  if (process.env.CANONICAL_ORIGIN) {
    return process.env.CANONICAL_ORIGIN.replace(/\/$/, "");
  }
  const forwardedProtocol = request.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProtocol === "https" ? "https" : request.protocol === "https" ? "https" : "http";
  const host = request.get("host") || "localhost";
  return `${protocol}://${host}`;
}

// ── Sitemap ───────────────────────────────────────────────────────────────────

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Single source of truth: scripts/publicRoutes.json.
// In production the build script copies this file to dist/publicRoutes.json.
// In development tsx resolves it from the actual server/ source directory.
function loadPublicRoutes(): string[] {
  const candidates = [
    path.resolve(import.meta.dirname, "publicRoutes.json"),          // prod: dist/publicRoutes.json
    path.resolve(import.meta.dirname, "../scripts/publicRoutes.json"), // dev: scripts/publicRoutes.json
  ];
  for (const p of candidates) {
    try {
      return JSON.parse(fs.readFileSync(p, "utf-8")) as string[];
    } catch { /* try next */ }
  }
  throw new Error("[publicSeoRoutes] publicRoutes.json not found in any candidate path");
}

// ISO date of the most recent build, derived from the prerendered manifest mtime.
// Falls back to today if no build artefact is found (dev mode or first build).
function getBuildDate(): string {
  const candidates = [
    path.resolve(import.meta.dirname, "prerendered", "manifest.json"), // prod
    path.resolve(import.meta.dirname, "../dist/prerendered/manifest.json"), // dev
  ];
  for (const p of candidates) {
    try {
      return fs.statSync(p).mtime.toISOString().split("T")[0];
    } catch { /* try next */ }
  }
  return new Date().toISOString().split("T")[0];
}

const PUBLIC_ROUTES = loadPublicRoutes();
const BUILD_DATE = getBuildDate();

// Keep this in sync with the export below; used by sitemap test and prerender.
export const PUBLIC_SITEMAP_PATHS = PUBLIC_ROUTES;

const HOME_ALTERNATES = [
  { hreflang: "en",      path: "/" },
  { hreflang: "fr",      path: "/fr" },
  { hreflang: "it",      path: "/it" },
  { hreflang: "en-US",   path: "/us" },
  { hreflang: "x-default", path: "/" },
] as const;

type SitemapEntry = {
  path: string;
  changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: string;
  alternates?: ReadonlyArray<{ hreflang: string; path: string }>;
};

type RouteMetadata = Omit<SitemapEntry, "path">;

// Per-route sitemap metadata. Paths come from publicRoutes.json; only metadata lives here.
const ROUTE_META: Record<string, RouteMetadata> = {
  "/":    { changefreq: "weekly",  priority: "1.0", alternates: HOME_ALTERNATES },
  "/fr":  { changefreq: "weekly",  priority: "0.9", alternates: HOME_ALTERNATES },
  "/it":  { changefreq: "weekly",  priority: "0.9", alternates: HOME_ALTERNATES },
  "/us":  { changefreq: "weekly",  priority: "0.9", alternates: HOME_ALTERNATES },
  "/calibrated-diamond-layouts": { changefreq: "monthly", priority: "0.8" },
  "/matched-pair-diamonds":      { changefreq: "monthly", priority: "0.8" },
  "/custom-cut-diamonds":        { changefreq: "monthly", priority: "0.8" },
  "/melee-diamonds":             { changefreq: "monthly", priority: "0.8" },
  "/certifications":             { changefreq: "monthly", priority: "0.7" },
  "/about":                      { changefreq: "monthly", priority: "0.7" },
  "/for-jewelry-brands":         { changefreq: "monthly", priority: "0.8" },
  "/request-a-quote":            { changefreq: "monthly", priority: "0.9" },
  "/insights":                                              { changefreq: "monthly", priority: "0.7" },
  "/insights/are-lab-grown-diamonds-real-diamonds":         { changefreq: "monthly", priority: "0.7" },
  "/insights/best-lab-grown-diamond-manufacturer-for-your-need": { changefreq: "monthly", priority: "0.7" },
  "/insights/is-a-lab-grown-diamond-worth-it":              { changefreq: "monthly", priority: "0.7" },
  "/insights/lab-grown-diamond-price-per-carat":            { changefreq: "monthly", priority: "0.7" },
  "/insights/lab-grown-diamond-wholesale-how-to-buy":       { changefreq: "monthly", priority: "0.6" },
  "/insights/largest-lab-grown-diamond-manufacturers-india":{ changefreq: "monthly", priority: "0.6" },
  "/insights/12-questions-to-ask-a-manufacturer":           { changefreq: "monthly", priority: "0.6" },
  "/insights/calibrated-diamond-layouts-explained":         { changefreq: "monthly", priority: "0.6" },
  "/insights/cvd-vs-hpht-lab-grown-diamonds":               { changefreq: "monthly", priority: "0.6" },
  "/insights/matched-pairs-vs-melee-vs-layouts":            { changefreq: "monthly", priority: "0.6" },
  "/insights/sourcing-lab-grown-diamonds-from-surat":       { changefreq: "monthly", priority: "0.6" },
  "/privacy": { changefreq: "yearly",  priority: "0.3" },
  "/terms":   { changefreq: "yearly",  priority: "0.3" },
};

const SITEMAP_ENTRIES: SitemapEntry[] = PUBLIC_ROUTES.map((p) => ({
  path: p,
  ...(ROUTE_META[p] ?? { changefreq: "monthly", priority: "0.5" }),
}));

function buildSitemapEntry(origin: string, entry: SitemapEntry): string {
  const loc = esc(`${origin}${entry.path}`);
  const altLinks = entry.alternates
    ? entry.alternates
        .map(({ hreflang, path: p }) => `    <xhtml:link rel="alternate" hreflang="${esc(hreflang)}" href="${esc(`${origin}${p}`)}"/>`)
        .join("\n")
    : "";
  return [
    "  <url>",
    `    <loc>${loc}</loc>`,
    `    <lastmod>${esc(BUILD_DATE)}</lastmod>`,
    `    <changefreq>${entry.changefreq}</changefreq>`,
    `    <priority>${entry.priority}</priority>`,
    altLinks || null,
    "  </url>",
  ]
    .filter((line) => line !== null)
    .join("\n");
}

export function renderSitemap(origin: string): string {
  const entries = SITEMAP_ENTRIES.map((entry) => buildSitemapEntry(origin, entry)).join("\n");
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    entries,
    "</urlset>",
    "",
  ].join("\n");
}

// ── robots.txt ────────────────────────────────────────────────────────────────

export function renderRobots(origin: string): string {
  // Always point Sitemap to the canonical domain, not a Railway preview host.
  const sitemapOrigin = process.env.CANONICAL_ORIGIN?.replace(/\/$/, "") ?? origin;
  return [
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin",
    "Disallow: /admin/",
    "Disallow: /availability",
    "Disallow: /buyer-availability",
    "Disallow: /api/",
    "",
    `Sitemap: ${sitemapOrigin}/sitemap.xml`,
    "",
  ].join("\n");
}

// ── Route registration ────────────────────────────────────────────────────────

export function registerPublicSeoRoutes(app: Express) {
  app.get("/robots.txt", (request, response) => {
    response.type("text/plain").set("Cache-Control", "public, max-age=3600").send(renderRobots(getPublicOrigin(request)));
  });
  app.get("/sitemap.xml", (request, response) => {
    response.type("application/xml").set("Cache-Control", "public, max-age=3600").send(renderSitemap(getPublicOrigin(request)));
  });
}
