#!/usr/bin/env node
/**
 * AI photo upgrade for live jewellery pieces, with owner approval.
 *
 *   pnpm jewellery:ai-photos generate --pieces ALV-R-0001,ALV-E-0006 [--shots enhance,hand] [--force]
 *   pnpm jewellery:ai-photos generate --all
 *   pnpm jewellery:ai-photos review --out <folder>      images + data.json for the review page
 *   pnpm jewellery:ai-photos apply --decisions <file>   copy approved photos onto the site
 *
 * generate  Uses Google's Gemini image model (GEMINI_API_KEY) to
 *           1. redraw each studio photo sharper ("enhance-NN"), then brand it
 *              (ivory backdrop, centred, watermark);
 *           2. stage new photos from the piece's own studio shots (hand on
 *              linen, model, close-up, side view), styled like the homepage
 *              photos, kept inside an ivory frame with the watermark.
 *           Candidates go to data/jewellery/ai-photos/candidates/ (git-ignored),
 *           never to the public folder.
 * apply     Takes the owner's decisions from the review page. Approved photos
 *           are written to client/public/assets/jewellery/<code>/ai-*.webp and
 *           listed in data/jewellery/ai-photos/approved.json; decisions are kept
 *           in data/jewellery/ai-photos/decisions.json. Run
 *           `pnpm jewellery:build` and `pnpm social:images` afterwards.
 *
 * Source photos: the raw partner photos when present
 * (data/jewellery/raw-images/...), otherwise the committed branded photo
 * with the watermark painted out.
 *
 * In the cloud sandbox, run with NODE_USE_ENV_PROXY=1 so fetch uses the proxy.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { brandImage, backdropSvg, BRAND_IMAGE_STYLE } from "./brand-image.mjs";
import { AI_PHOTOS_DIR, APPROVED_PATH, IMAGE_OUT, readApproved } from "./ai-approved.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");
const CATALOG_PATH = path.join(ROOT, "shared", "jewellery", "catalog.json");
const CANDIDATES_DIR = path.join(AI_PHOTOS_DIR, "candidates");
const DECISIONS_PATH = path.join(AI_PHOTOS_DIR, "decisions.json");
const HERO_DIR = path.join(ROOT, "client", "public", "assets", "home");

const MODEL = process.env.GEMINI_IMAGE_MODEL || "gemini-3.1-flash-image";
const IMAGE_SIZE = "2K";
const CONCURRENCY = 4;

/**
 * Pieces whose photos include the owner's own shots (CLAUDE.md "Owner photo
 * overrides"): those photos are never redrawn.
 */
const OWNER_PHOTOS = { "ALV-R-0042": ["03", "04"] };

const KEEP_DESIGN =
  "The jewellery must stay exactly identical to the reference product photos: same design, metal colour, stone shape, cut and colour, " +
  "number and position of prongs, side stones, band width, profile and proportions. Copy the exact number of stones and their arrangement. " +
  "Do not add, remove, simplify or change any element of the piece. Show only as many pieces as the reference shows (a pair of earrings is exactly two earrings; " +
  "a ring shown stacked with a band stays stacked with that same band). No duplicates, reflections or ghost copies of the piece. No text, no logos, no watermark.";

const MOOD =
  "Warm, soft natural window light; muted ivory, cream and warm-beige palette; gentle shadows; calm, quiet luxury editorial mood; " +
  "fine-art film-like softness; photorealistic. The last reference image is a mood and lighting reference only: ignore any jewellery in it.";

/** New shots per category. `label` is what the owner sees on the review page. */
const SCENES = {
  ring: [
    { shot: "hand", label: "Hand on ivory linen", prompt: "Close-up editorial photograph of a woman's left hand, neat short natural manicure, resting on softly draped ivory linen, wearing the ring on the ring finger (fourth finger). Frame tightly on the fingers so the ring is the hero: large in the frame, sharply focused, face-up to the camera so the centre stone and setting are clearly visible." },
    { shot: "model", label: "On a model", prompt: "Editorial portrait of a woman with softly tied-back hair in an ivory silk top, fingertips resting lightly near her jaw, in front of a cream linen curtain. She wears the ring on her left ring finger; the hand is close to the camera so the ring is clearly visible and in sharp focus." },
    { shot: "closeup", label: "Close-up", prompt: "Macro close-up photograph of the ring resting on ivory linen, centre stone facing the camera, crisp facets and polished metal, very shallow depth of field with the linen weave softly blurred." },
    { shot: "side", label: "Side view", prompt: "Side-profile photograph of the ring standing upright on an ivory linen surface, seen from the side at stone height so the setting height, prongs and band profile are visible. Follow the side-view reference photos exactly where they exist." },
  ],
  band: [
    { shot: "hand", label: "Hand on ivory linen", prompt: "Close-up editorial photograph of a woman's left hand, neat short natural manicure, resting on softly draped ivory linen, wearing the band on the ring finger (fourth finger), large in frame and sharply focused." },
    { shot: "closeup", label: "Close-up", prompt: "Macro close-up photograph of the band resting on ivory linen, crisp stones and polished metal, very shallow depth of field." },
    { shot: "side", label: "Side view", prompt: "Side-profile photograph of the band standing upright on an ivory linen surface, showing its width and profile." },
  ],
  earrings: [
    { shot: "model", label: "On a model", prompt: "Editorial three-quarter profile portrait of a woman with hair tucked behind her ear, ivory silk top, in front of a cream linen curtain. She wears one of the earrings on her visible earlobe, clearly visible and in sharp focus, at a natural true-to-life size." },
    { shot: "ear", label: "Close-up on the ear", prompt: "Close-up photograph of a woman's earlobe wearing one of the earrings, hair tucked back, soft skin texture, the earring sharply focused and shown at a natural true-to-life size." },
    { shot: "linen", label: "Pair on ivory linen", prompt: "Photograph of the pair of earrings lying side by side on softly draped ivory linen, seen from slightly above, crisp stones and polished metal, shallow depth of field." },
    { shot: "hand", label: "Held in the hand", prompt: "Close-up photograph of the pair of earrings resting in a woman's open palm, neat short natural manicure, ivory linen softly blurred behind, the earrings sharply focused." },
  ],
  pendant: [
    { shot: "model", label: "On a model", prompt: "Editorial portrait of a woman in an open-necked ivory silk top in front of a cream linen curtain, wearing the pendant on a fine chain at her collarbone, clearly visible and in sharp focus, at a natural true-to-life size." },
    { shot: "closeup", label: "Close-up", prompt: "Close-up photograph of the pendant at a woman's collarbone, sharply focused, soft skin texture." },
    { shot: "linen", label: "On ivory linen", prompt: "Photograph of the pendant and its chain lying on softly draped ivory linen, crisp stone and polished metal, shallow depth of field." },
  ],
};

const ENHANCE_PROMPT =
  "Re-photograph this exact piece of jewellery as a high-resolution, tack-sharp studio product photograph: the same viewing angle and orientation, " +
  "the whole piece centred in the frame with even space around it, on a plain seamless pure white background, soft even lighting, crisp diamond facets, cleanly polished metal. " +
  KEEP_DESIGN;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const readJson = (file, fallback) => (fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : fallback);
const writeJson = (file, data) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
};

function argValue(args, name) {
  const index = args.indexOf(name);
  return index === -1 ? null : args[index + 1];
}

function publicDir(code) {
  return path.join(IMAGE_OUT, code.toLowerCase());
}

/** The piece's own numbered photos, e.g. ["01", "02"]. */
function numberedPhotos(code) {
  const dir = publicDir(code);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => /^\d+\.webp$/.test(f)).sort().map((f) => f.replace(".webp", ""));
}

const BACKDROP_TOLERANCE = 18;

/**
 * Branded photos are either a studio shot on the ivory backdrop, or a
 * lifestyle photo set inside an ivory frame. A lifestyle photo is a solid
 * rectangle, so the corners of its content box are photo, not backdrop.
 */
async function analyseBranded(file) {
  const size = 1400;
  const backdrop = await sharp(backdropSvg(size, BRAND_IMAGE_STYLE)).removeAlpha().raw().toBuffer();
  const { data, info } = await sharp(file).resize(size, size).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const differs = (p) => {
    const i = p * 3;
    return Math.abs(data[i] - backdrop[i]) + Math.abs(data[i + 1] - backdrop[i + 1]) + Math.abs(data[i + 2] - backdrop[i + 2]) > BACKDROP_TOLERANCE * 3;
  };
  // Ignore the watermark corner.
  const wmLeft = Math.round(size * 0.78);
  const wmTop = Math.round(size * 0.9);
  let left = size, top = size, right = -1, bottom = -1;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (x >= wmLeft && y >= wmTop) continue;
      if (!differs(y * size + x)) continue;
      if (x < left) left = x;
      if (x > right) right = x;
      if (y < top) top = y;
      if (y > bottom) bottom = y;
    }
  }
  if (right < 0) return { studio: false, box: null, data, info, backdrop };
  const inset = 4;
  const corners = [
    [left + inset, top + inset],
    [right - inset, top + inset],
    [left + inset, bottom - inset],
    [right - inset, bottom - inset],
  ];
  const photoCorners = corners.filter(([x, y]) => differs(y * size + x)).length;
  return { studio: photoCorners < 3, box: { left, top, width: right - left + 1, height: bottom - top + 1 }, data, info, backdrop };
}

/** Branded studio photo → watermark painted out, cropped around the piece, on white. */
async function cleanStudioSource(file) {
  const analysis = await analyseBranded(file);
  const size = analysis.info.width;
  const { data, backdrop } = analysis;
  // Paint the watermark corner with the backdrop.
  const wmLeft = Math.round(size * 0.78);
  const wmTop = Math.round(size * 0.9);
  for (let y = wmTop; y < size; y += 1) {
    for (let x = wmLeft; x < size; x += 1) {
      const i = (y * size + x) * 3;
      data[i] = backdrop[i];
      data[i + 1] = backdrop[i + 1];
      data[i + 2] = backdrop[i + 2];
    }
  }
  const box = analysis.box;
  const pad = Math.round(Math.max(box.width, box.height) * 0.12);
  const side = Math.min(size, Math.max(box.width, box.height) + pad * 2);
  const cx = box.left + box.width / 2;
  const cy = box.top + box.height / 2;
  const left = Math.max(0, Math.min(size - side, Math.round(cx - side / 2)));
  const top = Math.max(0, Math.min(size - side, Math.round(cy - side / 2)));
  return sharp(data, { raw: { width: size, height: size, channels: 3 } }).extract({ left, top, width: side, height: side }).png().toBuffer();
}

/** Raw partner photo for a numbered photo, if the raw folders are present. */
function rawSourceFor(piece, number) {
  const sourcing = readJson(path.join(ROOT, "server", "data", "jewellery-sourcing.json"), null);
  const pieces = readJson(path.join(ROOT, "data", "jewellery", "pieces.json"), {});
  const entry = Array.isArray(sourcing) ? sourcing.find((s) => s.code === piece.code) : sourcing?.[piece.code];
  const partner = entry?.partner;
  const folderName = (Array.isArray(pieces) ? pieces.find((p) => p.code === piece.code) : Object.values(pieces).find((p) => p?.code === piece.code))?.imageFolder;
  if (!partner || !folderName) return null;
  const dirs = { junerings: ["junerings", "junerings-images"], pooja: ["poojadiamond", "poojadiamond-images"], carat: ["caratdiamonds", "caratdiamonds-images"] }[partner] ?? [];
  for (const dir of dirs) {
    const folder = path.join(ROOT, "data", "jewellery", "raw-images", dir, folderName);
    if (!fs.existsSync(folder)) continue;
    const files = fs.readdirSync(folder).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    const file = files[Number(number) - 1];
    if (file) return path.join(folder, file);
  }
  return null;
}

async function toPng(source, max = 2048) {
  return sharp(source).rotate().resize({ width: max, height: max, fit: "inside", withoutEnlargement: true }).flatten({ background: "#ffffff" }).png().toBuffer();
}

// ---------------------------------------------------------------------------
// Gemini
// ---------------------------------------------------------------------------

let totalUsage = { calls: 0, outputImages: 0, promptTokens: 0, outputTokens: 0 };

async function gemini(prompt, references, { aspectRatio = "1:1" } = {}) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set.");
  const parts = [
    ...references.map((buffer) => ({ inline_data: { mime_type: "image/png", data: buffer.toString("base64") } })),
    { text: prompt },
  ];
  const body = JSON.stringify({
    contents: [{ parts }],
    generationConfig: { responseModalities: ["IMAGE"], imageConfig: { aspectRatio, imageSize: IMAGE_SIZE } },
  });
  for (let attempt = 1; ; attempt += 1) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: "POST",
      headers: { "x-goog-api-key": key, "content-type": "application/json" },
      body,
    });
    const json = await response.json().catch(() => ({}));
    const retryable = response.status === 429 || response.status >= 500;
    if (!response.ok) {
      if (retryable && attempt < 5) {
        await new Promise((r) => setTimeout(r, 2000 * 2 ** attempt));
        continue;
      }
      throw new Error(`${response.status} ${json.error?.status ?? ""} ${(json.error?.message ?? "").slice(0, 300)}`);
    }
    totalUsage.calls += 1;
    totalUsage.promptTokens += json.usageMetadata?.promptTokenCount ?? 0;
    totalUsage.outputTokens += json.usageMetadata?.candidatesTokenCount ?? 0;
    const part = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData || p.inline_data);
    if (!part) {
      if (attempt < 3) continue;
      throw new Error(`No image returned (${json.candidates?.[0]?.finishReason ?? "unknown reason"})`);
    }
    totalUsage.outputImages += 1;
    return Buffer.from((part.inlineData ?? part.inline_data).data, "base64");
  }
}

async function pool(items, worker) {
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, items.length) }, async () => {
      while (next < items.length) {
        const item = items[next++];
        await worker(item);
      }
    }),
  );
}

// ---------------------------------------------------------------------------
// generate
// ---------------------------------------------------------------------------

async function generate(args) {
  const catalog = readJson(CATALOG_PATH, []);
  const live = catalog.filter((p) => p.live && p.images.length);
  const wanted = args.includes("--all") ? live : live.filter((p) => (argValue(args, "--pieces") ?? "").split(",").map((s) => s.trim().toUpperCase()).includes(p.code));
  if (!wanted.length) throw new Error("No pieces selected. Use --pieces ALV-R-0001,... or --all.");
  const shotFilter = argValue(args, "--shots")?.split(",");
  const force = args.includes("--force");
  const heroFile = fs.readdirSync(HERO_DIR).find((f) => /hero-1-900\.webp$/.test(f));
  const mood = heroFile ? await sharp(path.join(HERO_DIR, heroFile)).png().toBuffer() : null;
  const manifestPath = path.join(CANDIDATES_DIR, "manifest.json");
  const manifest = readJson(manifestPath, {});

  for (const piece of wanted) {
    const outDir = path.join(CANDIDATES_DIR, piece.code.toLowerCase());
    fs.mkdirSync(outDir, { recursive: true });
    const entry = (manifest[piece.code] ??= { code: piece.code, name: piece.name, category: piece.category, items: {} });

    // Studio shots: sources for redraws and references for new scenes.
    const studio = [];
    for (const number of numberedPhotos(piece.code)) {
      if (OWNER_PHOTOS[piece.code]?.includes(number)) continue;
      const branded = path.join(publicDir(piece.code), `${number}.webp`);
      const analysis = await analyseBranded(branded);
      if (!analysis.studio) continue;
      const raw = rawSourceFor(piece, number);
      const source = raw ? await toPng(raw) : await cleanStudioSource(branded);
      fs.writeFileSync(path.join(outDir, `source-${number}.png`), source);
      studio.push({ number, source, fromRaw: Boolean(raw) });
    }
    if (!studio.length) {
      console.log(`– ${piece.code} ${piece.name}: no studio photo to work from, skipped`);
      continue;
    }

    const jobs = [];
    for (const { number, source, fromRaw } of studio) {
      jobs.push({ shot: `enhance-${number}`, label: `Sharper photo ${number}`, kind: "replace", replaces: number, prompt: ENHANCE_PROMPT, references: [source], fromRaw, keepBackground: false });
    }
    const scenes = SCENES[piece.category] ?? SCENES.ring;
    const references = studio.slice(0, 4).map((s) => s.source);
    for (const scene of scenes) {
      const prompt =
        `${scene.prompt} The reference product photos (the first ${references.length} image${references.length > 1 ? "s" : ""}) show this exact piece from different angles. ` +
        `${KEEP_DESIGN} ${MOOD}`;
      jobs.push({ shot: scene.shot, label: scene.label, kind: "extra", prompt, references: mood ? [...references, mood] : references, keepBackground: true });
    }

    const todo = jobs.filter((job) => (!shotFilter || shotFilter.some((s) => job.shot.startsWith(s))) && (force || !entry.items[job.shot]));
    console.log(`▸ ${piece.code} ${piece.name}: ${todo.length} photo${todo.length === 1 ? "" : "s"} to make`);
    await pool(todo, async (job) => {
      try {
        const png = await gemini(job.prompt, job.references);
        fs.writeFileSync(path.join(outDir, `${job.shot}.png`), png);
        const style = { ...BRAND_IMAGE_STYLE, replaceBackground: !job.keepBackground };
        await (await brandImage(png, 1400, style)).toFile(path.join(outDir, `${job.shot}.webp`));
        await (await brandImage(png, 600, style)).toFile(path.join(outDir, `${job.shot}-600.webp`));
        entry.items[job.shot] = { shot: job.shot, label: job.label, kind: job.kind, replaces: job.replaces ?? null, model: MODEL, fromRaw: job.fromRaw ?? null, createdAt: new Date().toISOString() };
        writeJson(manifestPath, manifest);
        console.log(`  ✓ ${piece.code} ${job.shot}`);
      } catch (error) {
        console.error(`  ✗ ${piece.code} ${job.shot}: ${error.message}`);
      }
    });
  }
  writeJson(manifestPath, manifest);
  console.log(`\nGemini calls: ${totalUsage.calls}, images made: ${totalUsage.outputImages} (model ${MODEL}, ${IMAGE_SIZE}).`);
}

// ---------------------------------------------------------------------------
// review: bundle for the private review page
// ---------------------------------------------------------------------------

async function review(args) {
  const out = path.resolve(argValue(args, "--out") ?? path.join(AI_PHOTOS_DIR, "review"));
  const manifest = readJson(path.join(CANDIDATES_DIR, "manifest.json"), {});
  const decisions = readJson(DECISIONS_PATH, {});
  const only = argValue(args, "--pieces")?.split(",").map((s) => s.trim().toUpperCase());
  fs.mkdirSync(path.join(out, "img"), { recursive: true });
  const pieces = [];
  for (const entry of Object.values(manifest)) {
    if (only && !only.includes(entry.code)) continue;
    const code = entry.code.toLowerCase();
    const candidateDir = path.join(CANDIDATES_DIR, code);
    const save = async (from, name) => {
      const file = `img/${code}-${name}.webp`;
      await sharp(from).resize(1000, 1000, { fit: "inside" }).webp({ quality: 80 }).toFile(path.join(out, file));
      return file;
    };
    const originals = [];
    for (const number of numberedPhotos(entry.code)) originals.push({ number, src: await save(path.join(publicDir(entry.code), `${number}.webp`), `orig-${number}`) });
    const items = [];
    for (const item of Object.values(entry.items)) {
      const file = path.join(candidateDir, `${item.shot}.webp`);
      if (!fs.existsSync(file)) continue;
      items.push({ ...item, id: `${entry.code}--${item.shot}`, src: await save(file, item.shot), decision: decisions[entry.code]?.[item.shot] ?? null });
    }
    const rank = (item) => (item.kind === "replace" ? Number(item.replaces) : 100 + sceneOrder(entry.code, `ai-${item.shot}`));
    items.sort((a, b) => rank(a) - rank(b));
    pieces.push({ code: entry.code, name: entry.name, category: entry.category, originals, items });
  }
  writeJson(path.join(out, "data.json"), { generatedAt: new Date().toISOString(), pieces });
  console.log(`Review bundle: ${pieces.length} pieces, ${pieces.reduce((n, p) => n + p.items.length, 0)} new photos → ${out}`);
}

// ---------------------------------------------------------------------------
// apply: approved photos → site
// ---------------------------------------------------------------------------

async function apply(args) {
  const file = argValue(args, "--decisions");
  if (!file) throw new Error("Usage: apply --decisions <file.json>  ({ \"ALV-R-0001\": { \"hand\": \"approved\" } })");
  const incoming = readJson(path.resolve(file), {});
  const decisions = readJson(DECISIONS_PATH, {});
  const approved = readApproved();
  let written = 0;
  let removed = 0;
  for (const [code, shots] of Object.entries(incoming)) {
    decisions[code] = { ...(decisions[code] ?? {}), ...shots };
    const entry = (approved[code] ??= { replace: {}, extra: [] });
    for (const [shot, status] of Object.entries(shots)) {
      const name = `ai-${shot}`;
      const replaces = shot.match(/^enhance-(\d+)$/)?.[1] ?? null;
      const target = path.join(publicDir(code), `${name}.webp`);
      if (status === "approved") {
        const from = path.join(CANDIDATES_DIR, code.toLowerCase(), `${shot}.webp`);
        if (!fs.existsSync(from)) {
          if (!fs.existsSync(target)) console.warn(`! ${code} ${shot}: approved, but the candidate file is missing`);
          continue;
        }
        fs.copyFileSync(from, target);
        fs.copyFileSync(path.join(CANDIDATES_DIR, code.toLowerCase(), `${shot}-600.webp`), path.join(publicDir(code), `${name}-600.webp`));
        if (replaces) entry.replace[replaces] = name;
        else if (!entry.extra.includes(name)) entry.extra.push(name);
        written += 1;
      } else {
        // Rejected (or un-approved): make sure it is not on the site.
        for (const f of [`${name}.webp`, `${name}-600.webp`]) {
          if (fs.existsSync(path.join(publicDir(code), f))) {
            fs.rmSync(path.join(publicDir(code), f));
            removed += 1;
          }
        }
        if (replaces && entry.replace[replaces] === name) delete entry.replace[replaces];
        entry.extra = entry.extra.filter((n) => n !== name);
      }
    }
    // Keep the scene order stable: the order they were made in.
    entry.extra.sort((a, b) => sceneOrder(code, a) - sceneOrder(code, b));
    if (!Object.keys(entry.replace).length && !entry.extra.length) delete approved[code];
  }
  writeJson(DECISIONS_PATH, decisions);
  writeJson(APPROVED_PATH, Object.fromEntries(Object.entries(approved).sort(([a], [b]) => a.localeCompare(b))));
  console.log(`Applied: ${written} photo${written === 1 ? "" : "s"} on the site, ${removed} file${removed === 1 ? "" : "s"} removed.`);
  console.log("Next: pnpm jewellery:build && pnpm social:images");
}

function sceneOrder(code, name) {
  const catalog = readJson(CATALOG_PATH, []);
  const category = catalog.find((p) => p.code === code)?.category ?? "ring";
  const index = (SCENES[category] ?? SCENES.ring).findIndex((s) => `ai-${s.shot}` === name);
  return index === -1 ? 99 : index;
}

// ---------------------------------------------------------------------------

const [command, ...rest] = process.argv.slice(2);
const commands = { generate, review, apply };
if (!commands[command]) {
  console.error("Usage: pnpm jewellery:ai-photos <generate|review|apply> [options]  (see the top of scripts/jewellery/ai-photos.mjs)");
  process.exit(1);
}
commands[command](rest).catch((error) => {
  console.error(error.message);
  process.exit(1);
});
