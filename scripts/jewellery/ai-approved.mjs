/**
 * Owner-approved AI photos, applied on top of a piece's branded photos.
 *
 * data/jewellery/ai-photos/approved.json (committed) lists, per piece code:
 *   replace: { "01": "ai-enhance-01" }   sharper redraw shown instead of 01.webp
 *   extra:   ["ai-hand", "ai-model"]     new photos added after the originals
 *
 * The files live beside the originals in client/public/assets/jewellery/<code>/
 * (<name>.webp and <name>-600.webp). Only photos the owner approved on the
 * review page are ever written there. See scripts/jewellery/ai-photos.mjs.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");
export const AI_PHOTOS_DIR = path.join(ROOT, "data", "jewellery", "ai-photos");
export const APPROVED_PATH = path.join(AI_PHOTOS_DIR, "approved.json");
export const IMAGE_OUT = path.join(ROOT, "client", "public", "assets", "jewellery");

export function readApproved() {
  if (!fs.existsSync(APPROVED_PATH)) return {};
  return JSON.parse(fs.readFileSync(APPROVED_PATH, "utf8"));
}

function imageFor(code, name, width) {
  const dir = `/assets/jewellery/${code.toLowerCase()}`;
  return { src: `${dir}/${name}.webp`, thumb: `${dir}/${name}-600.webp`, width, height: width };
}

/**
 * Swap in approved redraws and append approved new photos. Entries whose
 * files are missing are skipped, so a half-applied state never breaks a page.
 */
export function withApprovedAiPhotos(code, images, approved = readApproved()) {
  const entry = approved[code];
  if (!entry) return images;
  const dir = path.join(IMAGE_OUT, code.toLowerCase());
  const exists = (name) => fs.existsSync(path.join(dir, `${name}.webp`)) && fs.existsSync(path.join(dir, `${name}-600.webp`));
  const width = images[0]?.width ?? 1400;
  const result = images.map((image) => {
    const number = image.src.match(/\/(\d+)\.webp$/)?.[1];
    const replacement = number ? entry.replace?.[number] : null;
    return replacement && exists(replacement) ? imageFor(code, replacement, image.width ?? width) : image;
  });
  for (const name of entry.extra ?? []) {
    if (exists(name)) result.push(imageFor(code, name, width));
  }
  return result;
}
