import { readFile } from "node:fs/promises";
import { createStatementAvailabilityImport } from "../server/db.ts";
import { validateStatementAvailabilityImportCsv } from "../server/statementAvailabilityImport.ts";

const [filename, importedByUserId] = process.argv.slice(2);
if (!filename || !importedByUserId) throw new Error("Usage: pnpm exec tsx scripts/activate-statement-catalog.mjs <statement-csv> <admin-user-id>");

const result = validateStatementAvailabilityImportCsv(await readFile(filename, "utf8"));
if (!result.valid) throw new Error(`STATEMENT catalog was not activated: ${JSON.stringify(result.rejections)}`);

const imported = await createStatementAvailabilityImport({
  sourceFilename: filename.split("/").at(-1) ?? "statement.csv",
  importedByUserId: Number(importedByUserId),
  records: result.records,
});

console.log(`Activated STATEMENT import ${imported?.id}: ${result.rowCount} rows (${result.records.filter((record) => record.category === "Fancy Colour").length} Fancy Colour, ${result.records.filter((record) => record.category === "White").length} White).`);
