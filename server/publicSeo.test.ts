import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { publicSeo, publicSocialImage } from "../client/src/lib/publicSeo";

describe("public locale metadata", () => {
  it("defines complete discoverability metadata for every public manufacturing route", () => {
    expect(Object.keys(publicSeo)).toEqual(["global", "fr", "it", "us"]);
    expect(publicSeo.global.path).toBe("/");
    expect(publicSeo.fr).toMatchObject({ lang: "fr", path: "/fr" });
    expect(publicSeo.it).toMatchObject({ lang: "it", path: "/it" });
    expect(publicSeo.us).toMatchObject({ lang: "en-US", path: "/us" });
    Object.values(publicSeo).forEach((entry) => {
      expect(entry.title.length).toBeGreaterThan(20);
      expect(entry.description.length).toBeGreaterThan(80);
      expect(entry.path).not.toMatch(/^\/(admin|availability)/);
    });
  });

  it("retains the required French synthetic-diamond terminology in public metadata", () => {
    const frenchMetadata = `${publicSeo.fr.title} ${publicSeo.fr.description}`.toLowerCase();
    expect(frenchMetadata).toContain("diamants synthétiques");
    for (const prohibited of ["diamant de laboratoire", "diamant cultivé", "cultivé en laboratoire", "lab-grown"]) {
      expect(frenchMetadata).not.toContain(prohibited);
    }
  });

  it("keeps crawler directives limited to public landing pages and reserves host-aware sitemap delivery for the server", () => {
    const robots = readFileSync("client/public/robots.txt", "utf8");
    expect(robots).toContain("Allow: /");
    expect(robots).toContain("Disallow: /admin");
    expect(robots).toContain("Disallow: /availability");
    expect(robots).toContain("Disallow: /api/");
    expect(robots).not.toContain("Sitemap: http");
  });

  it("requires canonical, hreflang, Open Graph, and Twitter metadata to be supplied from one route-aware helper", () => {
    const source = readFileSync("client/src/lib/publicSeo.ts", "utf8");
    expect(publicSocialImage).toMatch(/^\/manus-storage\//);
    for (const token of ["canonical", "x-default", "og:title", "og:description", "og:url", "og:image", "twitter:card", "twitter:title", "twitter:description", "twitter:image"]) {
      expect(source).toContain(token);
    }
  });
});
