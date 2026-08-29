import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function expectWrappedLabel(page: string, fieldName: "name" | "email" | "company") {
  expect(page).toMatch(new RegExp(`<label>[\\s\\S]*?<span>[^<]+</span>[\\s\\S]*?<input[\\s\\S]*?name="${fieldName}"`));
}

describe("public production-brief form semantics", () => {
  it("provides identity autofill metadata and compatible email entry semantics on every public route", () => {
    const pages = [
      readFileSync("client/src/pages/Home.tsx", "utf8"),
      readFileSync("client/src/pages/MarketLanding.tsx", "utf8"),
    ];
    for (const page of pages) {
      expect(page).toMatch(/name="name"\s+type="text"\s+autoComplete="name"/);
      expect(page).toMatch(/name="email"\s+type="email"\s+autoComplete="email"\s+inputMode="email"\s+autoCapitalize="none"\s+spellCheck=\{false\}/);
      expect(page).toMatch(/name="company"\s+type="text"\s+autoComplete="organization"/);
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
