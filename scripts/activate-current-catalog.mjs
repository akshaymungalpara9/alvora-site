import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { validateAvailabilityImportCsv } from "../server/availabilityImport.ts";
import { createAvailabilityImport } from "../server/db.ts";

export async function activateCurrentCatalog({ path, adminUserId }) {
  const source = readFileSync(path, "utf8");
  const result = validateAvailabilityImportCsv(source);
  if (!result.valid) {
    const detail = result.rejections.map((row) => `line ${row.row} (${row.sku}): ${row.reason}`).join("\n");
    throw new Error(`Catalog activation blocked by validation:\n${detail}`);
  }
  const imported = await createAvailabilityImport({
    sourceFilename: path.split("/").pop() || "current-production.csv",
    importedByUserId: adminUserId,
    records: result.records,
  });
  return { imported, rowCount: result.rowCount, whiteRowCount: result.records.filter((row) => row.category === "White").length, fancyRowCount: result.records.filter((row) => row.category === "Fancy Colour").length };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [path, userId] = process.argv.slice(2);
  if (!path || !userId) {
    console.error("Usage: pnpm exec tsx scripts/activate-current-catalog.mjs /absolute/path/to/current_production.csv <admin_user_id>");
    process.exitCode = 64;
  } else {
    activateCurrentCatalog({ path, adminUserId: Number(userId) })
      .then((result) => console.log(`Activated import ${result.imported?.id}: ${result.rowCount} rows (${result.fancyRowCount} Fancy Colour, ${result.whiteRowCount} White).`))
      .catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
  }
}
