/**
 * One-shot script: query the live availability summary endpoint (via the
 * same DB path the public tRPC endpoint uses) and print current totals so we
 * can update the crawlable-stone baseline number.
 *
 * Read-only. Uses getPublicAvailabilitySummary which is a pure db.select.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load DATABASE_URL from .env.railway.txt so we don't need shell exports.
const envPath = path.resolve(__dirname, "..", ".env.railway.txt");
const envSource = readFileSync(envPath, "utf-8");
for (const line of envSource.split("\n")) {
  const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
}

const { getPublicAvailabilitySummary } = await import("../server/db.ts");

const core = await getPublicAvailabilitySummary({ collection: "core" });
const statement = await getPublicAvailabilitySummary({ collection: "statement" });

console.log("== Core collection ==");
console.log("total:", core.total);
console.log("byCategory:", JSON.stringify(core.byCategory, null, 2));

console.log("\n== Statement collection ==");
console.log("total:", statement.total);
console.log("byStatementType:", JSON.stringify(statement.byStatementType, null, 2));

console.log("\n== Combined public reachable ==");
console.log("core + statement:", core.total + statement.total);

console.log("\n== Colour distribution (top 20 in core) ==");
console.log(JSON.stringify(core.byColour.sort((a, b) => b.count - a.count).slice(0, 20), null, 2));

console.log("\n== Carat band distribution (core) ==");
console.log(JSON.stringify(core.byCaratBand, null, 2));

console.log("\n== Shape distribution (core) ==");
console.log(JSON.stringify(core.byShape.sort((a, b) => b.count - a.count), null, 2));

process.exit(0);
