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

type SitemapEntry = {
  path: string;
  changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: string;
  alternates?: ReadonlyArray<{ hreflang: string; path: string }>;
};

// All locale versions of the homepage share the same hreflang set.
const HOME_ALTERNATES = [
  { hreflang: "en", path: "/" },
  { hreflang: "fr", path: "/fr" },
  { hreflang: "it", path: "/it" },
  { hreflang: "en-US", path: "/us" },
  { hreflang: "x-default", path: "/" },
] as const;

// Public routes submitted to search engines.
// Extend this array when new indexable routes are added.
// /availability, /buyer-availability, /admin, /refer, /api are intentionally absent.
// /insights is included but currently noindex — update priority to 0.7 when content ships.
const SITEMAP_ENTRIES: SitemapEntry[] = [
  { path: "/",        changefreq: "weekly",  priority: "1.0", alternates: HOME_ALTERNATES },
  { path: "/fr",      changefreq: "weekly",  priority: "0.9", alternates: HOME_ALTERNATES },
  { path: "/it",      changefreq: "weekly",  priority: "0.9", alternates: HOME_ALTERNATES },
  { path: "/us",      changefreq: "weekly",  priority: "0.9", alternates: HOME_ALTERNATES },
  { path: "/insights", changefreq: "monthly", priority: "0.5" },
  { path: "/privacy", changefreq: "yearly",  priority: "0.3" },
  { path: "/terms",   changefreq: "yearly",  priority: "0.3" },
];

// Keep this in sync with SITEMAP_ENTRIES for external callers (sitemap test, prerender).
export const PUBLIC_SITEMAP_PATHS = SITEMAP_ENTRIES.map((e) => e.path) as string[];

function buildSitemapEntry(origin: string, entry: SitemapEntry, lastmod: string): string {
  const loc = esc(`${origin}${entry.path}`);
  const altLinks = entry.alternates
    ? entry.alternates
        .map(({ hreflang, path }) => `    <xhtml:link rel="alternate" hreflang="${esc(hreflang)}" href="${esc(`${origin}${path}`)}"/>`)
        .join("\n")
    : "";
  return [
    "  <url>",
    `    <loc>${loc}</loc>`,
    `    <lastmod>${esc(lastmod)}</lastmod>`,
    `    <changefreq>${entry.changefreq}</changefreq>`,
    `    <priority>${entry.priority}</priority>`,
    altLinks || null,
    "  </url>",
  ]
    .filter((line) => line !== null)
    .join("\n");
}

export function renderSitemap(origin: string): string {
  const lastmod = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const entries = SITEMAP_ENTRIES.map((entry) => buildSitemapEntry(origin, entry, lastmod)).join("\n");
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
