import fs from "fs";
import path from "path";
import type { Express, Request } from "express";
import { getPublicAvailabilitySummary } from "./db";

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

const AVAILABILITY_ALTERNATES = [
  { hreflang: "en",        path: "/availability" },
  { hreflang: "fr",        path: "/fr/availability" },
  { hreflang: "it",        path: "/it/availability" },
  { hreflang: "x-default", path: "/availability" },
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
  "/availability":    { changefreq: "daily", priority: "0.9", alternates: AVAILABILITY_ALTERNATES },
  "/fr/availability": { changefreq: "daily", priority: "0.8", alternates: AVAILABILITY_ALTERNATES },
  "/it/availability": { changefreq: "daily", priority: "0.8", alternates: AVAILABILITY_ALTERNATES },
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
  "/contact":                    { changefreq: "monthly", priority: "0.8" },
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
  "/matched-lab-grown-diamond-pairs":         { changefreq: "monthly", priority: "0.7" },
  "/custom-cut-lab-grown-diamonds":            { changefreq: "monthly", priority: "0.7" },
  "/igi-certified-lab-grown-diamonds":         { changefreq: "monthly", priority: "0.7" },
  "/cvd-lab-grown-diamonds":                   { changefreq: "monthly", priority: "0.6" },
  "/hpht-lab-grown-diamonds":                  { changefreq: "monthly", priority: "0.6" },
  "/fancy-shape-colour-lab-grown-diamonds":    { changefreq: "monthly", priority: "0.6" },
  "/precision-lab-grown-diamond-wholesale":    { changefreq: "monthly", priority: "0.7" },
  "/singapore":                                  { changefreq: "weekly",  priority: "0.8" },
  "/singapore/wholesale-lab-grown-diamonds":    { changefreq: "monthly", priority: "0.7" },
  "/singapore/lab-grown-diamond-wholesaler":    { changefreq: "monthly", priority: "0.7" },
  "/singapore/for-jewellers":                   { changefreq: "monthly", priority: "0.7" },
  "/singapore/lab-grown-diamond-supplier":      { changefreq: "monthly", priority: "0.7" },
  "/singapore/calibrated-parcels":              { changefreq: "monthly", priority: "0.7" },
  "/singapore/matched-pairs":                   { changefreq: "monthly", priority: "0.7" },
  "/singapore/melee":                           { changefreq: "monthly", priority: "0.7" },
  "/singapore/for-manufacturers":               { changefreq: "monthly", priority: "0.7" },
  "/singapore/surat-to-singapore":              { changefreq: "monthly", priority: "0.7" },
  "/singapore/wholesale-parcels":               { changefreq: "monthly", priority: "0.7" },
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

/**
 * Client-side pagination on /availability uses pageSize 48. Kept in sync with
 * PublicAvailability.tsx `pageSize: 48` in filterInput.
 */
const AVAILABILITY_PAGE_SIZE = 48;

/**
 * Availability catalogue paths that support ?page=N pagination. Kept in sync
 * with PAGINATED_ROUTES in server/seoInjection.ts.
 */
const PAGINATED_AVAILABILITY_PATHS: Array<{ path: string; collection: "core" | "statement" | "combined" }> = [
  { path: "/availability", collection: "combined" },
  { path: "/fr/availability", collection: "combined" },
  { path: "/it/availability", collection: "combined" },
];

/**
 * Query live totals from the same summary the tRPC catalogue endpoint uses.
 * Falls back to an empty map when the DB is unreachable (build time on Railway
 * without DATABASE_URL, or CI). In that case paginated URLs are omitted from
 * the sitemap — page 1 still ships from the standard PUBLIC_ROUTES entries.
 */
async function fetchPaginatedTotals(): Promise<Map<string, number>> {
  const totals = new Map<string, number>();
  try {
    const [core, statement] = await Promise.all([
      getPublicAvailabilitySummary({ collection: "core" }),
      getPublicAvailabilitySummary({ collection: "statement" }),
    ]);
    const combined = (core.total ?? 0) + (statement.total ?? 0);
    for (const entry of PAGINATED_AVAILABILITY_PATHS) {
      if (entry.collection === "core") totals.set(entry.path, core.total ?? 0);
      else if (entry.collection === "statement") totals.set(entry.path, statement.total ?? 0);
      else totals.set(entry.path, combined);
    }
  } catch {
    /* DB unavailable — sitemap will omit paginated URLs this build. */
  }
  return totals;
}

function buildPaginatedEntries(origin: string, totals: Map<string, number>): string[] {
  const rows: string[] = [];
  for (const { path: base } of PAGINATED_AVAILABILITY_PATHS) {
    const total = totals.get(base) ?? 0;
    if (total <= AVAILABILITY_PAGE_SIZE) continue;
    const totalPages = Math.min(1000, Math.ceil(total / AVAILABILITY_PAGE_SIZE));
    // Page 1 is emitted from the standard PUBLIC_ROUTES entry; start at page 2.
    for (let page = 2; page <= totalPages; page += 1) {
      const loc = esc(`${origin}${base}?page=${page}`);
      rows.push([
        "  <url>",
        `    <loc>${loc}</loc>`,
        `    <lastmod>${esc(BUILD_DATE)}</lastmod>`,
        `    <changefreq>weekly</changefreq>`,
        `    <priority>0.5</priority>`,
        "  </url>",
      ].join("\n"));
    }
  }
  return rows;
}

export async function renderSitemap(origin: string): Promise<string> {
  const staticEntries = SITEMAP_ENTRIES.map((entry) => buildSitemapEntry(origin, entry));
  const paginatedTotals = await fetchPaginatedTotals();
  const paginatedEntries = buildPaginatedEntries(origin, paginatedTotals);
  const entries = [...staticEntries, ...paginatedEntries].join("\n");
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
    "Disallow: /api/",
    "",
    `Sitemap: ${sitemapOrigin}/sitemap.xml`,
    "",
    `# LLM agent index: ${sitemapOrigin}/llms.txt`,
    `# LLM full feed:   ${sitemapOrigin}/llms-full.txt`,
    "",
  ].join("\n");
}

// ── Route registration ────────────────────────────────────────────────────────

export function registerPublicSeoRoutes(app: Express) {
  app.get("/robots.txt", (request, response) => {
    response.type("text/plain").set("Cache-Control", "public, max-age=3600").send(renderRobots(getPublicOrigin(request)));
  });
  app.get("/sitemap.xml", async (request, response) => {
    const xml = await renderSitemap(getPublicOrigin(request));
    response.type("application/xml").set("Cache-Control", "public, max-age=3600").send(xml);
  });
}
