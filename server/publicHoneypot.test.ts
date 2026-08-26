import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("public brief honeypot structure", () => {
  it("keeps the honeypot on both English and localised public forms without exposing it to keyboard navigation", () => {
    const home = readFileSync("client/src/pages/Home.tsx", "utf8");
    const market = readFileSync("client/src/pages/MarketLanding.tsx", "utf8");
    const styles = readFileSync("client/src/index.css", "utf8");
    for (const source of [home, market]) {
      expect(source).toContain('name="_website"');
      expect(source).toContain('tabIndex={-1}');
      expect(source).toContain('aria-hidden="true"');
      expect(source).toContain('values.get("_website")');
    }
    expect(styles).toContain(".honeypot-field");
    expect(styles).toContain("clip-path: inset(50%)");
  });
});
