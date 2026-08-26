import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { marketLandingContent } from "../client/src/pages/MarketLanding";

describe("public landing accessibility structure", () => {
  it("provides a localised skip link and concise maker-image descriptions for every market route", () => {
    for (const content of Object.values(marketLandingContent)) {
      expect(content.a11y.skip.length).toBeGreaterThan(12);
      expect(content.a11y.main.length).toBeGreaterThan(8);
      expect(content.a11y.heroAlt.length).toBeGreaterThan(24);
      expect(content.a11y.facetingAlt.length).toBeGreaterThan(24);
      expect(content.a11y.laserAlt.length).toBeGreaterThan(24);
    }
    expect(marketLandingContent.fr.a11y.skip).toMatch(/Aller/i);
    expect(marketLandingContent.it.a11y.skip).toMatch(/Vai/i);
  });

  it("keeps focus treatment and skip targets in both public page shells", () => {
    const styles = readFileSync("client/src/index.css", "utf8");
    const home = readFileSync("client/src/pages/Home.tsx", "utf8");
    const market = readFileSync("client/src/pages/MarketLanding.tsx", "utf8");
    expect(styles).toContain(":focus-visible");
    expect(styles).toContain(".skip-link");
    expect(home).toContain('href="#main-content"');
    expect(market).toContain('href="#main-content"');
    expect(home).toContain('id="main-content"');
    expect(market).toContain('id="main-content"');
  });
});
