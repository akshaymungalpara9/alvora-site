import { describe, expect, it } from "vitest";
import { marketLandingContent } from "../client/src/pages/MarketLanding";

describe("localized market landing content", () => {
  it("uses permitted synthetic-diamond terminology and excludes prohibited French terms", () => {
    const frenchCopy = JSON.stringify(marketLandingContent.fr).toLowerCase();

    expect(frenchCopy).toContain("diamant synthétique");
    for (const prohibitedTerm of ["diamant de laboratoire", "diamant cultivé", "cultivé en laboratoire", "lab-grown"]) {
      expect(frenchCopy).not.toContain(prohibitedTerm);
    }
  });

  it("keeps Italian terminology and the North American country-to-market mapping explicit", () => {
    const italianCopy = JSON.stringify(marketLandingContent.it).toLowerCase();
    expect(italianCopy).toContain("diamanti sintetici");
    expect(marketLandingContent.us.northAmerica?.countries).toEqual([["United States", "US"], ["Canada", "CA"]]);
  });

  it("keeps the owner-provided experience and dispatch proof points across public market variants", () => {
    expect(marketLandingContent.fr.heritage.numbers.slice(0, 2)).toEqual([["25+", "ans d’expérience"], ["10 000+", "pierres expédiées"]]);
    expect(marketLandingContent.it.heritage.numbers.slice(0, 2)).toEqual([["25+", "anni di esperienza"], ["10.000+", "pietre spedite"]]);
    expect(marketLandingContent.us.heritage.numbers.slice(0, 2)).toEqual([["25+", "years of experience"], ["10,000+", "stones dispatched"]]);
  });
});
