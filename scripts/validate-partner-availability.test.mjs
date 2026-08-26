import assert from "node:assert/strict";
import test from "node:test";
import { requiredHeaders, validatePartnerAvailabilityCsv } from "./validate-partner-availability.mjs";

const header = requiredHeaders.join(",");
const validRow = "TEST-STOCK-001,ROUND,1.25,F,VS1,EX,None,6.90 x 6.92 x 4.25,IGI-TEST001,https://video.example/TEST-STOCK-001,1250.00,Core,Partner A";

test("accepts a complete contract-compliant CSV without importing it", () => {
  const result = validatePartnerAvailabilityCsv(`${header}\n${validRow}\n`);
  assert.equal(result.valid, true);
  assert.equal(result.rowCount, 1);
  assert.deepEqual(result.issues, []);
});

test("reports duplicate SKU, missing IGI, malformed media URL, and non-positive price", () => {
  const invalidRow = "TEST-STOCK-001,ROUND,1.25,F,VS1,EX,None,, ,not-a-url,0,Core,Partner B";
  const result = validatePartnerAvailabilityCsv(`${header}\n${validRow}\n${invalidRow}\n`);
  assert.equal(result.valid, false);
  assert.ok(result.issues.some((issue) => issue.includes("duplicate sku")));
  assert.ok(result.issues.some((issue) => issue.includes("missing igi_cert_number")));
  assert.ok(result.issues.some((issue) => issue.includes("video_url must be an http or https URL")));
  assert.ok(result.issues.some((issue) => issue.includes("price_usd must be a positive number")));
});

test("rejects a header that does not match the agreed import contract exactly", () => {
  const result = validatePartnerAvailabilityCsv(`sku,shape,price_usd\nTEST-STOCK-001,ROUND,1250\n`);
  assert.equal(result.valid, false);
  assert.ok(result.issues[0].startsWith("Header must exactly match:"));
});

test("reports non-standard but structurally valid rows for review without blocking the import", () => {
  const flaggedRow = "TEST-FLAG-001,CUSHION,0.90,I,SI1,VG,Faint,6.00 x 6.00 x 4.00,IGI-FLAG001,https://video.example/TEST-FLAG-001,980,High,Partner B";
  const result = validatePartnerAvailabilityCsv(`${header}\n${flaggedRow}\n`);
  assert.equal(result.valid, true);
  assert.ok(result.flags.some((flag) => flag.includes("shape outside Round / Oval / Emerald / Pear")));
  assert.ok(result.flags.some((flag) => flag.includes("fluorescence is not None")));
});
