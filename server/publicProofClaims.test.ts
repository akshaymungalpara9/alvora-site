import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const publicMarketingSources = [
  "client/src/pages/Home.tsx",
  "client/src/pages/MarketLanding.tsx",
  "client/src/pages/B2BLanding.tsx",
];

const prohibitedPublicClaims = [
  /25\+/i,
  /10,000/i,
  /10 000/i,
  /10\.000/i,
  /100%/i,
  /every stone/i,
  /chaque pierre/i,
  /ogni pietra/i,
  /repair or replace/i,
  /réparer ou remplacer/i,
  /riparare o sostituire/i,
  /SPEC 05[–-]10 DAYS/i,
  /typical lead time for a spec make:\s*5[–-]10 working days(?!, subject)/i,
];

describe("public proof claim guardrails", () => {
  it("keeps unsupported proof language out of public marketing pages", () => {
    for (const path of publicMarketingSources) {
      const source = readFileSync(path, "utf8");
      for (const pattern of prohibitedPublicClaims) {
        expect(source, `${path} contains prohibited public claim ${pattern}`).not.toMatch(pattern);
      }
    }
  });

  it("keeps the proof register present and operational", () => {
    const register = readFileSync("PHASE_3_PROOF_REGISTER.md", "utf8");
    expect(register).toContain("Evidence required before stronger wording");
    expect(register).toContain("Owner / review cadence");
    expect(register).toContain("Publication checklist");
    expect(register).toContain("Analytics events must contain only non-personal attribution");
  });
});
