import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("public maker-positioning language", () => {
  it("keeps sourcing and supply terminology out of public English, French, Italian, and North American route copy", () => {
    const publicRouteSources = [
      readFileSync("client/src/pages/Home.tsx", "utf8"),
      readFileSync("client/src/pages/MarketLanding.tsx", "utf8"),
      readFileSync("client/src/pages/LegalPage.tsx", "utf8"),
      readFileSync("client/src/pages/Insights.tsx", "utf8"),
      readFileSync("client/src/pages/Refer.tsx", "utf8"),
      readFileSync("client/src/pages/PublicAvailability.tsx", "utf8"),
      readFileSync("client/src/components/WhatsAppQuickContact.tsx", "utf8"),
    ].join("\n").toLowerCase();

    for (const prohibited of ["sourcing", "supply", "supplier", "fournisseur", "fornitore", "approvisionnement", "fornitura"]) {
      expect(publicRouteSources).not.toContain(prohibited);
    }
  });

  it("keeps price fields, computations, filters, and sorting out of public catalog, protected buyer list, and line-sheet sources", () => {
    const catalogAndCollateral = [
      readFileSync("client/src/pages/PublicAvailability.tsx", "utf8"),
      readFileSync("client/src/pages/BuyerAvailability.tsx", "utf8"),
      readFileSync("server/lineSheets.ts", "utf8"),
    ].join("\n");

    for (const prohibited of ["price_usd", "stone.price", "price:", "sortByPrice", "priceRange"]) {
      expect(catalogAndCollateral).not.toContain(prohibited);
    }
  });
});
