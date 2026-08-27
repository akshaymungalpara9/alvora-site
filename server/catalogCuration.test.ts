import { describe, expect, it } from "vitest";
import { displayScore, orderCatalogRows, type CuratableCatalogRow } from "./catalogCuration";

const firstSeen = new Date("2026-08-01T00:00:00.000Z");
const row = (overrides: Partial<CuratableCatalogRow["stone"]> & { stockNumber: string }, curation: CuratableCatalogRow["curation"] = null): CuratableCatalogRow => ({
  stone: { stockNumber: overrides.stockNumber, category: "White", shape: "Round", carat: 1, color: "D", clarity: "VVS1", cut: "EX", polish: "EX", symmetry: "EX", fluorescence: "None", videoUrl: null, imageUrl: null, ...overrides },
  curation,
});

describe("catalogue curation", () => {
  it("gives a vivid blue Fancy Colour enough rarity weight to lead a larger generic Fancy", () => {
    const vividBlue = row({ stockNumber: "F-VIVID-BLUE", category: "Fancy Colour", color: "Fancy Vivid Blue", carat: 2.1, clarity: "VS1" });
    const genericFancy = row({ stockNumber: "F-GENERIC", category: "Fancy Colour", color: "Fancy Brown", carat: 4.5, clarity: "VS1" });
    expect(displayScore(vividBlue.stone, "core")).toBeGreaterThan(displayScore(genericFancy.stone, "core"));
  });

  it("puts a calibrated D VVS white make ahead of a small otherwise similar stone", () => {
    const calibrated = row({ stockNumber: "W-200", carat: 2, color: "D", clarity: "VVS1" });
    const small = row({ stockNumber: "W-017", carat: 0.17, color: "D", clarity: "VVS1" });
    expect(orderCatalogRows([small, calibrated], "core", "curated").map((entry) => entry.stone.stockNumber)).toEqual(["W-200", "W-017"]);
  });

  it("rewards signature statement shapes, rarity, and supplied presentation media", () => {
    const signature = row({ stockNumber: "S-PORT", category: "Fancy Colour", shape: "Portuguese", color: "Fancy Vivid Pink", carat: 2.2, videoUrl: "https://viewer.example/one", imageUrl: "https://images.example/one" });
    const round = row({ stockNumber: "S-ROUND", category: "White", shape: "Round", color: "D", carat: 2.2 });
    expect(displayScore(signature.stone, "statement")).toBeGreaterThan(displayScore(round.stone, "statement"));
  });

  it("always places pinned current rows first by rank and caps the pinned hero segment at eight", () => {
    const pinned = Array.from({ length: 9 }, (_, index) => row({ stockNumber: `PIN-${index + 1}`, carat: 1 + index / 10 }, { pinned: true, pinRank: 9 - index, heroNote: null, firstSeenAt: firstSeen }));
    const regular = row({ stockNumber: "REGULAR", carat: 4 });
    const ordered = orderCatalogRows([...pinned, regular], "core", "carat_desc").map((entry) => entry.stone.stockNumber);
    expect(ordered.slice(0, 8)).toEqual(["PIN-9", "PIN-8", "PIN-7", "PIN-6", "PIN-5", "PIN-4", "PIN-3", "PIN-2"]);
    expect(ordered).toContain("REGULAR");
    expect(ordered).not.toContain("PIN-1");
  });

  it("uses deterministic carat, media, clarity, and stock-number tiebreakers without a price field", () => {
    const alpha = row({ stockNumber: "A-100", carat: 1, clarity: "VS1" });
    const beta = row({ stockNumber: "B-100", carat: 1, clarity: "VS1" });
    expect(orderCatalogRows([beta, alpha], "core", "curated").map((entry) => entry.stone.stockNumber)).toEqual(["A-100", "B-100"]);
    expect(JSON.stringify(orderCatalogRows([beta, alpha], "core", "curated"))).not.toContain("price");
  });
});
