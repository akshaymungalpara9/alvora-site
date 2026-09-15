/**
 * Generates og:image assets from the master hero WebP.
 * Run: node scripts/generate-og-images.mjs
 * Requires: sharp (devDependency)
 *
 * Outputs (committed to git so deploys never need to re-run sharp):
 *   client/public/assets/alvora-og.jpg        1200×630  — og:image (Facebook, LinkedIn, X, Slack)
 *   client/public/assets/alvora-og-square.jpg 1200×1200 — square card (WhatsApp, iMessage)
 */

import sharp from "sharp";
import { statSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = join(__dirname, "../client/public/assets/alvora-hero-qc.webp");
const OUT_16_9 = join(__dirname, "../client/public/assets/alvora-og.jpg");
const OUT_SQ = join(__dirname, "../client/public/assets/alvora-og-square.jpg");
const MAX_BYTES = 300_000;

async function generate() {
  // 1200×630 — 1.905:1 ratio, cover-crop from center
  await sharp(SRC)
    .resize(1200, 630, { fit: "cover", position: "centre" })
    .jpeg({ quality: 82, progressive: true })
    .toFile(OUT_16_9);

  const size16_9 = statSync(OUT_16_9).size;
  if (size16_9 > MAX_BYTES) {
    throw new Error(
      `alvora-og.jpg is ${(size16_9 / 1024).toFixed(0)} KB — exceeds ${MAX_BYTES / 1024} KB limit. Lower quality.`
    );
  }
  console.log(`✓ alvora-og.jpg        ${(size16_9 / 1024).toFixed(0)} KB  (1200×630)`);

  // 1200×1200 — square, cover-crop from center
  await sharp(SRC)
    .resize(1200, 1200, { fit: "cover", position: "centre" })
    .jpeg({ quality: 82, progressive: true })
    .toFile(OUT_SQ);

  const sizeSq = statSync(OUT_SQ).size;
  if (sizeSq > MAX_BYTES) {
    throw new Error(
      `alvora-og-square.jpg is ${(sizeSq / 1024).toFixed(0)} KB — exceeds ${MAX_BYTES / 1024} KB limit. Lower quality.`
    );
  }
  console.log(`✓ alvora-og-square.jpg ${(sizeSq / 1024).toFixed(0)} KB  (1200×1200)`);
}

generate().catch((err) => {
  console.error(`\n✗ generate-og-images failed: ${err.message}`);
  process.exit(1);
});
