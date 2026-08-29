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

  it("keeps STATEMENT catalog media and certificate behavior explicit without restoring an IGI-only label", () => {
    const catalog = readFileSync("client/src/pages/PublicAvailability.tsx", "utf8");
    const coreImporter = readFileSync("server/availabilityImport.ts", "utf8");
    const statementImporter = readFileSync("server/statementAvailabilityImport.ts", "utf8");

    expect(catalog).toContain('statement: "Statement"');
    expect(catalog).toContain("catalog-statement-image");
    expect(catalog).toContain("View certificate");
    expect(catalog).not.toContain("Verify on IGI");
    expect(coreImporter).toContain("https://api.igi.org/viewpdf.php?r=");
    expect(statementImporter).toContain("cert_pdf_url");
    expect(statementImporter).toContain("image_url");
    expect(statementImporter).toContain("video_url");
  });

  it("keeps the live catalog independent of buyer authentication and exposes only public enquiry and supplied-media actions", () => {
    const catalog = readFileSync("client/src/pages/PublicAvailability.tsx", "utf8");
    const app = readFileSync("client/src/App.tsx", "utf8");

    expect(catalog).not.toContain("useAuth");
    expect(catalog).not.toContain("buyer.myAvailability");
    expect(catalog).not.toContain("/buyer-availability");
    expect(catalog).toContain("stone.videoUrl &&");
    expect(app).toContain('<Route path="/buyer-availability">{() => <PublicAvailability />}</Route>');
  });

  it("renders every permitted populated SKU specification in an anonymous full-detail disclosure without internal or commercial fields", () => {
    const catalog = readFileSync("client/src/pages/PublicAvailability.tsx", "utf8");
    const db = readFileSync("server/db.ts", "utf8");

    expect(catalog).toContain('className="catalog-stone-details"');
    for (const field of ["stockNumber", "category", "shape", "caratBand", "color", "clarity", "cut", "polish", "symmetry", "fluorescence", "measurements", "depthPct", "tablePct", "ratio", "lab", "reportNumber", "statementType", "crownHeight", "pavilionDepth", "crownAngle", "pavilionAngle", "girdlePct"]) {
      expect(catalog).toContain(field);
    }
    expect(catalog).not.toContain("originPartner");
    expect(catalog).not.toContain("isStandardMenu");
    expect(db).toContain("price: _price");
    expect(db).toContain("originPartner: _originPartner");
    expect(db).toContain("isStandardMenu: _isStandardMenu");
  });

  it("keeps unverified credentials and unfinished editorial drafts out of public buyer-facing navigation", () => {
    const home = readFileSync("client/src/pages/Home.tsx", "utf8");
    const market = readFileSync("client/src/pages/MarketLanding.tsx", "utf8");
    const legal = readFileSync("client/src/pages/LegalPage.tsx", "utf8");
    const insights = readFileSync("client/src/pages/Insights.tsx", "utf8");

    for (const publicSource of [home, market]) {
      expect(publicSource.toLowerCase()).not.toContain("details to confirm");
      expect(publicSource.toLowerCase()).not.toContain("owner draft");
      expect(publicSource).not.toContain('href="/insights"');
    }
    expect(home).toContain('"profiles"');
    expect(home).not.toContain('>available now<');
    expect(market).toContain("availabilityCountLabelByVariant");
    expect(market).toContain("diamant de synthèse");
    expect(legal).not.toContain("Effective draft:");
    expect(legal).not.toContain("public draft");
    expect(insights).not.toContain("Owner draft");
    expect(insights).not.toContain("Open draft");
    expect(insights).toContain("Useful notes for the buying side of the bench.");
  });

  it("keeps prohibited commercial literals out of public copy while retaining clear trade-term explanations", () => {
    const publicSources = [
      readFileSync("client/src/pages/Home.tsx", "utf8"),
      readFileSync("client/src/pages/MarketLanding.tsx", "utf8"),
      readFileSync("client/src/pages/LegalPage.tsx", "utf8"),
    ].join("\n").toLowerCase();

    expect(publicSources).not.toContain("prepaid-only");
    expect(publicSources).not.toContain("refund");
  });
});
