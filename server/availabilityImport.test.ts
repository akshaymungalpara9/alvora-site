import { describe, expect, it } from "vitest";
import { availabilityImportHeaders, validateAvailabilityImportCsv } from "./availabilityImport";

const header = availabilityImportHeaders.join(",");
const validRow = "ALV-001,White,F,Round,1.25,1.00–1.99ct,VS2,IDEAL,EX,EX,6.90 x 6.92 x 4.25,61.5,58,1.00,IGI,819696674,https://www.igi.org/API-IGI/report-diagnosis.php?r=819696674,";

describe("current production catalog import validation", () => {
  it("accepts the exact no-price header and a valid Fancy Colour row with blank video and cut fields", () => {
    const fancyRow = "D-5,Fancy Colour,Fancy Vivid Pink,Pear,25.03,10ct +,VS1,,EX,EX,22.71 x 14.64 x 9.44,64.5,64,1.55,IGI,788606730,https://www.igi.org/API-IGI/report-diagnosis.php?r=788606730,";
    const result = validateAvailabilityImportCsv(`${header}\n${fancyRow}\n`);
    expect(result.valid).toBe(true);
    expect(result.records).toEqual([expect.objectContaining({ stockNo: "D-5", category: "Fancy Colour", cut: null, videoUrl: null, certNo: "788606730" })]);
    expect(JSON.stringify(result.records)).not.toContain("price");
  });

  it("returns a stock-number rejection report for missing certification and invalid supplied media or verification URLs", () => {
    const row = "ALV-BAD,White,F,Round,1.25,1.00–1.99ct,VS2,IDEAL,EX,EX,6.90 x 6.92 x 4.25,61.5,58,1.00,IGI,,not-a-url,not-a-url";
    const result = validateAvailabilityImportCsv(`${header}\n${row}\n`);
    expect(result.valid).toBe(false);
    expect(result.rejections).toEqual([expect.objectContaining({ sku: "ALV-BAD", reason: expect.stringContaining("missing cert_no") })]);
    expect(result.rejections[0].reason).toContain("verify_url must be an http or https URL");
    expect(result.rejections[0].reason).toContain("video_url must be an http or https URL when provided");
  });

  it("accepts both public collections without restricting shapes, sizes, or colour expressions to the former standard menu", () => {
    const result = validateAvailabilityImportCsv(`${header}\n${validRow}\nD-5,Fancy Colour,Fancy Vivid Pink,Pear,25.03,10ct +,VS1,,EX,EX,22.71 x 14.64 x 9.44,64.5,64,1.55,IGI,788606730,https://www.igi.org/API-IGI/report-diagnosis.php?r=788606730,\n`);
    expect(result.valid).toBe(true);
    expect(result.records.map((record) => record.category)).toEqual(["White", "Fancy Colour"]);
  });

  it("normalizes an IGI verification page to the confirmed direct certificate viewer using the real certificate number", () => {
    const sourcePageRow = "ALV-IGI,White,F,Round,1.25,1.00–1.99ct,VS2,IDEAL,EX,EX,6.90 x 6.92 x 4.25,61.5,58,1.00,IGI,819696674,https://www.igi.org/reports/verify-your-report/,";
    const result = validateAvailabilityImportCsv(`${header}\n${sourcePageRow}\n`);
    expect(result.valid).toBe(true);
    expect(result.records[0]?.verifyUrl).toBe("https://api.igi.org/viewpdf.php?r=819696674");
  });

  it("rejects legacy, price-bearing, and reordered headers rather than guessing a mapping", () => {
    const result = validateAvailabilityImportCsv("sku,shape,price_usd\nALV-001,Round,1250\n");
    expect(result.valid).toBe(false);
    expect(result.rejections[0]).toMatchObject({ sku: "(file)", reason: expect.stringContaining("Header must exactly match") });
  });
});
