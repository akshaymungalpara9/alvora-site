#!/usr/bin/env node
/**
 * Build the Alvora jewellery catalogue from the partner launch shortlist.
 *
 * Inputs
 *   data/jewellery/launch_shortlist_v1.csv   partner shortlist (never shipped to the client)
 *   data/jewellery/pieces.json               editable Alvora names, codes and overrides
 *   data/jewellery/pricing.json              retail pricing rule applied to partner prices
 *   data/jewellery/raw-images/<partner>/<folder>/*.jpg|png|webp   optional source photos
 *
 * Outputs
 *   shared/jewellery/catalog.json            public catalogue, Alvora names only
 *   server/data/jewellery-sourcing.json      private partner mapping for internal alerts
 *   client/public/assets/jewellery/<code>/   optimised WebP photos (when raw images exist)
 *   data/jewellery/import-report.txt         pieces still missing photos or prices
 *
 * pieces.json is append-only: a piece seen for the first time gets a generated
 * name, code and slug which are written back, and never regenerated. Edit a
 * name there and rerun `pnpm jewellery:build`; the code and URL stay put
 * unless you also change the slug.
 *
 * The build fails if a partner name or partner design name reaches the
 * public catalogue or an output image filename.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");
const DATA = path.join(ROOT, "data", "jewellery");
const CSV_PATH = path.join(DATA, "launch_shortlist_v1.csv");
const PIECES_PATH = path.join(DATA, "pieces.json");
const PRICING_PATH = path.join(DATA, "pricing.json");
const RAW_IMAGES = path.join(DATA, "raw-images");
const REPORT_PATH = path.join(DATA, "import-report.txt");
const CATALOG_PATH = path.join(ROOT, "shared", "jewellery", "catalog.json");
const SOURCING_PATH = path.join(ROOT, "server", "data", "jewellery-sourcing.json");
const IMAGE_OUT = path.join(ROOT, "client", "public", "assets", "jewellery");

const MAX_IMAGES_PER_PIECE = 8;
const IMAGE_SIZES = [
  { suffix: "", width: 1400 },
  { suffix: "-600", width: 600 },
];

/** Partner identifiers that must never appear in public output. */
const PARTNER_TOKENS = ["junerings", "june rings", "june-rings", "pooja", "poojadiamond", "caratdiamonds", "carat diamonds", "carat-diamonds"];

/** Raw-image folder names per partner key used in the CSV. */
const PARTNER_IMAGE_DIRS = {
  junerings: ["junerings", "junerings-images"],
  pooja: ["poojadiamond", "poojadiamond-images"],
  carat: ["caratdiamonds", "caratdiamonds-images"],
};

/**
 * Alvora name lexicon. Names that collide with any word in a partner title,
 * family or handle are skipped automatically, so a partner design name can
 * never be reused as an Alvora name.
 */
const LEXICON = [
  "Aurel", "Solene", "Vela", "Orla", "Ondine", "Selene", "Talia", "Nerida", "Ilse", "Cyra",
  "Maelis", "Oriel", "Sabine", "Celeste", "Elowen", "Ines", "Livia", "Noor", "Rhea", "Thea",
  "Vesna", "Yara", "Zelie", "Anouk", "Brisa", "Delphine", "Esra", "Faye", "Greer", "Halia",
  "Isolde", "Jora", "Kaia", "Liora", "Mireille", "Nika", "Odile", "Pia", "Romilly", "Saskia",
  "Tove", "Una", "Vivienne", "Xanthe", "Amara", "Beatrix", "Coralie", "Doria", "Elodie", "Fiora",
  "Gisele", "Honora", "Leonie", "Marisol", "Nadia", "Oriane", "Perrine", "Seren", "Tamsin", "Ulla",
  "Verity", "Ada", "Blythe", "Clio", "Dione", "Edda", "Freya", "Galia", "Hesper", "Ione",
  "Jessamy", "Kestrel", "Linnea", "Meline", "Nell", "Odessa", "Philippa", "Rosalind", "Sidonie", "Tessaly",
  "Ursa", "Valen", "Wilhelmina", "Ysolde", "Zinaida", "Aveline", "Bettina", "Cosima", "Damaris", "Eulalie",
  "Florine", "Genevieve", "Hortense", "Ilaria", "Josette", "Katrin", "Lucienne", "Margaux", "Noemi", "Ottilie",
  "Paloma", "Quilla", "Renata", "Solveig", "Tatiana", "Valerie", "Wynne", "Yolande", "Zosia", "Adele",
  "Bianca", "Carys", "Daria", "Emmeline", "Fabienne", "Gaia", "Heloise", "Irene", "Juliane", "Kalina",
  "Lisette", "Maren-Alvora", "Nanette", "Octavia", "Priya", "Rosamund", "Signe", "Tallis", "Viola", "Wilda",
  "Anika", "Brigitte", "Camille", "Dagny", "Estelle-Alvora", "Felicity", "Guinevere", "Hazel", "Imogen", "Johanna",
  "Karina", "Lavinia", "Mathilde", "Ninon", "Orsola", "Paulette", "Rowena", "Sunniva", "Theodora", "Ulrike",
  "Vanya", "Winifred", "Ximena", "Yvaine", "Zerlina", "Alcina", "Bryony", "Calliope", "Desma", "Evadne",
  "Filippa", "Gwendolen", "Hermia", "Idony", "Jolie", "Kerensa", "Lorelle", "Minerva", "Nyssa", "Orabel",
  "Pernille", "Quenby", "Rosel", "Sorrel", "Tamara", "Undine", "Verena", "Willa", "Yseult", "Zenobia",
].filter((name) => !name.includes("-"));

const SHAPE_LABELS = {
  oval: "Oval",
  round: "Round",
  emerald: "Emerald",
  marquise: "Marquise",
  pear: "Pear",
  radiant: "Radiant",
  cushion: "Cushion",
  "elongated-cushion": "Elongated Cushion",
  asscher: "Asscher",
  "old-mine": "Old Mine",
  hexagon: "Hexagon",
  princess: "Princess",
  trillion: "Trillion",
  baguette: "Baguette",
  heart: "Heart",
};

/** Ordered: the first matching style wins. */
const STYLE_RULES = [
  { style: "toi-et-moi", label: "Toi et Moi", match: /toi[- ]et[- ]moi/ },
  { style: "five-stone", label: "Five Stone", match: /five[- ]stone/ },
  { style: "three-stone", label: "Three Stone", match: /three[- ]stone|trilogy/ },
  { style: "eternity", label: "Eternity Band", match: /eternity/ },
  { style: "wrap", label: "Wrap Ring", match: /wrap|bypass|spiral/ },
  { style: "signet", label: "Signet", match: /signet/ },
  { style: "east-west", label: "East-West", match: /east[- ]west|east to west|\bew\b/ },
  { style: "halo", label: "Halo", match: /halo/ },
  { style: "bezel", label: "Bezel", match: /bezel/ },
  { style: "vintage", label: "Heritage", match: /vintage|art deco|filigree|milgrain|antique|engraved|dutch/ },
  { style: "solitaire", label: "Solitaire", match: /solitaire|four[- ]prong|six[- ]prong|claw/ },
];

const STONE_COLOUR_RULES = [
  { colour: "champagne", label: "Champagne", match: /champagne/ },
  { colour: "green", label: "Green", match: /green/ },
  { colour: "pink", label: "Pink", match: /pink/ },
  { colour: "blue", label: "Blue", match: /\bblue\b|azure|sapphire(?!.*yellow)/ },
  { colour: "yellow", label: "Yellow", match: /yellow sapphire|yellow diamond|canary/ },
  { colour: "red", label: "Ruby", match: /ruby/ },
];

const METAL_COLOURS = ["yellow", "white", "rose"];

// ---------------------------------------------------------------------------
// CSV
// ---------------------------------------------------------------------------

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (ch === '"') {
        quoted = false;
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i += 1;
      row.push(field);
      if (row.some((cell) => cell.trim() !== "")) rows.push(row);
      row = [];
      field = "";
    } else {
      field += ch;
    }
  }
  if (field !== "" || row.length) {
    row.push(field);
    if (row.some((cell) => cell.trim() !== "")) rows.push(row);
  }
  const header = rows.shift().map((h) => h.replace(/\\_/g, "_").trim());
  return rows.map((cells) => Object.fromEntries(header.map((h, i) => [h, (cells[i] ?? "").trim()])));
}

// ---------------------------------------------------------------------------
// Derivation helpers
// ---------------------------------------------------------------------------

const slugify = (value) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

function haystack(row) {
  return `${row.title} ${row.family} ${row.handle}`.toLowerCase().replace(/\|+/g, " ");
}

function deriveShape(row) {
  if (row.shape && row.shape !== "other") return row.shape;
  const text = haystack(row);
  for (const shape of ["princess", "trillion", "baguette", "heart", "cushion", "round", "oval", "emerald", "pear", "marquise", "radiant", "asscher", "hexagon"]) {
    if (text.includes(shape)) return shape;
  }
  if (/euro|old[- ]cut/.test(text)) return "round";
  return null;
}

function deriveStyle(row, category) {
  if (category === "earrings") {
    if (/drop/.test(haystack(row))) return { style: "drop", label: "Drop Earrings" };
    if (/halo/.test(haystack(row))) return { style: "halo", label: "Halo Studs" };
    if (/bezel/.test(haystack(row))) return { style: "bezel", label: "Bezel Studs" };
    return { style: "stud", label: "Studs" };
  }
  if (category === "pendant") {
    if (/halo/.test(haystack(row))) return { style: "halo", label: "Halo Pendant" };
    return { style: "solitaire", label: "Pendant" };
  }
  const text = haystack(row);
  for (const rule of STYLE_RULES) {
    if (rule.match.test(text)) return { style: rule.style, label: rule.label };
  }
  return { style: "solitaire", label: "Solitaire" };
}

function deriveStoneColour(row) {
  if (row.colour) {
    const hit = STONE_COLOUR_RULES.find((rule) => rule.colour === row.colour);
    if (hit) return { colour: hit.colour, label: hit.label };
  }
  const text = haystack(row);
  for (const rule of STONE_COLOUR_RULES) {
    if (rule.match.test(text)) return { colour: rule.colour, label: rule.label };
  }
  return { colour: "white", label: null };
}

function deriveKarats(row) {
  const matches = [...row.title.matchAll(/\b(9|10|14|18|22)\s*k\b/gi)].map((m) => `${m[1]}K`);
  const unique = [...new Set(matches)];
  return unique.length ? unique : ["14K", "18K"];
}

function deriveCaratRange(row) {
  const text = row.title.toLowerCase();
  const range = text.match(/(\d+(?:\.\d+)?)\s*(?:to|-|–)\s*(\d+(?:\.\d+)?)\s*(?:ct|carat)/);
  if (range) return [Number(range[1]), Number(range[2])];
  const single = text.match(/(\d+(?:\.\d+)?)\s*(?:ct|carat)/);
  if (single) return [Number(single[1]), Number(single[1])];
  return null;
}

function categoryFor(row) {
  if (row.category === "earrings") return "earrings";
  if (row.category === "pendant") return "pendant";
  const text = haystack(row);
  if (/eternity|wrap|bypass|spiral|stacking|wedding band/.test(text)) return "band";
  return "ring";
}

function isEngagement(row, category, style) {
  if (category !== "ring") return false;
  if (["signet", "wrap", "eternity"].includes(style)) return false;
  return true;
}

function codePrefix(category) {
  return { ring: "R", band: "B", earrings: "E", pendant: "P" }[category];
}

function describe({ category, style, shapeLabel, stoneColourLabel }) {
  const stone = `${stoneColourLabel ? `${stoneColourLabel.toLowerCase()} ` : ""}${shapeLabel ? `${shapeLabel.toLowerCase()} ` : ""}lab-grown diamond`;
  const lines = {
    "toi-et-moi": `Two stones set side by side: a ${stone} paired with a companion cut, each held in its own claws.`,
    "five-stone": `A ${stone} flanked by four graduated stones, set low across the finger.`,
    "three-stone": `A ${stone} framed by two side stones, cut and matched on our bench in Surat.`,
    eternity: `A continuous line of ${stone}s, matched for colour and size around the band.`,
    wrap: `An open, sculptural band set with ${stone}s that curve around the finger.`,
    signet: `A signet profile with a ${stone} set flush into the face.`,
    "east-west": `A ${stone} turned on its side and held in a slim east-west setting.`,
    halo: `A ${stone} lifted by a fine halo of pavé that catches light from every angle.`,
    bezel: `A ${stone} wrapped in a clean, protective bezel of polished gold.`,
    vintage: `A ${stone} in a heritage setting with hand-finished detailing along the band.`,
    solitaire: `A single ${stone}, held high in a precise claw setting on a slender band.`,
    stud: `A pair of ${stone}s in secure claw settings, matched stone for stone.`,
    drop: `${stone.charAt(0).toUpperCase() + stone.slice(1)} drops that move gently with the wearer.`,
  };
  if (category === "pendant") return `A ${stone} suspended on a fine gold chain in a clean, lifted setting.`;
  return lines[style] ?? `A ${stone} set by hand in solid gold.`;
}

function round(value, step) {
  return Math.round(value / step) * step;
}

// ---------------------------------------------------------------------------
// Images
// ---------------------------------------------------------------------------

function findImageFolder(partner, folderName) {
  if (!folderName) return null;
  for (const dir of PARTNER_IMAGE_DIRS[partner] ?? []) {
    const candidate = path.join(RAW_IMAGES, dir, folderName);
    if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) return candidate;
  }
  return null;
}

function listSourceImages(folder) {
  return fs
    .readdirSync(folder)
    .filter((file) => /\.(jpe?g|png|webp)$/i.test(file))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .slice(0, MAX_IMAGES_PER_PIECE)
    .map((file) => path.join(folder, file));
}

async function writeImages(code, sources) {
  // Ivory backdrop + Alvora watermark; sharp drops source metadata on output.
  const { brandImage } = await import("./brand-image.mjs");
  const dir = path.join(IMAGE_OUT, code.toLowerCase());
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const images = [];
  for (const [index, source] of sources.entries()) {
    const base = String(index + 1).padStart(2, "0");
    for (const size of IMAGE_SIZES) {
      await (await brandImage(source, size.width)).toFile(path.join(dir, `${base}${size.suffix}.webp`));
    }
    images.push({ src: `/assets/jewellery/${code.toLowerCase()}/${base}.webp`, thumb: `/assets/jewellery/${code.toLowerCase()}/${base}-600.webp`, width: IMAGE_SIZES[0].width, height: IMAGE_SIZES[0].width });
  }
  return images;
}

function existingImages(code) {
  const dir = path.join(IMAGE_OUT, code.toLowerCase());
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => /^\d+\.webp$/.test(file))
    .sort()
    .map((file) => {
      const base = file.replace(".webp", "");
      return { src: `/assets/jewellery/${code.toLowerCase()}/${file}`, thumb: `/assets/jewellery/${code.toLowerCase()}/${base}-600.webp`, width: IMAGE_SIZES[0].width, height: IMAGE_SIZES[0].width };
    });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const rows = parseCsv(fs.readFileSync(CSV_PATH, "utf8"));
  const pieces = fs.existsSync(PIECES_PATH) ? JSON.parse(fs.readFileSync(PIECES_PATH, "utf8")) : {};
  const pricing = JSON.parse(fs.readFileSync(PRICING_PATH, "utf8"));
  const withImages = process.argv.includes("--images");

  // Every word used by a partner is off-limits as an Alvora name.
  const banned = new Set();
  for (const row of rows) {
    for (const word of `${row.title} ${row.family} ${row.handle}`.toLowerCase().split(/[^a-z]+/)) {
      if (word.length > 2) banned.add(word);
    }
  }
  const usedNames = new Set(Object.values(pieces).map((piece) => piece.collectionName));
  const lexicon = LEXICON.filter((name) => !banned.has(name.toLowerCase()) && !usedNames.has(name));
  const familyNames = new Map(Object.values(pieces).map((piece) => [piece.familyKey, piece.collectionName]));
  const usedCodes = new Set(Object.values(pieces).map((piece) => piece.code));
  const usedSlugs = new Set(Object.values(pieces).map((piece) => piece.slug));
  const usedDisplayNames = new Set(Object.values(pieces).map((piece) => piece.name));
  const nextCodeNumber = { R: 1, B: 1, E: 1, P: 1 };
  for (const code of usedCodes) {
    const [, prefix, num] = code.match(/^ALV-([A-Z])-(\d+)$/) ?? [];
    if (prefix) nextCodeNumber[prefix] = Math.max(nextCodeNumber[prefix], Number(num) + 1);
  }

  // Stable order for first-time assignment: strongest pieces first.
  const ordered = [...rows].sort((a, b) => a.launch.localeCompare(b.launch) || Number(b.score) - Number(a.score) || a.handle.localeCompare(b.handle));

  const catalog = [];
  const sourcing = {};
  const missingImages = [];
  const missingPrices = [];

  for (const row of ordered) {
    const key = `${row.partner}:${row.handle}`;
    const category = categoryFor(row);
    const shape = deriveShape(row);
    const shapeLabel = shape ? SHAPE_LABELS[shape] ?? null : null;
    const { style, label: styleLabel } = deriveStyle(row, category);
    const { colour: stoneColour, label: stoneColourLabel } = deriveStoneColour(row);

    let piece = pieces[key];
    if (!piece) {
      const familyKey = `${row.partner}:${row.family || row.handle}`;
      let collectionName = familyNames.get(familyKey);
      if (!collectionName) {
        collectionName = lexicon.shift();
        if (!collectionName) throw new Error("Name lexicon exhausted; add more names to LEXICON.");
        familyNames.set(familyKey, collectionName);
      }
      const nameFor = (collection) => [collection, stoneColourLabel, shapeLabel, styleLabel].filter(Boolean).join(" ");
      // Two partner pieces can share a family and a shape; give the second its own name.
      while (usedDisplayNames.has(nameFor(collectionName))) {
        collectionName = lexicon.shift();
        if (!collectionName) throw new Error("Name lexicon exhausted; add more names to LEXICON.");
      }
      const name = nameFor(collectionName);
      usedDisplayNames.add(name);
      let slug = slugify(name);
      for (let n = 2; usedSlugs.has(slug); n += 1) slug = `${slugify(name)}-${n}`;
      usedSlugs.add(slug);
      const prefix = codePrefix(category);
      const code = `ALV-${prefix}-${String(nextCodeNumber[prefix]).padStart(4, "0")}`;
      nextCodeNumber[prefix] += 1;
      piece = { code, slug, name, collectionName, familyKey, imageFolder: row.handle, priceUsd: null, hidden: false, notes: "" };
      pieces[key] = piece;
    }

    if (piece.hidden) continue;

    const partnerPrice = row.price_usd ? Number(row.price_usd) : null;
    const retail = piece.priceUsd ?? (partnerPrice != null ? round(partnerPrice * pricing.retailMultiplier, pricing.roundTo) : null);
    if (retail == null) missingPrices.push(`${piece.code}  ${piece.name}`);

    let images = [];
    const folder = findImageFolder(row.partner, piece.imageFolder);
    if (withImages && folder) {
      images = await writeImages(piece.code, listSourceImages(folder));
    } else {
      images = existingImages(piece.code);
    }
    if (!images.length) missingImages.push(`${piece.code}  ${piece.name}  (looked for folder: ${row.partner}/${piece.imageFolder})`);

    const collections = new Set();
    if (isEngagement(row, category, style)) collections.add("engagement-rings");
    if (category === "ring") collections.add("rings");
    if (category === "band") collections.add("wedding-bands");
    if (category === "earrings") collections.add("earrings");
    if (category === "pendant") collections.add("pendants");
    if (/antique|old[- ]mine|euro|rose[- ]cut|portuguese|old[- ]cut/.test(haystack(row))) collections.add("antique-cuts");
    if (stoneColour !== "white") collections.add("coloured-stones");

    catalog.push({
      code: piece.code,
      slug: piece.slug,
      name: piece.name,
      collectionName: piece.collectionName,
      wave: row.launch.endsWith("A") ? "A" : "B",
      category,
      collections: [...collections],
      shape,
      shapeLabel,
      style,
      styleLabel,
      stoneColour,
      stoneColourLabel,
      karats: deriveKarats(row),
      metalColours: METAL_COLOURS,
      caratRange: deriveCaratRange(row),
      fromPriceUsd: retail,
      description: piece.description ?? describe({ category, style, shapeLabel, stoneColourLabel }),
      tags: piece.tags ?? [],
      featuredScore: Number(row.score) || 0,
      addedOn: row.created || null,
      images,
    });

    sourcing[piece.code] = { partner: row.partner, handle: row.handle, partnerTitle: row.title, partnerPriceUsd: partnerPrice };
  }

  catalog.sort((a, b) => a.wave.localeCompare(b.wave) || b.featuredScore - a.featuredScore || a.code.localeCompare(b.code));

  // Guard: nothing public may carry a partner identity or partner design name.
  const publicText = JSON.stringify(catalog).toLowerCase();
  for (const token of PARTNER_TOKENS) {
    if (publicText.includes(token)) throw new Error(`Partner token "${token}" found in public catalogue.`);
  }
  for (const item of catalog) {
    const words = `${item.name} ${item.slug}`.toLowerCase().split(/[^a-z]+/);
    const leaked = words.filter((word) => word.length > 3 && banned.has(word) && !GENERIC_WORDS.has(word));
    if (leaked.length) throw new Error(`${item.code} "${item.name}" reuses partner wording: ${leaked.join(", ")}`);
  }

  fs.mkdirSync(path.dirname(CATALOG_PATH), { recursive: true });
  fs.writeFileSync(CATALOG_PATH, `${JSON.stringify(catalog, null, 2)}\n`);
  fs.writeFileSync(SOURCING_PATH, `${JSON.stringify(sourcing, null, 2)}\n`);
  fs.writeFileSync(PIECES_PATH, `${JSON.stringify(pieces, null, 2)}\n`);
  syncPublicRoutes(catalog);

  const report = [
    `Alvora jewellery import report — ${new Date().toISOString()}`,
    `Pieces in catalogue: ${catalog.length} (wave A: ${catalog.filter((c) => c.wave === "A").length}, wave B: ${catalog.filter((c) => c.wave === "B").length})`,
    "",
    `Missing photos (${missingImages.length}):`,
    ...missingImages.map((line) => `  ${line}`),
    "",
    `Missing prices — shown as "Price on request" (${missingPrices.length}):`,
    ...missingPrices.map((line) => `  ${line}`),
    "",
  ].join("\n");
  fs.writeFileSync(REPORT_PATH, report);

  console.log(`Catalogue: ${catalog.length} pieces → ${path.relative(ROOT, CATALOG_PATH)}`);
  console.log(`Missing photos: ${missingImages.length}, missing prices: ${missingPrices.length}. See ${path.relative(ROOT, REPORT_PATH)}`);
  if (!withImages) console.log("Photos were not processed. Add --images once data/jewellery/raw-images/ is populated.");
}

/**
 * Keep scripts/publicRoutes.json (sitemap + prerender list) in step with the
 * public catalogue: live collections, shape pages and every public piece.
 * Must match PUBLIC_WAVES in shared/jewellery/catalog.ts.
 */
const PUBLIC_WAVES = ["A"];
const COLLECTION_ROUTES = [
  ["/jewellery", null],
  ["/engagement-rings", "engagement-rings"],
  ["/earrings", "earrings"],
  ["/pendants", "pendants"],
  ["/wedding-bands", "wedding-bands"],
  ["/jewellery/antique-cuts", "antique-cuts"],
  ["/jewellery/coloured-stones", "coloured-stones"],
];
const JEWELLERY_ROUTE = /^\/(jewellery|engagement-rings|rings|earrings|pendants|wedding-bands|book-a-consultation)(\/|$)/;

function syncPublicRoutes(catalog) {
  const routesPath = path.join(ROOT, "scripts", "publicRoutes.json");
  const existing = JSON.parse(fs.readFileSync(routesPath, "utf8")).filter((route) => !JEWELLERY_ROUTE.test(route));
  const live = catalog.filter((piece) => PUBLIC_WAVES.includes(piece.wave));
  const collections = COLLECTION_ROUTES.filter(([, key]) => live.some((piece) => (key ? piece.collections.includes(key) : true))).map(([route]) => route);
  const shapes = [...new Set(live.filter((piece) => piece.collections.includes("engagement-rings") && piece.shape).map((piece) => piece.shape))]
    .filter((shape) => Object.keys(SHAPE_LABELS).includes(shape))
    .map((shape) => `/engagement-rings/shape/${shape}`);
  const jewellery = [...collections, ...shapes, "/book-a-consultation", ...live.map((piece) => `/jewellery/${piece.slug}`)];
  const at = existing.indexOf("/trade") + 1 || 1;
  const next = [...existing.slice(0, at), ...jewellery, ...existing.slice(at)];
  fs.writeFileSync(routesPath, `${JSON.stringify(next, null, 2)}\n`);
}

/** Descriptive jewellery words partners also use; allowed in Alvora names. */
const GENERIC_WORDS = new Set([
  "oval", "round", "emerald", "marquise", "pear", "radiant", "cushion", "elongated", "asscher", "old", "mine", "hexagon",
  "princess", "trillion", "baguette", "heart", "three", "stone", "five", "east", "west", "halo", "bezel", "solitaire",
  "signet", "eternity", "band", "wrap", "ring", "studs", "stud", "drop", "earrings", "pendant", "heritage", "champagne",
  "green", "pink", "blue", "yellow", "ruby", "toi", "moi", "dutch",
]);

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
