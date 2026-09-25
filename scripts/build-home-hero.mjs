#!/usr/bin/env node
/**
 * Homepage hero photo: turns one large photo (ideally 4K) into sharp WebP
 * sizes for phone, laptop and large screens, and records it in
 * shared/homeHero.json so the homepage uses it instead of a catalogue shot.
 *
 *   pnpm hero:image <photo> [--alt "Description of the photo"]
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
    console.log("Homepage hero reset to the catalogue shot.");
    return;
  }
  const altIndex = args.indexOf("--alt");
  const alt = altIndex === -1 ? "Alvora lab-grown diamond jewellery" : args[altIndex + 1];
  const source = args.find((arg, i) => !arg.startsWith("--") && i !== altIndex + 1);
  if (!source || !fs.existsSync(source)) {
    console.error('Usage: pnpm hero:image <photo> [--alt "Description"]');
    process.exit(1);
  }
  const meta = await sharp(source).rotate().metadata();
  const width = meta.autoOrient?.width ?? meta.width;
  if (width < 2000) console.warn(`Warning: the photo is only ${width}px wide; 2400px or more stays sharp on large screens.`);

  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const sizes = [];
  for (const target of WIDTHS.filter((w) => w <= width || w === WIDTHS[0])) {
    const file = `hero-${target}.webp`;
    const info = await sharp(source).rotate().resize({ width: Math.min(target, width) }).webp({ quality: 84 }).toFile(path.join(OUT_DIR, file));
    sizes.push({ src: `/assets/home/${file}`, width: info.width, height: info.height });
  }
  fs.writeFileSync(MANIFEST, `${JSON.stringify({ alt, sizes }, null, 2)}\n`);
  console.log(`Homepage hero: ${sizes.map((s) => `${s.width}px`).join(", ")} → client/public/assets/home/`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
