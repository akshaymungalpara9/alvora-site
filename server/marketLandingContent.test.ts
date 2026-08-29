import { describe, expect, it } from "vitest";
import { marketLandingContent } from "../client/src/pages/MarketLanding";

describe("localized market landing content", () => {
  it("uses permitted synthetic-diamond terminology and excludes prohibited French terms", () => {
    const frenchCopy = JSON.stringify(marketLandingContent.fr).toLowerCase();

    expect(frenchCopy).toContain("diamants synthétiques");
    for (const prohibitedTerm of ["diamant de laboratoire", "diamant cultivé", "cultivé en laboratoire", "lab-grown"]) {
      expect(frenchCopy).not.toContain(prohibitedTerm);
    }
  });

  it("keeps Italian terminology and the North American country-to-market mapping explicit", () => {
    const italianCopy = JSON.stringify(marketLandingContent.it).toLowerCase();
    expect(italianCopy).toContain("diamanti sintetici");
    expect(marketLandingContent.us.northAmerica?.countries).toEqual([["United States", "US"], ["Canada", "CA"]]);
  });

  it("keeps evidence-safe proof points across public market variants", () => {
    expect(marketLandingContent.fr.heritage.numbers.slice(0, 2)).toEqual([["PROFIL", "standard convenu par commande"], ["IGI", "destination du rapport affichée lorsqu’elle est fournie"]]);
    expect(marketLandingContent.it.heritage.numbers.slice(0, 2)).toEqual([["PROFILO", "standard concordato per ordine"], ["IGI", "rapporto mostrato quando disponibile"]]);
    expect(marketLandingContent.us.heritage.numbers.slice(0, 2)).toEqual([["PROFILE", "standard agreed per order"], ["IGI", "report shown where supplied"]]);
  });
});
