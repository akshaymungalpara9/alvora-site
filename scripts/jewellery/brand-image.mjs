#!/usr/bin/env node
/**
 * Alvora photo treatment: places a photo on a soft ivory backdrop and adds
 * the Alvora watermark (faceted-A mark + wordmark) in the lower-right corner.
 *
 * Used by build-catalog.mjs for every jewellery photo, and usable on its own:
 *
 *   pnpm brand:image <input> [<input> ...] --out <dir> [--size 1400]
 *
 * Output is square WebP with all source metadata stripped, so no partner
 * EXIF, IPTC or filenames travel with the file.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");
const MARK_PATH = path.join(ROOT, "client", "public", "assets", "alvora-faceted-a.webp");
/** Full lock-up (mark above ALVORA wordmark). Used as the watermark when present. */
const LOGO_PATH = path.join(ROOT, "client", "public", "assets", "brand", "alvora-logo.png");

/** Visual settings, kept in one place so the look can be tuned. */
export const BRAND_IMAGE_STYLE = {
  backdropCentre: "#fbf9f5", // lit centre of the ivory backdrop
  backdropEdge: "#ece5d9", // warm vellum at the corners
  framePadding: 0.07, // share of the canvas left as backdrop on each side
  watermarkOpacity: 0.5,
  markSize: 0.05, // mark height as a share of the canvas
  logoWidth: 0.13, // full lock-up width as a share of the canvas
  margin: 0.035, // distance of the watermark from the edges
  ink: "#1b1a18",
};

function backdropSvg(size, style) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <defs>
    <radialGradient id="g" cx="50%" cy="46%" r="72%">
      <stop offset="0%" stop-color="${style.backdropCentre}"/>
      <stop offset="100%" stop-color="${style.backdropEdge}"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
</svg>`);
}

function wordmarkSvg(size, style) {
  const fontSize = Math.round(size * 0.017);
  const width = Math.round(fontSize * 7.4);
  const height = Math.round(fontSize * 1.6);
  const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <text x="0" y="${Math.round(fontSize * 1.15)}" font-family="DejaVu Sans Mono, Menlo, monospace" font-size="${fontSize}" letter-spacing="${(fontSize * 0.34).toFixed(1)}" fill="${style.ink}" fill-opacity="${style.watermarkOpacity}">ALVORA</text>
</svg>`);
  return { svg, width, height };
}

async function markBuffer(size, style) {
  const markPx = Math.round(size * style.markSize);
  const mark = await sharp(MARK_PATH).resize({ width: markPx, height: markPx, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  // Scale the alpha channel to the watermark opacity.
  const { data, info } = mark;
  for (let i = 3; i < data.length; i += 4) data[i] = Math.round(data[i] * style.watermarkOpacity);
  return { buffer: await sharp(data, { raw: info }).png().toBuffer(), size: markPx };
}

/**
 * Full logo lock-up: trims the white margin, turns the white ground
 * transparent, and fades it to the watermark opacity.
 */
async function logoBuffer(size, style) {
  const targetWidth = Math.round(size * style.logoWidth);
  const trimmed = await sharp(LOGO_PATH).flatten({ background: "#ffffff" }).trim({ threshold: 12 }).resize({ width: targetWidth }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { data, info } = trimmed;
  for (let i = 0; i < data.length; i += 4) {
    // White ground → transparent; anything darker than light grey stays solid,
    // with a short ramp to keep anti-aliased edges smooth.
    const lightness = Math.min(data[i], data[i + 1], data[i + 2]);
    const coverage = Math.min(1, Math.max(0, (250 - lightness) / 40));
    data[i + 3] = Math.round(255 * coverage * style.watermarkOpacity);
  }
  return { buffer: await sharp(data, { raw: info }).png().toBuffer(), width: info.width, height: info.height };
}

/**
 * Render one branded square image and return a sharp pipeline ready for output.
 * `source` may be a path or a Buffer.
 */
export async function brandImage(source, size, style = BRAND_IMAGE_STYLE) {
  const inner = Math.round(size * (1 - style.framePadding * 2));
  const photo = await sharp(source)
    .rotate()
    .resize({ width: inner, height: inner, fit: "inside", withoutEnlargement: false })
    .flatten({ background: style.backdropCentre })
    .toBuffer({ resolveWithObject: true });

  const margin = Math.round(size * style.margin);
  const photoLayer = { input: photo.data, left: Math.round((size - photo.info.width) / 2), top: Math.round((size - photo.info.height) / 2) };

  let watermark;
  if (fs.existsSync(LOGO_PATH)) {
    const logo = await logoBuffer(size, style);
    watermark = [{ input: logo.buffer, left: size - margin - logo.width, top: size - margin - logo.height }];
  } else {
    const mark = await markBuffer(size, style);
    const word = wordmarkSvg(size, style);
    const gap = Math.round(size * 0.008);
    const wordLeft = size - margin - word.width;
    const baseline = size - margin;
    watermark = [
      { input: mark.buffer, left: wordLeft - gap - mark.size, top: baseline - mark.size },
      { input: word.svg, left: wordLeft, top: baseline - Math.round((mark.size + word.height) / 2) },
    ];
  }

  return sharp(backdropSvg(size, style))
    .composite([photoLayer, ...watermark])
    .webp({ quality: 82 });
}

async function cli() {
  const args = process.argv.slice(2);
  const outIndex = args.indexOf("--out");
  const sizeIndex = args.indexOf("--size");
  if (outIndex === -1 || args.length < 3) {
    console.error("Usage: pnpm brand:image <input> [<input> ...] --out <dir> [--size 1400]");
    process.exit(1);
  }
  const outDir = path.resolve(args[outIndex + 1]);
  const size = sizeIndex === -1 ? 1400 : Number(args[sizeIndex + 1]);
  const inputs = args.filter((_, i) => ![outIndex, outIndex + 1, sizeIndex, sizeIndex + 1].includes(i));
  fs.mkdirSync(outDir, { recursive: true });
  for (const [index, input] of inputs.entries()) {
    const out = path.join(outDir, `alvora-${String(index + 1).padStart(2, "0")}.webp`);
    await (await brandImage(input, size)).toFile(out);
    console.log(`${input} → ${out}`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  cli().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
