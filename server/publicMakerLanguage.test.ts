import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("public maker-positioning language", () => {
  it("keeps sourcing and supply terminology out of public English, French, Italian, and North American route copy", () => {
    const publicRouteSources = [
      readFileSync("client/src/pages/Home.tsx", "utf8"),
      readFileSync("client/src/pages/MarketLanding.tsx", "utf8"),
      readFileSync("client/src/pages/LegalPage.tsx", "utf8"),
    ].join("\n").toLowerCase();

    for (const prohibited of ["sourcing", "supply", "supplier", "fournisseur", "fornitore", "approvisionnement", "fornitura"]) {
      expect(publicRouteSources).not.toContain(prohibited);
    }
  });
});
