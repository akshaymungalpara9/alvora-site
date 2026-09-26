/**
 * Builds the Pinterest bulk-upload CSV and the Instagram links file for
 * workstream 1D. Reads the public catalogue JSON (shown pieces only, matching
 * isShown in shared/jewellery/catalog.ts) and writes:
 *   data/social/pinterest-bulk.csv  - Pinterest bulk editor columns
 *   data/social/instagram-links.md  - one UTM-tagged link per collection
 * Run: pnpm social:pinterest
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const ORIGIN = "https://www.alvoradiamonds.com";
const CAMPAIGN = "p1-2026-10";

const pieces = JSON.parse(readFileSync(new URL("../../shared/jewellery/catalog.json", import.meta.url), "utf8"));
// Mirror isShown(): a piece shows only when it is live and has photos.
const shown = pieces.filter((p) => p.live && p.images && p.images.length > 0);

const CATEGORY_NOUN = { ring: "ring", band: "wedding band", earrings: "earrings", pendant: "pendant" };
const nounFor = (p) => (p.category === "ring" && p.collections.includes("engagement-rings") ? "engagement ring" : CATEGORY_NOUN[p.category] ?? p.category);

// Boards: one per engagement-ring shape with 5 or more shown pieces, coloured
// stones on their own board, everything else on the fallback boards.
const shapeCounts = {};
for (const p of shown.filter((p) => p.collections.includes("engagement-rings") && p.stoneColour === "white")) {
  shapeCounts[p.shape] = (shapeCounts[p.shape] ?? 0) + 1;
}
const shapeName = (p) => p.shapeLabel ?? (p.shape ? p.shape.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : null);
function boardFor(p) {
  if (p.collections.includes("engagement-rings")) {
    if (p.stoneColour !== "white") return "Coloured stone rings";
    return (shapeCounts[p.shape] ?? 0) >= 5 && shapeName(p) ? `${shapeName(p)} engagement rings` : "Lab-grown engagement rings";
  }
  if (p.category === "ring") return "Lab-grown diamond rings";
  if (p.category === "earrings") return "Diamond earrings";
  if (p.category === "pendant") return "Diamond pendants";
  if (p.category === "band") return "Lab-grown wedding bands";
  return "Lab-grown diamond jewellery";
}

const csvCell = (value) => (/[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);

const utm = `utm_source=pinterest&utm_medium=social&utm_campaign=${CAMPAIGN}`;
const rows = shown.map((p) => {
  const title = `${p.name}: ${shapeName(p) ? `${shapeName(p)} ` : ""}lab-grown diamond ${nounFor(p)}`.slice(0, 100);
  const description = `${p.description} Centre stone 0.5 to 6 ct, VS1 clarity, Excellent polish and symmetry, lab-grown. Made to order in silver, 14K or 18K gold, or platinum.`.slice(0, 500);
  const keywords = [shapeName(p) && `${shapeName(p).toLowerCase()} ring`, "lab grown diamond", nounFor(p), p.styleLabel && `${p.styleLabel.toLowerCase()} setting`, "made to order"].filter(Boolean).join(", ");
  return [
    title,
    `${ORIGIN}/assets/social/pieces/${p.code.toLowerCase()}.jpg`,
    boardFor(p),
    description,
    `${ORIGIN}/jewellery/${p.slug}?${utm}`,
    keywords,
  ];
});

mkdirSync(new URL("../../data/social", import.meta.url), { recursive: true });
const header = ["Title", "Media URL", "Pinterest board", "Description", "Link", "Keywords"];
const csv = [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\n") + "\n";
writeFileSync(new URL("../../data/social/pinterest-bulk.csv", import.meta.url), csv);

const igUtm = `utm_source=instagram&utm_medium=social&utm_campaign=${CAMPAIGN}`;
const collections = [
  ["Engagement rings", "/engagement-rings"],
  ["All rings", "/rings"],
  ["Earrings", "/earrings"],
  ["Necklaces and pendants", "/necklaces"],
  ["Wedding bands", "/wedding-bands"],
  ["Antique cuts", "/jewellery/antique-cuts"],
  ["Coloured stones", "/jewellery/coloured-stones"],
  ["Marquise engagement rings", "/engagement-rings/shape/marquise"],
  ["Book a consultation", "/book-a-consultation"],
];
const md = [
  "# Instagram links (bio and stories)",
  "",
  `One UTM-tagged link per collection. Campaign: ${CAMPAIGN}.`,
  "",
  ...collections.map(([label, path]) => `- ${label}: ${ORIGIN}${path}?${igUtm}`),
  "",
].join("\n");
writeFileSync(new URL("../../data/social/instagram-links.md", import.meta.url), md);

console.log(`pinterest-bulk.csv: ${rows.length} pins across ${new Set(rows.map((r) => r[2])).size} boards`);
console.log(`instagram-links.md: ${collections.length} links`);
