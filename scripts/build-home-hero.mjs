#!/usr/bin/env node
/**
 * Homepage hero photos: turns one or more large photos (ideally 2400px+ wide)
 * into sharp WebP sizes for phone, laptop and large screens, and records them
 * in shared/homeHero.json. With several photos the homepage rotates them.
 *
 *   pnpm hero:image <photo> [<photo> ...] [--alt "Alt for photo 1" --alt "Alt for photo 2" ...]
 *   pnpm hero:image --clear      (go back to the catalogue shot)
 *
 * Source metadata (EXIF etc.) is stripped from every output.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "client", "public", "assets", "home");
const MANIFEST = path.join(ROOT, "shared", "homeHero.json");
const WIDTHS = [900, 1600, 2400];

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--clear")) {
    fs.writeFileSync(MANIFEST, "null\n");
    fs.rmSync(OUT_DIR, { recursive: true, force: true });
    console.log("Homepage hero reset to the catalogue shot.");
    return;
  }
  const alts = [];
  const sources = [];
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === "--alt") alts.push(args[(i += 1)]);
    else sources.push(args[i]);
  }
  if (!sources.length || sources.some((source) => !fs.existsSync(source))) {
    console.error('Usage: pnpm hero:image <photo> [<photo> ...] [--alt "Description" ...]');
    process.exit(1);
  }

  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const slides = [];
  for (const [index, source] of sources.entries()) {
    const meta = await sharp(source).rotate().metadata();
    const width = meta.autoOrient?.width ?? meta.width;
    if (width < 1600) console.warn(`Warning: ${path.basename(source)} is only ${width}px wide; 2400px or more stays sharp on large screens.`);
    const sizes = [];
    for (const target of WIDTHS.filter((w) => w <= width || w === WIDTHS[0])) {
      const file = `hero-${index + 1}-${target}.webp`;
      const info = await sharp(source).rotate().resize({ width: Math.min(target, width) }).webp({ quality: 84 }).toFile(path.join(OUT_DIR, file));
      sizes.push({ src: `/assets/home/${file}`, width: info.width, height: info.height });
    }
    // Keep the full-resolution original as the largest size when it falls between steps.
    if (width > sizes[sizes.length - 1].width * 1.1) {
      const file = `hero-${index + 1}-${width}.webp`;
      const info = await sharp(source).rotate().webp({ quality: 84 }).toFile(path.join(OUT_DIR, file));
      sizes.push({ src: `/assets/home/${file}`, width: info.width, height: info.height });
    }
    slides.push({ alt: alts[index] ?? "Alvora lab-grown diamond jewellery", sizes });
    console.log(`Hero ${index + 1}: ${sizes.map((s) => `${s.width}px`).join(", ")}`);
  }
  fs.writeFileSync(MANIFEST, `${JSON.stringify({ slides }, null, 2)}\n`);
  console.log(`${slides.length} homepage photo(s) → client/public/assets/home/`);
  const { buildSocialImages } = await import("./build-social-images.mjs");
  await buildSocialImages();
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
