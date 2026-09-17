/**
 * Build-time llms-full.txt generator.
 *
 * Reads the live availability catalogue via the same DB path the public tRPC
 * endpoint uses, honours the same trusted-certificate rule, and emits one flat
 * text document with every currently-active certified stone:
 *
 *   stock | collection | shape | carat | colour | clarity | cut | polish |
 *   symmetry | fluorescence | measurements | lab | report | certificate URL
 *
 * No prices, matching the /availability no-price contract.
 *
 * The existing client/public/llms.txt page index is preserved at the top;
 * this script only replaces the stones section between the "Live stone feed"
 * BEGIN/END markers.
 *
 * Runs against .env.railway.txt DATABASE_URL locally, or process.env at CI.
 * If the DB is unreachable the script exits 0 without touching the output file
 * (the previous snapshot remains). This is a best-effort build enhancement,
 * matching prerender.mjs's philosophy.
 */
import { readFileSync, writeFileSync, existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

// Load DATABASE_URL from .env.railway.txt if not already in process.env.
const envPath = path.resolve(repoRoot, ".env.railway.txt");
if (existsSync(envPath)) {
  const envSource = readFileSync(envPath, "utf-8");
  for (const line of envSource.split("\n")) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  }
}

if (!process.env.DATABASE_URL) {
  console.log("[build-llms-full] DATABASE_URL not set — leaving llms-full.txt unchanged.");
  process.exit(0);
}

let rows;
try {
  const drizzleModule = await import("drizzle-orm");
  const { and, eq, like, or } = drizzleModule;
  const { drizzle } = await import("drizzle-orm/mysql2");
  const { availabilityStones, availabilityImports } = await import("../drizzle/schema.ts");

  const db = drizzle(process.env.DATABASE_URL);

  const activeImports = await db
    .select({ id: availabilityImports.id, collection: availabilityImports.collection })
    .from(availabilityImports)
    .where(eq(availabilityImports.status, "active"));

  if (!activeImports.length) {
    console.log("[build-llms-full] No active imports found; leaving llms-full.txt unchanged.");
    process.exit(0);
  }
  const importIds = activeImports.map((row) => row.id);

  // Mirror the trustedCertificateConditions from server/db.ts:
  //   ((lab=IGI AND cert URL contains igi.org AND URL contains reportNumber)
  //    OR (lab=GIA AND cert URL contains gia.edu AND URL contains reportNumber))
  const trustedIgi = and(
    eq(availabilityStones.lab, "IGI"),
    like(availabilityStones.verifyUrl, "%igi.org%"),
  );
  const trustedGia = and(
    eq(availabilityStones.lab, "GIA"),
    like(availabilityStones.verifyUrl, "%gia.edu%"),
  );

  rows = await db
    .select()
    .from(availabilityStones)
    .where(and(
      or(...importIds.map((id) => eq(availabilityStones.importId, id))),
      eq(availabilityStones.availability, "Available"),
      or(trustedIgi, trustedGia),
    ));
  // Server-side filter for reportNumber-in-URL happens in the app; do a
  // conservative match here too so this feed can't include a mismatched pair.
  rows = rows.filter((row) => row.reportNumber && row.verifyUrl && String(row.verifyUrl).includes(String(row.reportNumber)));
} catch (error) {
  console.error("[build-llms-full] DB query failed:", error?.message ?? error);
  process.exit(0);
}

const collectionByImportId = new Map();
{
  const { drizzle } = await import("drizzle-orm/mysql2");
  const { eq } = await import("drizzle-orm");
  const { availabilityImports } = await import("../drizzle/schema.ts");
  const db = drizzle(process.env.DATABASE_URL);
  const imports = await db.select().from(availabilityImports).where(eq(availabilityImports.status, "active"));
  for (const imp of imports) collectionByImportId.set(imp.id, imp.collection);
}

const humanCollection = (imp) => {
  if (imp === "statement") return "Statement";
  return null; // core rows use the category column
};

const formatCarat = (carat) => {
  if (carat == null) return "";
  const num = typeof carat === "string" ? parseFloat(carat) : carat;
  return Number.isFinite(num) ? `${num.toFixed(num % 1 === 0 ? 2 : 2)} ct` : "";
};

const stoneLine = (row) => {
  const collection = collectionByImportId.get(row.importId) === "statement" ? "Statement" : (row.category ?? "Core");
  return [
    row.stockNumber,
    collection,
    row.shape ?? "",
    formatCarat(row.carat),
    row.color ?? "",
    row.clarity ?? "",
    row.cut ?? "",
    row.polish ?? "",
    row.symmetry ?? "",
    row.fluorescence ?? "",
    row.measurements ?? "",
    row.lab ?? "",
    row.reportNumber ?? "",
    row.verifyUrl ?? "",
  ].map((cell) => String(cell).replace(/\s+/g, " ").trim()).join(" | ");
};

const HEADER = "Stock | Collection | Shape | Carat | Colour | Clarity | Cut | Polish | Symmetry | Fluorescence | Measurements | Lab | Report | Certificate URL";
const BEGIN_MARKER = "# BEGIN live stone feed";
const END_MARKER = "# END live stone feed";
const generatedAt = new Date().toISOString().split("T")[0];

const stonesBlock = [
  BEGIN_MARKER,
  `# Regenerated at build time: ${generatedAt}`,
  `# Total certified stones: ${rows.length}`,
  `# No prices, matching the /availability no-price contract.`,
  "",
  HEADER,
  ...rows.map(stoneLine),
  "",
  END_MARKER,
].join("\n");

// Preserve the existing llms.txt page index; the full feed lives in llms-full.txt.
const llmsPath = path.resolve(repoRoot, "client/public/llms.txt");
const llmsHeader = existsSync(llmsPath) ? readFileSync(llmsPath, "utf-8") : "";

const output = `${llmsHeader.trimEnd()}\n\n${stonesBlock}\n`;

const outPath = path.resolve(repoRoot, "client/public/llms-full.txt");
writeFileSync(outPath, output, "utf-8");
const finalBytes = statSync(outPath).size;
const finalKb = (finalBytes / 1024).toFixed(1);
console.log(`[build-llms-full] Wrote ${outPath}`);
console.log(`[build-llms-full] Rows: ${rows.length} | File size: ${finalBytes} bytes (${finalKb} KB)`);

if (finalBytes > 2 * 1024 * 1024) {
  console.warn(`[build-llms-full] WARNING: file exceeds 2MB — consider chunking or truncation strategy.`);
}

process.exit(0);
