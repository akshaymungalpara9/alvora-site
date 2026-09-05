import { describe, expect, it } from "vitest";
import { availabilityImportHeaders, validateAvailabilityImportCsv, checkSnapshotSizeGuard } from "./availabilityImport";

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

  it("requires a laboratory and a matching official IGI or GIA certificate URL", () => {
    const missingLab = validRow.replace(",IGI,819696674,", ",,819696674,");
    const untrustedUrl = validRow.replace("https://www.igi.org/API-IGI/report-diagnosis.php?r=819696674", "https://example.org/report/819696674");

    expect(validateAvailabilityImportCsv(`${header}\n${missingLab}\n`).rejections[0]?.reason).toContain("missing lab");
    expect(validateAvailabilityImportCsv(`${header}\n${untrustedUrl}\n`).rejections[0]?.reason).toContain("listed IGI or GIA certificate number");
  });

  it("rejects legacy, price-bearing, and reordered headers rather than guessing a mapping", () => {
    const result = validateAvailabilityImportCsv("sku,shape,price_usd\nALV-001,Round,1250\n");
    expect(result.valid).toBe(false);
    expect(result.rejections[0]).toMatchObject({ sku: "(file)", reason: expect.stringContaining("Header must exactly match") });
  });
});

describe("checkSnapshotSizeGuard", () => {
  it("allows activation when incoming count is at least 50% of the active count", () => {
    expect(() => checkSnapshotSizeGuard(1000, 1839, false)).not.toThrow();
    expect(() => checkSnapshotSizeGuard(1839, 1839, false)).not.toThrow();
    expect(() => checkSnapshotSizeGuard(920, 1839, false)).not.toThrow(); // exactly ~50%
  });

  it("blocks activation when incoming count is below 50% of the active count", () => {
    expect(() => checkSnapshotSizeGuard(580, 1839, false)).toThrow(
      /BLOCKED.*580 rows.*1839 rows.*1259 rows.*--confirm-replacement/,
    );
  });

  it("allows activation below the 50% threshold when --confirm-replacement is passed", () => {
    expect(() => checkSnapshotSizeGuard(580, 1839, true)).not.toThrow();
  });

  it("allows activation when there is no active snapshot (first import)", () => {
    expect(() => checkSnapshotSizeGuard(580, 0, false)).not.toThrow();
  });

  it("error message names the row counts and the shortfall exactly", () => {
    let message = "";
    try { checkSnapshotSizeGuard(580, 1839, false); } catch (e) { message = (e as Error).message; }
    expect(message).toContain("580 rows");
    expect(message).toContain("1839 rows");
    expect(message).toContain("1259 rows");
    expect(message).toContain("--confirm-replacement");
  });
});
