import assert from "node:assert/strict";
import test from "node:test";
import { requiredHeaders, validatePartnerAvailabilityCsv } from "./validate-partner-availability.mjs";

const header = requiredHeaders.join(",");
const whiteRow = "TEST-WHITE-001,White,F,Round,1.25,1.00–1.99ct,VS1,IDEAL,EX,EX,6.90 x 6.92 x 4.25,61.5,58,1.00,IGI,819696674,https://www.igi.org/API-IGI/report-diagnosis.php?r=819696674,";
const fancyRow = "TEST-FANCY-001,Fancy Colour,Fancy Vivid Pink,Pear,25.03,10ct +,VS1,,EX,EX,22.71 x 14.64 x 9.44,64.5,64,1.55,IGI,788606730,https://www.igi.org/API-IGI/report-diagnosis.php?r=788606730,";

test("accepts complete White and Fancy Colour catalog rows without importing them or requiring prices", () => {
  const result = validatePartnerAvailabilityCsv(`${header}\n${whiteRow}\n${fancyRow}\n`);
  assert.equal(result.valid, true);
  assert.equal(result.rowCount, 2);
  assert.deepEqual(result.issues, []);
  assert.deepEqual(result.categoryCounts, { White: 1, "Fancy Colour": 1 });
});

test("reports duplicate stock, missing certificate, invalid verification, and malformed supplied video URLs", () => {
  const invalidRow = "TEST-WHITE-001,White,F,Round,1.25,1.00–1.99ct,VS1,IDEAL,EX,EX,6.90 x 6.92 x 4.25,61.5,58,1.00,IGI,,not-a-url,not-a-url";
  const result = validatePartnerAvailabilityCsv(`${header}\n${whiteRow}\n${invalidRow}\n`);
  assert.equal(result.valid, false);
  assert.ok(result.issues.some((issue) => issue.includes("duplicate stock_no")));
  assert.ok(result.issues.some((issue) => issue.includes("missing cert_no")));
  assert.ok(result.issues.some((issue) => issue.includes("verify_url must be an http or https URL")));
  assert.ok(result.issues.some((issue) => issue.includes("video_url must be an http or https URL when provided")));
});

test("rejects legacy and price-bearing headers rather than guessing a mapping", () => {
  const result = validatePartnerAvailabilityCsv("sku,shape,price_usd\nTEST-STOCK-001,ROUND,1250\n");
  assert.equal(result.valid, false);
  assert.ok(result.issues[0].startsWith("Header must exactly match:"));
});

test("allows all supplied shapes, colour expressions, and carat sizes when the public catalog fields are structurally valid", () => {
  const result = validatePartnerAvailabilityCsv(`${header}\n${fancyRow}\n`);
  assert.equal(result.valid, true);
  assert.equal(result.categoryCounts["Fancy Colour"], 1);
});
