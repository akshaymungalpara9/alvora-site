import assert from "node:assert/strict";
import test from "node:test";
import { requiredHeaders, validatePartnerAvailabilityCsv } from "./validate-partner-availability.mjs";

const header = requiredHeaders.join(",");
const validRow = "TEST-STOCK-001,IGI-TEST001,ROUND,1.25,F,VS1,EX,EX,IGI,1250.00,India,Available";

test("accepts a complete contract-compliant CSV without importing it", () => {
  const result = validatePartnerAvailabilityCsv(`${header}\n${validRow}\n`);
  assert.equal(result.valid, true);
  assert.equal(result.rowCount, 1);
  assert.deepEqual(result.issues, []);
});

test("reports duplicate stock, missing IGI format, non-numeric price, and invalid availability", () => {
  const invalidRow = "TEST-STOCK-001,UNKNOWN,ROUND,1.25,F,VS1,EX,EX,IGI,price,India,Held";
  const result = validatePartnerAvailabilityCsv(`${header}\n${validRow}\n${invalidRow}\n`);
  assert.equal(result.valid, false);
  assert.ok(result.issues.some((issue) => issue.includes("duplicate Stock #")));
  assert.ok(result.issues.some((issue) => issue.includes("Report # must be a plausible IGI")));
  assert.ok(result.issues.some((issue) => issue.includes("Final Price must be a positive decimal")));
  assert.ok(result.issues.some((issue) => issue.includes("Availability must be exactly")));
});

test("rejects a header that does not match the agreed import contract exactly", () => {
  const result = validatePartnerAvailabilityCsv(`Stock #,Report #,Carat\nTEST-STOCK-001,IGI-TEST001,1.25\n`);
  assert.equal(result.valid, false);
  assert.ok(result.issues[0].startsWith("Header must exactly match:"));
});
