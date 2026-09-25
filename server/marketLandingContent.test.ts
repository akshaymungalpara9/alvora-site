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
    expect(marketLandingContent.us.delivery?.countries).toEqual([["United States", "US"], ["Canada", "CA"]]);
  });

  it("keeps verified stock and lead-time proof points across public market variants", () => {
    expect(marketLandingContent.fr.heritage.numbers.slice(0, 2)).toEqual([["3 185", "pierres certifiées en stock actuel"], ["5-10", "jours ouvrés pour une fabrication sur spécification"]]);
    expect(marketLandingContent.it.heritage.numbers.slice(0, 2)).toEqual([["3.185", "pietre certificate in stock attuale"], ["5-10", "giorni lavorativi per una lavorazione su specifica"]]);
    expect(marketLandingContent.us.heritage.numbers.slice(0, 2)).toEqual([["3,185", "certified stones in current stock"], ["5-10", "working days for a spec make"]]);
  });

  it("serves the Canada, UK, Germany and Australia market variants with a delivery panel and country-mapped brief", () => {
    expect(marketLandingContent.ca.market).toBe("CA");
    expect(marketLandingContent.uk.market).toBe("UK");
    expect(marketLandingContent.de.market).toBe("DE");
    expect(marketLandingContent.au.market).toBe("AU");
    for (const variant of ["ca", "uk", "de", "au"] as const) {
      expect(marketLandingContent[variant].delivery?.countries).toHaveLength(1);
      expect(marketLandingContent[variant].lang).toBe("en");
      const copyWithoutAllowed = JSON.stringify(marketLandingContent[variant]).replace(/100%/g, "").replace(/0% MFN duty/g, "");
      expect(copyWithoutAllowed).not.toMatch(/\d+(\.\d+)?%/);
    }
  });
});
