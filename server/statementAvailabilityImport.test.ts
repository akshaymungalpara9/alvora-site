import { describe, expect, it } from "vitest";
import { statementAvailabilityImportHeaders, validateStatementAvailabilityImportCsv } from "./statementAvailabilityImport";

const header = statementAvailabilityImportHeaders.join(",");
const richRow = "ST-001,Fancy Colour,CVD,Fancy Vivid Pink,Oval,5.12,5.00–9.99ct,VS1,Ideal,EX,EX,None,12.03 × 8.45 × 5.10 mm,1.42,60.4,59,14.5,43.2,34.8,40.5,3.6,IGI,821663473,https://api.igi.org/viewpdf.php?r=821663473,https://viewer.example/ST-001,https://images.example/ST-001.jpg";
const noCertificateRow = "ST-002,White,H&A,H,Asscher,52.59,10ct +,VS1,,EX,EX,None,22.23 × 19.67 × 12.02 mm,1.13,61.1,60,15,42.5,34.4,38.4,4,,,,,https://images.example/ST-002.jpg";

describe("STATEMENT catalog import validation", () => {
  it("accepts rich supplied technical, certificate, viewer, and image fields without any price field", () => {
    const result = validateStatementAvailabilityImportCsv(`${header}\n${richRow}\n`);
    expect(result.valid).toBe(true);
    expect(result.records[0]).toMatchObject({ stockNo: "ST-001", category: "Fancy Colour", statementType: "CVD", certNo: "821663473", certPdfUrl: "https://api.igi.org/viewpdf.php?r=821663473", videoUrl: "https://viewer.example/ST-001", imageUrl: "https://images.example/ST-001.jpg", crownAngle: 34.8 });
    expect(JSON.stringify(result.records)).not.toContain("price");
  });

  it("keeps supplied available rows with blank certificate fields and omits only unavailable link data", () => {
    const result = validateStatementAvailabilityImportCsv(`${header}\n${noCertificateRow}\n`);
    expect(result.valid).toBe(true);
    expect(result.records[0]).toMatchObject({ stockNo: "ST-002", lab: null, certNo: null, certPdfUrl: null, videoUrl: null, imageUrl: "https://images.example/ST-002.jpg" });
  });

  it("treats a literal null marker in an optional technical field as absent rather than inventing a value", () => {
    const result = validateStatementAvailabilityImportCsv(`${header}\n${richRow.replace(",34.8,40.5,", ",null,40.5,")}\n`);
    expect(result.valid).toBe(true);
    expect(result.records[0]?.crownAngle).toBeNull();
  });

  it("rejects duplicate stock numbers, malformed supplied URLs, and malformed technical dimensions", () => {
    const malformed = richRow.replace("https://images.example/ST-001.jpg", "bad-url").replace(",34.8,40.5,", ",bad,40.5,");
    const result = validateStatementAvailabilityImportCsv(`${header}\n${richRow}\n${malformed}\n`);
    expect(result.valid).toBe(false);
    expect(result.rejections[0]).toMatchObject({ sku: "ST-001", reason: expect.stringContaining("duplicate stock_no") });
    expect(result.rejections[0]?.reason).toContain("crown_angle must be numeric when provided");
    expect(result.rejections[0]?.reason).toContain("image_url must be an http or https URL when provided");
  });

  it("requires the exact STATEMENT header rather than guessing a core catalog mapping", () => {
    const result = validateStatementAvailabilityImportCsv("stock_no,category,shape\nST-001,White,Round\n");
    expect(result.valid).toBe(false);
    expect(result.rejections[0]?.reason).toContain("Header must exactly match");
  });
});
