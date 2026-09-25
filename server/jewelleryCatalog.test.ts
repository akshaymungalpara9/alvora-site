import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { ALL_PIECES, PUBLIC_PIECES, formatFromPrice } from "@shared/jewellery/catalog";

const ROOT = path.resolve(import.meta.dirname, "..");
const PARTNER_TOKENS = ["junerings", "june rings", "pooja", "caratdiamonds", "carat diamonds"];

function partnerWords(): Set<string> {
  const sourcing = JSON.parse(fs.readFileSync(path.join(ROOT, "server", "data", "jewellery-sourcing.json"), "utf8")) as Record<string, { handle: string; partnerTitle: string }>;
  const words = new Set<string>();
  for (const entry of Object.values(sourcing)) {
    for (const word of `${entry.handle} ${entry.partnerTitle}`.toLowerCase().split(/[^a-z]+/)) {
      if (word.length > 3) words.add(word);
    }
  }
  return words;
}

describe("jewellery catalogue", () => {
  it("never exposes a partner identity in public data", () => {
    const text = JSON.stringify(ALL_PIECES).toLowerCase();
    for (const token of PARTNER_TOKENS) expect(text).not.toContain(token);
  });

  it("does not reuse partner design names in Alvora names or URLs", () => {
    const generic = new Set(["oval", "round", "emerald", "marquise", "pear", "radiant", "cushion", "elongated", "asscher", "mine", "hexagon", "princess", "trillion", "baguette", "heart", "three", "stone", "five", "east", "west", "halo", "bezel", "solitaire", "signet", "eternity", "band", "wrap", "ring", "studs", "stud", "drop", "earrings", "pendant", "champagne", "green", "pink", "blue", "yellow", "ruby", "dutch"]);
    const banned = partnerWords();
    for (const piece of ALL_PIECES) {
      const words = `${piece.name} ${piece.slug}`.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 3 && !generic.has(w));
      expect(words.filter((w) => banned.has(w)), piece.code).toEqual([]);
    }
  });

  it("gives every piece a unique code, slug and name", () => {
    const unique = (values: string[]) => new Set(values).size === values.length;
    expect(unique(ALL_PIECES.map((p) => p.code))).toBe(true);
    expect(unique(ALL_PIECES.map((p) => p.slug))).toBe(true);
    expect(unique(ALL_PIECES.map((p) => p.name))).toBe(true);
  });

  it("puts only the launch rule's pieces on the site", () => {
    const sourcing = JSON.parse(fs.readFileSync(path.join(ROOT, "server", "data", "jewellery-sourcing.json"), "utf8")) as Record<string, { partner: string }>;
    const rule = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "jewellery", "launch.json"), "utf8")).partners as Record<string, "all" | string[]>;
    expect(PUBLIC_PIECES.length).toBeGreaterThan(0);
    for (const piece of ALL_PIECES) {
      const partnerRule = rule[sourcing[piece.code].partner];
      const allowed = partnerRule === "all" || (Array.isArray(partnerRule) && partnerRule.includes(piece.category));
      expect(piece.live, piece.code).toBe(allowed);
    }
  });

  it("shows only launch pieces that have a photo", () => {
    for (const piece of PUBLIC_PIECES) {
      expect(piece.live, piece.code).toBe(true);
      expect(piece.images.length, piece.code).toBeGreaterThan(0);
    }
  });

  it("has a JPEG link preview for every shown piece and the jewellery pages", async () => {
    const { socialImageFor } = await import("./seoInjection");
    for (const piece of PUBLIC_PIECES) {
      const social = socialImageFor(`/jewellery/${piece.slug}`);
      expect(social.path, piece.code).toBe(`/assets/social/pieces/${piece.code.toLowerCase()}.jpg`);
      expect(fs.existsSync(path.join(ROOT, "client", "public", social.path)), piece.code).toBe(true);
    }
    for (const route of ["/", "/engagement-rings", "/earrings", "/book-a-consultation"]) {
      const social = socialImageFor(route);
      expect(social.path).toMatch(/\.jpg$/);
      expect(fs.existsSync(path.join(ROOT, "client", "public", social.path)), route).toBe(true);
    }
  });

  it("serves image paths only under the Alvora asset folder", () => {
    for (const piece of ALL_PIECES) {
      for (const image of piece.images) expect(image.src).toMatch(/^\/assets\/jewellery\/alv-[a-z]-\d{4}\/(\d{2}|ai-[a-z]+(-\d{2})?)\.webp$/);
    }
  });

  it("formats prices and falls back to price on request", () => {
    expect(formatFromPrice({ fromPriceUsd: 1250 })).toBe("From $1,250");
    expect(formatFromPrice({ fromPriceUsd: null })).toBe("Price on request");
  });
});
