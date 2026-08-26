import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function expectWrappedLabel(page: string, fieldName: "name" | "email" | "company") {
  expect(page).toMatch(new RegExp(`<label>\\s*<span>[^<]+</span>\\s*<input name="${fieldName}"`));
}

describe("public production-brief form semantics", () => {
  it("provides identity autofill metadata and compatible email entry semantics on every public route", () => {
    const pages = [
      readFileSync("client/src/pages/Home.tsx", "utf8"),
      readFileSync("client/src/pages/MarketLanding.tsx", "utf8"),
    ];
    for (const page of pages) {
      expect(page).toContain('name="name" type="text" autoComplete="name"');
      expect(page).toContain('name="email" type="email" autoComplete="email" inputMode="email" autoCapitalize="none" spellCheck={false}');
      expect(page).toContain('name="company" type="text" autoComplete="organization"');
      expectWrappedLabel(page, "name");
      expectWrappedLabel(page, "email");
      expectWrappedLabel(page, "company");
    }
  });

  it("uses country autofill only where the North American form exposes country choice", () => {
    const market = readFileSync("client/src/pages/MarketLanding.tsx", "utf8");
    expect(market).toContain('content.northAmerica && <label>');
    expect(market).toContain('name="country" autoComplete="country"');
    expect(market).toMatch(/content\.northAmerica && <label><span>[^<]+<\/span><select name="country"/);
  });
});
