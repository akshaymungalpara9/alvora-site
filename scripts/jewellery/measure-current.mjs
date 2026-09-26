import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
const catalog = JSON.parse(fs.readFileSync("shared/jewellery/catalog.json", "utf8"));
const report = JSON.parse(fs.readFileSync("/tmp/reframe/report.json", "utf8"));
const codes = report.noFolder.map((x) => x.code);
// flood-fill style background estimate: sample corners, mask pixels near bg colour
async function measureBox(file) {
  const img = sharp(file).png();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: c } = info;
  const px = (x, y) => { const i = (y * w + x) * c; return [data[i], data[i+1], data[i+2]]; };
  const corners = [px(2,2), px(w-3,2), px(2,h-3), px(w-3,h-3)];
  const bg = corners.map((_, k) => Math.round(corners.reduce((a, p) => a + p[k], 0) / corners.length));
  const tol = 26;
  let minX = w, minY = h, maxX = -1, maxY = -1;
  for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) {
    const p = px(x, y);
    if (Math.abs(p[0]-bg[0]) > tol || Math.abs(p[1]-bg[1]) > tol || Math.abs(p[2]-bg[2]) > tol) {
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0) return null;
  return { width: maxX - minX, height: maxY - minY, w, h };
}
const out = [];
for (const piece of catalog) {
  if (!codes.includes(piece.code)) continue;
  const lead = piece.images[0].src;
  const file = path.join("client/public", lead.startsWith("/") ? lead.slice(1) : lead);
  if (!fs.existsSync(file)) { out.push({ code: piece.code, err: "missing" }); continue; }
  // trim bottom 14% to drop watermark before measuring
  const meta = await sharp(file).metadata();
  const trimmed = await sharp(file).extract({ left: 0, top: 0, width: meta.width, height: Math.round(meta.height * 0.86) }).png().toBuffer();
  const tmp = `/tmp/measure-${piece.code}.png`;
  fs.writeFileSync(tmp, trimmed);
  const box = await measureBox(tmp);
  fs.unlinkSync(tmp);
  if (!box) { out.push({ code: piece.code, err: "nobox" }); continue; }
  const fill = Math.max(box.width, box.height) / Math.min(box.w, box.h);
  out.push({ code: piece.code, fill: +fill.toFixed(2), wFill: +(box.width / box.w).toFixed(2) });
}
fs.writeFileSync("/tmp/current-fill.json", JSON.stringify(out, null, 1));
const fills = out.filter((o) => o.fill).map((o) => o.fill).sort((a, b) => a - b);
console.log("n=", fills.length, "min", fills[0], "median", fills[Math.floor(fills.length/2)], "max", fills[fills.length-1]);
console.log(out.filter((o) => !o.fill || o.fill < 0.7 || o.fill > 0.86));
