import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { resolveRouteMeta, injectSeoIntoHtml } from "../server/seoInjection";
import { publicSocialImage } from "../client/src/lib/publicSeo";

const __dir = dirname(fileURLToPath(import.meta.url));
const routes: string[] = JSON.parse(
  readFileSync(join(__dir, "publicRoutes.json"), "utf8")
);

const ORIGIN = "https://alvoraglobalfabrics.com";
const errors: string[] = [];
const seenTitles = new Map<string, string>();
const seenDescriptions = new Map<string, string>();

// Guard: og:image must not be a WebP — WhatsApp, iMessage, and several social
// scrapers silently drop WebP og:image and show a blank card.
if (publicSocialImage.toLowerCase().endsWith(".webp")) {
  errors.push(
    `publicSocialImage must not be .webp — social scrapers (WhatsApp, iMessage) reject WebP og:image. ` +
      `Got: ${publicSocialImage}. Convert to JPEG and update publicSeo.ts.`
  );
}

// Verify the rendered og:image tag also resolves to a non-WebP URL.
const _sampleHtml = injectSeoIntoHtml(
  `<!doctype html><html lang="en"><head><title>t</title><meta name="description" content="d" /></head><body><div id="root"></div></body></html>`,
  "/",
  ORIGIN
);
const _ogImageMatch = _sampleHtml.match(/property="og:image"\s+content="([^"]+)"/);
if (_ogImageMatch && _ogImageMatch[1].toLowerCase().endsWith(".webp")) {
  errors.push(
    `Rendered og:image tag resolves to a WebP URL: ${_ogImageMatch[1]}. ` +
      `Update publicSocialImage in client/src/lib/publicSeo.ts to a JPEG.`
  );
}

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
console.log(`✓ og:image format guard passed — publicSocialImage is not a WebP.`);
