import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { resolveRouteMeta } from "../server/seoInjection";

const __dir = dirname(fileURLToPath(import.meta.url));
const routes: string[] = JSON.parse(
  readFileSync(join(__dir, "publicRoutes.json"), "utf8")
);

const ORIGIN = "https://alvoraglobalfabrics.com";
const errors: string[] = [];
const seenTitles = new Map<string, string>();
const seenDescriptions = new Map<string, string>();

for (const route of routes) {
  const meta = resolveRouteMeta(route, ORIGIN);
  if (!meta) {
    errors.push(`${route}: resolveRouteMeta returned null — no SEO case block`);
    continue;
  }
  if (!meta.title || meta.title.trim() === "") {
    errors.push(`${route}: title is empty`);
  } else {
    const collision = seenTitles.get(meta.title);
    if (collision) {
      errors.push(`${route}: title duplicates ${collision} — "${meta.title}"`);
    } else {
      seenTitles.set(meta.title, route);
    }
  }
  if (!meta.description || meta.description.trim() === "") {
    errors.push(`${route}: description is empty`);
  } else {
    const collision = seenDescriptions.get(meta.description);
    if (collision) {
      errors.push(`${route}: description duplicates ${collision} — "${meta.description}"`);
    } else {
      seenDescriptions.set(meta.description, route);
    }
  }
}

if (errors.length > 0) {
  console.error("\n✗ SEO meta validation failed:\n");
  for (const e of errors) console.error(`  • ${e}`);
  console.error(`\n${errors.length} error(s). Fix server/seoInjection.ts before building.\n`);
  process.exit(1);
}

console.log(`✓ SEO meta validated: ${routes.length} routes — all titles and descriptions present and unique.`);
