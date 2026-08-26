import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("public production-brief client field bounds", () => {
  it("matches server-side identity and brief limits on English and localised routes", () => {
    const pages = [
      readFileSync("client/src/pages/Home.tsx", "utf8"),
      readFileSync("client/src/pages/MarketLanding.tsx", "utf8"),
    ];
    for (const page of pages) {
      expect(page).toContain('name="name" type="text" autoComplete="name" minLength={2} maxLength={180}');
      expect(page).toContain('name="email" type="email" autoComplete="email" inputMode="email" autoCapitalize="none" spellCheck={false} maxLength={320}');
      expect(page).toContain('name="company" type="text" autoComplete="organization" maxLength={180}');
      expect(page).toContain('textarea name="brief" minLength={10} maxLength={5000}');
    }
  });
});
