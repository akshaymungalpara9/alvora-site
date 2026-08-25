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
});
