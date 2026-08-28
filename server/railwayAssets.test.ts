import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = path.resolve(import.meta.dirname, "..");
const publicAssetRoot = path.join(projectRoot, "client", "public", "assets");

const bundledAssets = [
  "alvora-hero-qc.webp",
  "alvora-cutting-faceting.webp",
  "alvora-faceted-a.webp",
  "alvora-laser-calibration.webp",
];

describe("Railway asset portability", () => {
  it("bundles every public hero and workshop image locally", () => {
    for (const asset of bundledAssets) {
      expect(existsSync(path.join(publicAssetRoot, asset)), asset).toBe(true);
    }
  });

  it("keeps public landing pages independent of the Manus storage proxy for site imagery", () => {
    const files = [
      path.join(projectRoot, "client", "src", "pages", "Home.tsx"),
      path.join(projectRoot, "client", "src", "pages", "MarketLanding.tsx"),
      path.join(projectRoot, "client", "src", "pages", "Insights.tsx"),
      path.join(projectRoot, "client", "src", "pages", "Refer.tsx"),
      path.join(projectRoot, "client", "src", "lib", "publicSeo.ts"),
    ];

    for (const file of files) {
      const source = readFileSync(file, "utf8");
      expect(source, path.relative(projectRoot, file)).not.toMatch(/\/manus-storage\/alvora-/);
    }
  });
});
