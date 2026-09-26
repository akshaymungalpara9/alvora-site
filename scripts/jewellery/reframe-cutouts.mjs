#!/usr/bin/env node
/** Compose rembg cutouts (/tmp/cutouts/<code>.png) into branded lead cards. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { brandCutoutImage } from "./brand-image.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = process.argv[process.argv.indexOf("--out") + 1];
if (!outDir) { console.error("Usage: node reframe-cutouts.mjs --out <dir>"); process.exit(1); }
const meta = JSON.parse(fs.readFileSync("/tmp/cutouts/meta.json", "utf8"));
const report = { processed: [], capped: [], failed: [] };
for (const [code, m] of Object.entries(meta)) {
  if (!m.ok) { report.failed.push({ code, reason: m.reason }); continue; }
  const png = fs.readFileSync(`/tmp/cutouts/${code}.png`);
  const box = { left: m.box[0], top: m.box[1], width: m.box[2], height: m.box[3] };
  const outPiece = path.join(outDir, code.toLowerCase());
  fs.mkdirSync(outPiece, { recursive: true });
  try {
    const full = await brandCutoutImage(png, box, m.size[0], m.size[1], 1400);
    await full.pipeline.toFile(path.join(outPiece, "01.webp"));
    const thumb = await brandCutoutImage(png, box, m.size[0], m.size[1], 600);
    await thumb.pipeline.toFile(path.join(outPiece, "01-600.webp"));
    const rec = { code, box, fill: +full.meta.fill.toFixed(3), scale: +full.meta.scale.toFixed(3), capped: full.meta.capped };
    (full.meta.capped ? report.capped : report.processed).push(rec);
  } catch (e) { report.failed.push({ code, reason: e.message }); }
}
fs.writeFileSync(path.join(outDir, "report2.json"), JSON.stringify(report, null, 1));
console.log(JSON.stringify({ processed: report.processed.length, capped: report.capped.length, failed: report.failed.length }));
