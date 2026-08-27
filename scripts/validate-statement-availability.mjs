import { readFile } from "node:fs/promises";
import { validateStatementAvailabilityImportCsv } from "../server/statementAvailabilityImport.ts";

const filename = process.argv[2];
if (!filename) throw new Error("Usage: pnpm exec tsx scripts/validate-statement-availability.mjs <statement-csv>");

const result = validateStatementAvailabilityImportCsv(await readFile(filename, "utf8"));
const summary = {
  valid: result.valid,
  rowCount: result.rowCount,
  whiteRowCount: result.records.filter((record) => record.category === "White").length,
  fancyRowCount: result.records.filter((record) => record.category === "Fancy Colour").length,
  suppliedCertificateUrls: result.records.filter((record) => Boolean(record.certPdfUrl)).length,
  suppliedVideoUrls: result.records.filter((record) => Boolean(record.videoUrl)).length,
  suppliedImageUrls: result.records.filter((record) => Boolean(record.imageUrl)).length,
  rejections: result.rejections,
};
console.log(JSON.stringify(summary, null, 2));
if (!result.valid) process.exitCode = 1;
