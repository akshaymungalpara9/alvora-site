import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { PUBLIC_SITEMAP_PATHS, renderRobots, renderSitemap } from "./publicSeoRoutes";

describe("public legal and SEO surfaces", () => {
  it("keeps the privacy and trade-terms routes, footer links, and plain-language safeguards in place", () => {
    const app = readFileSync("client/src/App.tsx", "utf8");
    const legal = readFileSync("client/src/pages/LegalPage.tsx", "utf8");
    const home = readFileSync("client/src/pages/Home.tsx", "utf8");
    const market = readFileSync("client/src/pages/MarketLanding.tsx", "utf8");
    expect(app).toContain('path="/privacy"');
    expect(app).toContain('path="/terms"');
    expect(home).toContain('href="/privacy"');
    expect(market).toContain('href="/terms"');
    expect(legal).toContain("Resend");
    expect(legal).toContain("Umami");
    expect(legal).toContain("Governing law and jurisdiction, where relevant, are stated in the written agreement");
  });

  it("returns a host-aware sitemap and crawler rules limited to public routes", () => {
    const origin = "https://alvora.example";
    const sitemap = renderSitemap(origin);
    const robots = renderRobots(origin);
    expect(PUBLIC_SITEMAP_PATHS).toEqual([
      "/", "/fr", "/it", "/us",
      "/calibrated-diamond-layouts",
      "/matched-pair-diamonds",
      "/custom-cut-diamonds",
      "/melee-diamonds",
      "/certifications",
      "/about",
      "/for-jewelry-brands",
      "/request-a-quote",
      "/insights",
      "/insights/are-lab-grown-diamonds-real-diamonds",
      "/insights/best-lab-grown-diamond-manufacturer-for-your-need",
      "/insights/is-a-lab-grown-diamond-worth-it",
      "/insights/lab-grown-diamond-price-per-carat",
      "/insights/lab-grown-diamond-wholesale-how-to-buy",
      "/insights/largest-lab-grown-diamond-manufacturers-india",
      "/insights/12-questions-to-ask-a-manufacturer",
      "/insights/calibrated-diamond-layouts-explained",
      "/insights/cvd-vs-hpht-lab-grown-diamonds",
      "/insights/matched-pairs-vs-melee-vs-layouts",
      "/insights/sourcing-lab-grown-diamonds-from-surat",
      "/privacy",
      "/terms",
    ]);
    expect(sitemap).toContain("https://alvora.example/fr");
    expect(sitemap).toContain("https://alvora.example/privacy");
    expect(robots).toContain("Disallow: /admin");
    expect(robots).toContain("Disallow: /availability");
    expect(robots).toContain("Sitemap: https://alvora.example/sitemap.xml");
  });

  it("keeps the documented public analytics posture free of consent UI and cookie-banner integrations", () => {
    const documentHead = readFileSync("client/index.html", "utf8");
    const publicRoutes = ["client/src/pages/Home.tsx", "client/src/pages/MarketLanding.tsx", "client/src/pages/LegalPage.tsx"]
      .map((path) => readFileSync(path, "utf8"))
      .join("\n");
    expect(documentHead).toContain('%VITE_ANALYTICS_ENDPOINT%/umami');
    expect(documentHead).toContain('data-website-id="%VITE_ANALYTICS_WEBSITE_ID%"');
    expect(`${documentHead}\n${publicRoutes}`.toLowerCase()).not.toMatch(/cookie[-_ ]?banner|cookieconsent|onetrust|consent[-_ ]?manager|cmp\b/);
  });
});
