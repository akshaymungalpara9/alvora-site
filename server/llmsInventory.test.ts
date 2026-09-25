import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";

/** llms.txt must list every insights article - added after the 14-of-22 drift found in the GEO audit. */
function articleSlugs(dir: string): string[] {
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const text = fs.readFileSync(path.join(dir, f), "utf8");
      const m = text.match(/^slug:\s*(.+)$/m);
      return (m ? m[1].trim() : f.replace(/\.md$/, ""));
    });
}

describe("llms.txt inventory", () => {
  it("lists every insights and PAA article", () => {
    const slugs = [
      ...articleSlugs(path.join("content", "insights")),
      ...articleSlugs(path.join("content", "paa-pages")),
    ];
    expect(slugs.length).toBeGreaterThanOrEqual(22);
    const llms = fs.readFileSync(path.join("client", "public", "llms.txt"), "utf8");
    const missing = slugs.filter((slug) => !llms.includes(`/insights/${slug}`));
    expect(missing).toEqual([]);
  });
});
