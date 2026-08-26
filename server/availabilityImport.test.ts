import { describe, expect, it } from "vitest";
import { availabilityImportHeaders, validateAvailabilityImportCsv } from "./availabilityImport";

const header = availabilityImportHeaders.join(",");
const validRow = "ALV-001,Round,1.25,G,VS2,EX,None,6.90 x 6.92 x 4.25,IGI-123456789,https://video.example/ALV-001,1250.00,Core,Partner A";

describe("normalized availability import validation", () => {
  it("accepts the exact requested header and retains a standard-menu row", () => {
    const result = validateAvailabilityImportCsv(`${header}\n${validRow}\n`);
    expect(result.valid).toBe(true);
    expect(result.records).toHaveLength(1);
    expect(result.records[0]).toMatchObject({ sku: "ALV-001", shape: "ROUND", priceUsd: 1250, standardsFlags: [] });
  });

  it("returns a SKU-level rejection report for required identifier, media, and price failures", () => {
    const row = "ALV-BAD,Oval,1.25,G,VS2,EX,None,,,not-a-url,0,Core,Partner A";
    const result = validateAvailabilityImportCsv(`${header}\n${row}\n`);
    expect(result.valid).toBe(false);
    expect(result.rejections).toEqual([expect.objectContaining({
      sku: "ALV-BAD",
      reason: expect.stringContaining("missing igi_cert_number"),
    })]);
    expect(result.rejections[0].reason).toContain("video_url must be an http or https URL");
    expect(result.rejections[0].reason).toContain("price_usd must be a positive number");
  });

  it("retains rather than rejects a valid row outside the standard menu and records every required review flag", () => {
    const row = "ALV-FLAG,Cushion,0.90,I,SI1,VG,Faint,6.00 x 6.00 x 4.00,IGI-987654321,https://video.example/ALV-FLAG,980,High,Partner B";
    const result = validateAvailabilityImportCsv(`${header}\n${row}\n`);
    expect(result.valid).toBe(true);
    expect(result.records[0].standardsFlags).toEqual([
      "shape outside Round / Oval / Emerald / Pear",
      "carat outside 1.00–4.19 ct",
      "colour below H",
      "clarity below VS2",
      "cut is not EX / Ideal",
      "fluorescence is not None",
    ]);
  });

  it("rejects legacy and reordered headers rather than guessing a mapping", () => {
    const result = validateAvailabilityImportCsv(`sku,shape,price_usd\nALV-001,Round,1250\n`);
    expect(result.valid).toBe(false);
    expect(result.rejections[0]).toMatchObject({ sku: "(file)", reason: expect.stringContaining("Header must exactly match") });
  });
});
