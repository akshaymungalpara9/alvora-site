#!/usr/bin/env node
/**
 * Alvora photo treatment: places a photo on a soft ivory backdrop and adds
 * the Alvora watermark (faceted-A mark + wordmark) in the lower-right corner.
 *
 * Used by build-catalog.mjs for every jewellery photo, and usable on its own:
 *
 *   pnpm brand:image <photo or folder> [...] --out <folder> [--size 1400] [--keep-background]
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
  // Plain white/light-grey studio backgrounds are swapped for the ivory
  // backdrop. Only light pixels connected to the photo's edge are replaced,
  // so white diamonds and highlights inside the piece are left untouched.
  replaceBackground: true,
  backgroundMinLightness: 232, // 0–255; lower replaces greyer backgrounds too
  backgroundMaxTint: 16, // max spread between colour channels counted as "neutral"
  enclosedBackgroundMinArea: 0.015, // enclosed plain areas larger than this share of the photo are background too…
  enclosedToneTolerance: 1.5, // …if their average tone is within this of the edge background…
  enclosedMaxSpread: 1.2, // …and they are as smooth as a studio backdrop
  // Product shots on a studio background are cropped to the piece and enlarged
  // so it fills the frame, instead of floating small in empty space.
  subjectFill: 0.66, // longest side of the piece as a share of the canvas
  maxUpscale: 2.5, // never enlarge the source more than this, to stay sharp
  shadowTolerance: 40, // pixels within this of the backdrop tone count as shadow when framing
};

/** Longest side the photo is worked on at; keeps large originals fast. */
const WORKING_SIZE = 2400;

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
 * Make the plain studio background transparent: flood-fill from the photo's
 * edges across near-white, neutral pixels, then soften the mask edge so the
 * piece blends into the ivory backdrop without a halo. Photos whose edges are
 * not light (lifestyle shots, hands) come back unchanged.
 */
async function knockOutBackground({ data, info }, style) {
  const { width, height, channels } = info;
  const isBackground = (i) => {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const min = Math.min(r, g, b);
    return min >= style.backgroundMinLightness && Math.max(r, g, b) - min <= style.backgroundMaxTint;
  };
  const mask = new Uint8Array(width * height); // 255 = background
  const queue = new Int32Array(width * height);
  let head = 0;
  let tail = 0;
  const seed = (x, y) => {
    const p = y * width + x;
    if (!mask[p] && isBackground(p * channels)) {
      mask[p] = 255;
      queue[tail++] = p;
    }
  };
  for (let x = 0; x < width; x += 1) { seed(x, 0); seed(x, height - 1); }
  for (let y = 0; y < height; y += 1) { seed(0, y); seed(width - 1, y); }
  while (head < tail) {
    const p = queue[head++];
    const x = p % width;
    const y = (p - x) / width;
    if (x > 0) seed(x - 1, y);
    if (x < width - 1) seed(x + 1, y);
    if (y > 0) seed(x, y - 1);
    if (y < height - 1) seed(x, y + 1);
  }
  // Less than ~2% of the frame touched: no studio background, keep the photo as-is.
  if (tail < width * height * 0.02) return null;
  // Enclosed studio background (the hole inside a ring band): large, smooth
  // near-white areas not reached from the edge. Diamond facets are broken up
  // by facet lines into small patches, so they stay well under this size.
  const minEnclosed = Math.round(width * height * style.enclosedBackgroundMinArea);
  let edgeSum = 0;
  for (let k = 0; k < tail; k += 1) {
    const i = queue[k] * channels;
    edgeSum += (data[i] + data[i + 1] + data[i + 2]) / 3;
  }
  const edgeTone = edgeSum / tail;
  const visited = new Uint8Array(width * height);
  for (let start = 0; start < width * height; start += 1) {
    if (mask[start] || visited[start] || !isBackground(start * channels)) continue;
    const component = [];
    visited[start] = 1;
    component.push(start);
    for (let k = 0; k < component.length; k += 1) {
      const p = component[k];
      const x = p % width;
      const y = (p - x) / width;
      for (const q of [x > 0 ? p - 1 : -1, x < width - 1 ? p + 1 : -1, y > 0 ? p - width : -1, y < height - 1 ? p + width : -1]) {
        if (q >= 0 && !visited[q] && !mask[q] && isBackground(q * channels)) {
          visited[q] = 1;
          component.push(q);
        }
      }
    }
    if (component.length < minEnclosed) continue;
    // Must match the studio backdrop's own tone and be smooth like it;
    // a flat bright facet in a different tone is kept.
    let sum = 0;
    let sumSq = 0;
    for (const p of component) {
      const v = data[p * channels] + data[p * channels + 1] + data[p * channels + 2];
      sum += v;
      sumSq += v * v;
    }
    const mean = sum / component.length / 3;
    const spread = Math.sqrt(Math.max(0, sumSq / component.length - (sum / component.length) ** 2)) / 3;
    if (Math.abs(mean - edgeTone) <= style.enclosedToneTolerance && spread <= style.enclosedMaxSpread) {
      for (const p of component) mask[p] = 255;
    }
  }
  const softMask = await sharp(mask, { raw: { width, height, channels: 1 } }).blur(1.2).extractChannel(0).raw().toBuffer();
  const rgba = Buffer.alloc(width * height * 4);
  // Bounding box of the piece itself, for framing. Faint pixels close to the
  // backdrop tone (the soft cast shadow) are left out so the piece, not its
  // shadow, is what gets centred.
  let left = width, top = height, right = -1, bottom = -1;
  for (let p = 0; p < width * height; p += 1) {
    const i = p * channels;
    rgba[p * 4] = data[i];
    rgba[p * 4 + 1] = data[i + 1];
    rgba[p * 4 + 2] = data[i + 2];
    rgba[p * 4 + 3] = 255 - softMask[p];
    if (softMask[p] >= 128) continue;
    const min = Math.min(data[i], data[i + 1], data[i + 2]);
    const spread = Math.max(data[i], data[i + 1], data[i + 2]) - min;
    if (min > edgeTone - style.shadowTolerance && spread < 24) continue;
    const x = p % width;
    const y = (p - x) / width;
    if (x < left) left = x;
    if (x > right) right = x;
    if (y < top) top = y;
    if (y > bottom) bottom = y;
  }
  if (right < 0) return null;
  const box = { left, top, width: right - left + 1, height: bottom - top + 1 };
  return { rgba: await sharp(rgba, { raw: { width, height, channels: 4 } }).png().toBuffer(), width, height, box };
}

/**
 * Render one branded square image and return a sharp pipeline ready for output.
 * `source` may be a path or a Buffer.
 */
export async function brandImage(source, size, style = BRAND_IMAGE_STYLE) {
  const inner = Math.round(size * (1 - style.framePadding * 2));
  const cutout = style.replaceBackground
    ? await knockOutBackground(await sharp(source).rotate().resize({ width: WORKING_SIZE, height: WORKING_SIZE, fit: "inside", withoutEnlargement: true }).flatten({ background: "#ffffff" }).raw().toBuffer({ resolveWithObject: true }), style)
    : null;
  let photo;
  if (cutout) {
    // Scale the piece to fill the frame (within the upscale limit) and centre
    // it: take a square window around the piece, padding with transparency
    // where the window runs past the photo's edge.
    const { box } = cutout;
    const scale = Math.min((size * style.subjectFill) / Math.max(box.width, box.height), style.maxUpscale);
    const side = Math.round(size / scale);
    const cx = box.left + box.width / 2;
    const cy = box.top + box.height / 2;
    const wantLeft = Math.round(cx - side / 2);
    const wantTop = Math.round(cy - side / 2);
    const x0 = Math.max(0, wantLeft);
    const y0 = Math.max(0, wantTop);
    const x1 = Math.min(cutout.width, wantLeft + side);
    const y1 = Math.min(cutout.height, wantTop + side);
    const window = await sharp(cutout.rgba)
      .extract({ left: x0, top: y0, width: x1 - x0, height: y1 - y0 })
      .extend({ left: x0 - wantLeft, top: y0 - wantTop, right: wantLeft + side - x1, bottom: wantTop + side - y1, background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    photo = await sharp(window).resize({ width: size, height: size, fit: "fill" }).png().toBuffer({ resolveWithObject: true });
  } else {
    photo = await sharp(source).rotate().resize({ width: inner, height: inner, fit: "inside", withoutEnlargement: false }).flatten({ background: style.backdropCentre }).png().toBuffer({ resolveWithObject: true });
  }

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

const IMAGE_FILE = /\.(jpe?g|png|webp|tiff?|avif|heic)$/i;

/** Expand folders (recursively) into image files, keeping the given order. */
function collectInputs(inputs) {
  const files = [];
  for (const input of inputs) {
    const full = path.resolve(input);
    if (fs.existsSync(full) && fs.statSync(full).isDirectory()) {
      const walk = (dir) => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))) {
          const child = path.join(dir, entry.name);
          if (entry.isDirectory()) walk(child);
          else if (IMAGE_FILE.test(entry.name)) files.push({ file: child, relative: path.relative(full, child) });
        }
      };
      walk(full);
    } else if (IMAGE_FILE.test(full)) {
      files.push({ file: full, relative: path.basename(full) });
    } else {
      console.warn(`Skipping ${input}: not an image or folder`);
    }
  }
  return files;
}

async function cli() {
  const args = process.argv.slice(2);
  const outIndex = args.indexOf("--out");
  const sizeIndex = args.indexOf("--size");
  const keepBackground = args.includes("--keep-background");
  const inputs = args.filter((arg, i) => arg !== "--keep-background" && ![outIndex, outIndex + 1, sizeIndex, sizeIndex + 1].includes(i));
  if (outIndex === -1 || !inputs.length) {
    console.error("Usage: pnpm brand:image <photo or folder> [...] --out <folder> [--size 1400] [--keep-background]");
    process.exit(1);
  }
  const outDir = path.resolve(args[outIndex + 1]);
  const size = sizeIndex === -1 ? 1400 : Number(args[sizeIndex + 1]);
  const style = { ...BRAND_IMAGE_STYLE, replaceBackground: !keepBackground };
  const files = collectInputs(inputs);
  let done = 0;
  for (const { file, relative } of files) {
    // Mirror sub-folders; every output is a .webp named after its source.
    const out = path.join(outDir, relative.replace(/\.[^.]+$/, ".webp"));
    fs.mkdirSync(path.dirname(out), { recursive: true });
    try {
      await (await brandImage(file, size, style)).toFile(out);
      done += 1;
      console.log(`✓ ${relative}`);
    } catch (error) {
      console.error(`✗ ${relative}: ${error.message}`);
    }
  }
  console.log(`\n${done} of ${files.length} photos branded → ${outDir}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  cli().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
