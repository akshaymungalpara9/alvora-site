#!/usr/bin/env node
/**
 * Build the bench plate set from source photographs.
 *
 * Reads F1..F8 from an input directory (argv[2] or $HOME/mnt/LBG/Photos),
 * detects the vertical seam in the diptych/triptych frames, splits them into
 * captioned panels, and writes 1600 px and 800 px WebP outputs to
 * client/public/assets/plates/.
 *
 * Refuses to open F4, F6, F9 per Phase 5 decision 3 (polishing-wheel and
 * flat-lay frames excluded until confirmed straight captures). Fails loudly
 * when a required source is missing or when an output exceeds 220 KB.
 *
 * Filename mapping resolves each F-slot to the actual source file, since
 * the current Images folder uses ordinal numbers rather than F-labels.
 * Update FILE_MAPPING to match the folder in use.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const OUTPUT_DIR = path.join(REPO_ROOT, "client", "public", "assets", "plates");
const MAX_BYTES = 220 * 1024;

/** Maps each F-slot to the source filename inside the input directory. */
const FILE_MAPPING = {
  F1: "2.png",
  F2: "5.png",
  F3: "6.png",
  F5: "8.jpg",
  F7: "13.jpg",
  F8: "12.jpg",
};

const EXCLUDED_SLOTS = ["F4", "F6", "F9"];

const REQUIRED_SLOTS = ["F1", "F2", "F3", "F5", "F7"];
const OPTIONAL_SLOTS = ["F8"];

/**
 * Each output plate is one row of this table. `source` is the F-slot,
 * `crop` selects which panel to keep after a seam split. `alt` doubles as
 * both the alt text and the figcaption in PlateSpread.
 */
const PLATES = [
  { name: "plate-bench-loupes",         source: "F1", crop: "whole",  alt: "Grading bench, Surat. Two graders at the loupe. Parcel papers banded by lot." },
  { name: "plate-bench-scale-1350",     source: "F2", crop: "whole",  alt: "Grading bench, Surat. Scale reads 1.350 ct." },
  { name: "plate-bench-loupe-close",    source: "F3", crop: "left",   alt: "Loupe inspection, grading bench, Surat." },
  { name: "plate-bench-tweezers-0352",  source: "F3", crop: "right",  alt: "Tweezers and tray. Scale reads 0.352 ct." },
  { name: "plate-bench-window",         source: "F5", crop: "left",   alt: "Grading bench by the window, Surat." },
  { name: "plate-bench-overhead",       source: "F5", crop: "right",  alt: "Grading bench from above. Marble top, two stations." },
  { name: "plate-parcel-spill",         source: "F7", crop: "left",   alt: "Melee parcel opened onto the tray." },
  { name: "plate-emerald-tweezers",     source: "F7", crop: "right",  alt: "Emerald cut in tweezers under the bench lamp." },
  { name: "plate-cabinet",              source: "F8", crop: "middle", alt: "Display cabinet, grading office, Surat." },
];

async function seamColumn(image, panels = 2) {
  const { width, height } = await image.metadata();
  if (!width || !height) throw new Error("Cannot read image dimensions");
  const middleStartFraction = panels === 3 ? [1 / 3 - 0.1, 2 / 3 - 0.1] : [0.4];
  const scanWidthFraction = 0.2;
  const seams = [];
  for (const startFrac of middleStartFraction) {
    const scanX = Math.floor(startFrac * width);
    const scanWidth = Math.max(2, Math.floor(scanWidthFraction * width));
    const region = image.clone().extract({
      left: scanX,
      top: 0,
      width: scanWidth,
      height,
    });
    const raw = await region.grayscale().raw().toBuffer({ resolveWithObject: true });
    const { data, info } = raw;
    const colMean = new Array(info.width).fill(0);
    const colVar = new Array(info.width).fill(0);
    for (let x = 0; x < info.width; x += 1) {
      let sum = 0;
      for (let y = 0; y < info.height; y += 1) sum += data[y * info.width + x];
      colMean[x] = sum / info.height;
    }
    for (let x = 0; x < info.width; x += 1) {
      let sumSq = 0;
      for (let y = 0; y < info.height; y += 1) {
        const d = data[y * info.width + x] - colMean[x];
        sumSq += d * d;
      }
      colVar[x] = sumSq / info.height;
    }
    let bestX = -1;
    let bestScore = Infinity;
    for (let x = 0; x < info.width; x += 1) {
      const uniform = colVar[x] < 16;
      const veryBright = colMean[x] > 240;
      const veryDark = colMean[x] < 20;
      if (uniform && (veryBright || veryDark)) {
        const score = colVar[x];
        if (score < bestScore) {
          bestScore = score;
          bestX = x;
        }
      }
    }
    if (bestX < 0) {
      const centre = Math.floor(scanWidth / 2);
      let bestVar = colVar[centre];
      bestX = centre;
      for (let x = 0; x < scanWidth; x += 1) {
        if (colVar[x] < bestVar) {
          bestVar = colVar[x];
          bestX = x;
        }
      }
      console.warn(`  [seam] no strong seam found near ${(startFrac * 100).toFixed(0)}%; falling back to min-variance column at x=${scanX + bestX}`);
    }
    seams.push(scanX + bestX);
  }
  return seams;
}

async function loadSource(inputDir, slot) {
  const filename = FILE_MAPPING[slot];
  if (!filename) throw new Error(`No mapping for slot ${slot}`);
  const fullPath = path.join(inputDir, filename);
  if (!fs.existsSync(fullPath)) return null;
  return { fullPath, image: sharp(fullPath, { failOn: "none" }) };
}

async function panelForPlate(image, sourceSlot, crop) {
  const { width } = await image.metadata();
  if (!width) throw new Error("Missing width");
  if (crop === "whole") return image.clone();
  if (crop === "middle") {
    const seams = await seamColumn(image.clone(), 3);
    const left = seams[0];
    const right = seams[1];
    return image.clone().extract({ left, top: 0, width: right - left, height: (await image.metadata()).height });
  }
  const seams = await seamColumn(image.clone(), 2);
  const seam = seams[0];
  const { height } = await image.metadata();
  if (crop === "left") {
    return image.clone().extract({ left: 0, top: 0, width: seam, height });
  }
  return image.clone().extract({ left: seam, top: 0, width: width - seam, height });
}

async function writeSizes(image, name, sizes) {
  const outputs = [];
  for (const { width, suffix } of sizes) {
    const outPath = path.join(OUTPUT_DIR, `${name}${suffix}.webp`);
    const buffer = await image
      .clone()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 82, effort: 6, smartSubsample: true })
      .withMetadata({ orientation: undefined })
      .toBuffer();
    fs.writeFileSync(outPath, buffer);
    outputs.push({ outPath, bytes: buffer.length });
  }
  return outputs;
}

async function main() {
  const inputDir = path.resolve(process.argv[2] || path.join(process.env.HOME || "", "mnt", "LBG", "Photos"));
  if (!fs.existsSync(inputDir)) {
    console.error(`[build-plates] Input directory not found: ${inputDir}`);
    process.exit(2);
  }

  for (const slot of EXCLUDED_SLOTS) {
    if (FILE_MAPPING[slot]) {
      console.error(`[build-plates] Refusing to open excluded slot ${slot}: ${FILE_MAPPING[slot]}. Remove from FILE_MAPPING.`);
      process.exit(1);
    }
  }

  const missing = [];
  for (const slot of REQUIRED_SLOTS) {
    const filename = FILE_MAPPING[slot];
    if (!filename || !fs.existsSync(path.join(inputDir, filename))) missing.push(slot);
  }
  if (missing.length > 0) {
    console.error(`[build-plates] Missing required source file(s) for slot(s): ${missing.join(", ")}. Check FILE_MAPPING and the input directory.`);
    process.exit(1);
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const sourceCache = new Map();
  const sizes = [
    { width: 1600, suffix: "" },
    { width: 800, suffix: "-800" },
  ];

  const results = [];

  for (const plate of PLATES) {
    if (OPTIONAL_SLOTS.includes(plate.source)) {
      const src = FILE_MAPPING[plate.source];
      if (!src || !fs.existsSync(path.join(inputDir, src))) {
        console.log(`[build-plates] Skipping ${plate.name}: optional source ${plate.source} missing`);
        continue;
      }
    }

    let entry = sourceCache.get(plate.source);
    if (!entry) {
      entry = await loadSource(inputDir, plate.source);
      if (!entry) throw new Error(`Source not found for slot ${plate.source}`);
      sourceCache.set(plate.source, entry);
    }

    console.log(`[build-plates] ${plate.name} <- ${plate.source} (${plate.crop})`);
    const panel = await panelForPlate(entry.image, plate.source, plate.crop);
    const outputs = await writeSizes(panel, plate.name, sizes);
    for (const out of outputs) {
      results.push({ name: path.basename(out.outPath), bytes: out.bytes });
      if (out.bytes > MAX_BYTES) {
        console.error(`[build-plates] ${path.basename(out.outPath)} exceeded ${MAX_BYTES} bytes: ${out.bytes} bytes`);
        process.exit(3);
      }
    }
  }

  results.sort((a, b) => a.name.localeCompare(b.name));
  console.log("");
  console.log("=== Plate sizes ===");
  console.log("filename".padEnd(38) + "bytes");
  for (const r of results) {
    console.log(r.name.padEnd(38) + r.bytes.toString());
  }
  console.log("");
  console.log(`Wrote ${results.length} plate file(s) to ${OUTPUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
