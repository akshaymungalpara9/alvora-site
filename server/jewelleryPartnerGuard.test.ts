import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Partner identities must never reach anything a visitor can download:
 * client source, shared modules, public assets, built bundles or
 * prerendered snapshots. Only server-side sourcing data may name them.
 */
const ROOT = path.resolve(import.meta.dirname, "..");
const PARTNER = /junerings|june[\s_-]?rings|pooja[\s_-]?diamond|poojadiamond|caratdiamonds|carat[\s_-]diamonds/i;

function walk(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

describe("partner names stay private", () => {
  it("never appear in client code, shared modules, public files or prerendered pages", () => {
    const roots = ["client/src", "client/public", "shared", "prerendered", "dist/public", "dist/prerendered"].map((dir) => path.join(ROOT, dir));
    const offenders: string[] = [];
    for (const file of roots.flatMap((dir) => walk(dir))) {
      const relative = path.relative(ROOT, file);
      if (PARTNER.test(relative)) offenders.push(`${relative} (file name)`);
      if (!/\.(html|js|mjs|ts|tsx|json|css|txt|xml|svg|md)$/.test(file)) continue;
      if (PARTNER.test(fs.readFileSync(file, "utf8"))) offenders.push(relative);
    }
    expect(offenders).toEqual([]);
  });

  it("keeps partner sourcing out of the client bundle graph", () => {
    const clientFiles = walk(path.join(ROOT, "client", "src")).filter((file) => /\.(ts|tsx)$/.test(file));
    for (const file of clientFiles) {
      expect(fs.readFileSync(file, "utf8"), path.relative(ROOT, file)).not.toContain("jewellery-sourcing");
    }
  });
});
