import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { LIST_LABELS, LIST_BANDS } from "../shared/stoneLists";

const stonesPath = path.resolve(import.meta.dirname, "data", "stones.public.json");
const raw = readFileSync(stonesPath, "utf8");
const stones = JSON.parse(raw) as Array<Record<string, unknown>>;

const ALLOWED_KEYS = [
  "report", "lab", "shape", "weight", "color", "clarity", "cut",
  "polish", "symmetry", "measurements", "stock", "certUrl",
  "videoUrl", "videoHost", "videoEmbeddable", "lists", "band", "listedOn",
].sort();

const PRICE_PATTERN = /sellperct|totalusd|usd|\$|price/i;

function walk(value: unknown, visit: (v: unknown, key?: string) => void, key?: string): void {
  visit(value, key);
  if (Array.isArray(value)) {
    for (const item of value) walk(item, visit);
    return;
  }
  if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      walk(v, visit, k);
    }
  }
}

describe("server/data/stones.public.json", () => {
  it("is a non-empty array", () => {
    expect(Array.isArray(stones)).toBe(true);
    expect(stones.length).toBeGreaterThan(0);
  });

  it("every record has exactly the allowed keys, nothing more, nothing less", () => {
    for (const record of stones) {
      const keys = Object.keys(record).sort();
      expect(keys).toEqual(ALLOWED_KEYS);
    }
  });

  it("no key or string value anywhere matches the price pattern", () => {
    walk(stones, (v, k) => {
      if (typeof k === "string") expect(k).not.toMatch(PRICE_PATTERN);
      if (typeof v === "string") expect(v).not.toMatch(PRICE_PATTERN);
    });
  });

  it("every lab is IGI or GIA", () => {
    for (const record of stones) {
      expect(record.lab === "IGI" || record.lab === "GIA").toBe(true);
    }
  });

  it("every IGI certUrl contains api.igi.org and the record's report", () => {
    for (const record of stones) {
      if (record.lab === "IGI") {
        expect(String(record.certUrl)).toContain("api.igi.org");
        expect(String(record.certUrl)).toContain(String(record.report));
      }
    }
  });

  it("every videoUrl, when present, has a hostname not containing igi.org or gia.edu", () => {
    for (const record of stones) {
      if (record.videoUrl) {
        const host = new URL(String(record.videoUrl)).hostname.toLowerCase();
        expect(host.includes("igi.org")).toBe(false);
        expect(host.includes("gia.edu")).toBe(false);
      }
    }
  });

  it("every report is unique", () => {
    const seen = new Set<string>();
    for (const record of stones) {
      const r = String(record.report);
      expect(seen.has(r)).toBe(false);
      seen.add(r);
    }
  });

  it("U+2014 does not appear anywhere in stones.public.json", () => {
    expect(raw.includes("—")).toBe(false);
  });
});

describe("shared/stoneLists", () => {
  it("LIST_LABELS and LIST_BANDS cover exactly the 16 list keys used by any record", () => {
    const usedKeys = new Set<string>();
    for (const record of stones) {
      const lists = record.lists as string[];
      for (const key of lists) usedKeys.add(key);
    }
    const labelKeys = new Set(Object.keys(LIST_LABELS));
    const bandKeys = new Set(Object.keys(LIST_BANDS));
    expect(labelKeys).toEqual(bandKeys);
    for (const key of usedKeys) {
      expect(labelKeys.has(key)).toBe(true);
      expect(bandKeys.has(key)).toBe(true);
    }
    expect(labelKeys.size).toBe(16);
  });
});
