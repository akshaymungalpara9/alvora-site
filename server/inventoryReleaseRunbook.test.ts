import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("controlled inventory-release runbook", () => {
  it("preserves the offline preflight, human IGI review, and explicit early-access approval gates", () => {
    const runbook = readFileSync("CONTROLLED_INVENTORY_RELEASE_RUNBOOK.md", "utf8");
    expect(runbook).toContain("node scripts/validate-partner-availability.mjs");
    expect(runbook).toContain("does **not** import data, query the live IGI database, change buyer access");
    expect(runbook).toContain("`ALVORA_EARLY_ACCESS_ENABLED=false`");
    expect(runbook).toContain("explicitly authorises the release");
    expect(runbook).toContain("must not fabricate inventory, report numbers, prices");
  });
});
