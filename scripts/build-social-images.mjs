#!/usr/bin/env node
/**
 * Link-preview images (WhatsApp, iMessage, Facebook, X): 1200x630 JPEG.
 *
 *   client/public/assets/social/alvora-jewellery.jpg   the homepage photos side by side
 *   client/public/assets/social/pieces/<code>.jpg      each piece's first photo
 *
 * JPEG, not WebP: several chat apps don't show WebP previews.
 * Run by `pnpm hero:image` and `pnpm jewellery:images`; also `pnpm social:images`.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = path.join(ROOT, "client", "public");
const OUT = path.join(PUBLIC, "assets", "social");
const WIDTH = 1200;
const HEIGHT = 630;
const IVORY = "#f3eee6";
const GUTTER = 6;

async function heroCollage() {
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "shared", "homeHero.json"), "utf8"));
  const slides = manifest?.slides ?? [];
  if (!slides.length) return false;
  const count = slides.length;
  const panel = Math.floor((WIDTH - GUTTER * (count - 1)) / count);
  const layers = [];
  for (const [index, slide] of slides.entries()) {
    const source = path.join(PUBLIC, slide.sizes[slide.sizes.length - 1].src);
    // Keep the lower-middle of each portrait, where the ring sits.
    const buffer = await sharp(source).resize({ width: panel, height: HEIGHT, fit: "cover", position: "centre" }).toBuffer();
    layers.push({ input: buffer, left: index * (panel + GUTTER), top: 0 });
  }
  await sharp({ create: { width: WIDTH, height: HEIGHT, channels: 3, background: IVORY } })
    .composite(layers)
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(path.join(OUT, "alvora-jewellery.jpg"));
  return true;
}

async function pieceCards() {
  const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, "shared", "jewellery", "catalog.json"), "utf8"));
  const dir = path.join(OUT, "pieces");
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  let made = 0;
  for (const piece of catalog) {
    const first = piece.images[0];
    if (!piece.live || !first) continue;
    // Stretch the photo's own edge pixels sideways so the backdrop runs seamlessly to the frame.
    const side = (WIDTH - HEIGHT) / 2;
    await sharp(path.join(PUBLIC, first.src))
      .resize({ width: HEIGHT, height: HEIGHT })
      .extend({ left: Math.floor(side), right: Math.ceil(side), extendWith: "copy" })
      .jpeg({ quality: 84, mozjpeg: true })
      .toFile(path.join(dir, `${piece.code.toLowerCase()}.jpg`));
    made += 1;
  }
  return made;
}

export async function buildSocialImages() {
  fs.mkdirSync(OUT, { recursive: true });
  const collage = await heroCollage();
  const pieces = await pieceCards();
  console.log(`Link previews: ${collage ? "homepage collage, " : ""}${pieces} piece card(s) → client/public/assets/social/`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  buildSocialImages().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
