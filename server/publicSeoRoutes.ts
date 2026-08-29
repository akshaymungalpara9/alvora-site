import type { Express, Request } from "express";

export const PUBLIC_SITEMAP_PATHS = [
  "/",
  "/fr",
  "/it",
  "/us",
  "/insights",
  "/availability",
  "/insights/choose-lab-grown-diamond-manufacturer-india",
  "/insights/oem-odm-private-label-jewellery",
  "/insights/cad-to-certified-sample-qc-process",
  "/insights/lab-grown-diamond-moq-sampling-lead-time",
  "/insights/export-jewellery-manufacturer-due-diligence",
  "/insights/importing-lab-grown-diamonds-from-india",
  "/insights/b2b-diamond-manufacturer-case-study-checklist",
  "/oem-private-label-lab-grown-diamond-jewellery",
  "/wholesale-lab-grown-diamond-jewellery",
  "/export-lab-grown-diamond-jewellery",
  "/custom-jewellery-manufacturing",
  "/lab-grown-diamond-rings-wholesale",
  "/trade-catalogue",
  "/process-and-documentation",
  "/wholesale-cvd-diamonds-surat",
  "/hpht-fancy-color-lab-grown",
  "/bulk-melee-parcels",
  "/trade-registration",
  "/privacy",
  "/terms",
] as const;

function escapeXml(value: string) {
  return value.replace(
    /[<>&"']/g,
    character =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;",
        "'": "&apos;",
      })[character]!
  );
}

export function getPublicOrigin(request: Pick<Request, "get" | "protocol">) {
  const forwardedProtocol = request
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim();
  const protocol =
    forwardedProtocol === "https"
      ? "https"
      : request.protocol === "https"
        ? "https"
        : "http";
  const host = request.get("host") || "localhost";
  return `${protocol}://${host}`;
}

export function renderSitemap(origin: string) {
  const locations = PUBLIC_SITEMAP_PATHS.map(
    path => `  <url><loc>${escapeXml(`${origin}${path}`)}</loc></url>`
  ).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${locations}\n</urlset>\n`;
}

export function renderRobots(origin: string) {
  return `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /admin/\n\nDisallow: /api/\n\nSitemap: ${origin}/sitemap.xml\n`;
}

export function registerPublicSeoRoutes(app: Express) {
  app.get("/robots.txt", (request, response) => {
    response
      .type("text/plain")
      .set("Cache-Control", "public, max-age=3600")
      .send(renderRobots(getPublicOrigin(request)));
  });
  app.get("/sitemap.xml", (request, response) => {
    response
      .type("application/xml")
      .set("Cache-Control", "public, max-age=3600")
      .send(renderSitemap(getPublicOrigin(request)));
  });
}
