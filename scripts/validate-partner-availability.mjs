import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

export const requiredHeaders = ["stock_no", "category", "colour", "shape", "carat", "carat_band", "clarity", "cut", "polish", "symmetry", "measurements", "depth_pct", "table_pct", "ratio", "lab", "cert_no", "verify_url", "video_url"];

export function parseCsv(source) {
  const rows = []; let row = []; let value = ""; let quoted = false;
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (quoted) { if (char === '"' && source[index + 1] === '"') { value += '"'; index += 1; } else if (char === '"') quoted = false; else value += char; continue; }
    if (char === '"') quoted = true;
    else if (char === ",") { row.push(value.trim()); value = ""; }
    else if (char === "\n") { row.push(value.trim()); rows.push(row); row = []; value = ""; }
    else if (char !== "\r") value += char;
  }
  if (quoted) throw new Error("CSV contains an unterminated quoted value.");
  if (value.length || row.length) { row.push(value.trim()); rows.push(row); }
  return rows.filter((entry) => entry.some(Boolean));
}

const httpUrl = (value) => { try { return ["http:", "https:"].includes(new URL(value).protocol); } catch { return false; } };
const numeric = (value) => value === "" || Number.isFinite(Number(value));

export function validatePartnerAvailabilityCsv(source) {
  const issues = [];
  if (source.includes("\uFFFD")) issues.push("File does not appear to be valid UTF-8.");
  let rows;
  try { rows = parseCsv(source.replace(/^\uFEFF/, "")); } catch (error) { return { valid: false, rowCount: 0, issues: [error instanceof Error ? error.message : "CSV could not be parsed."], categoryCounts: {} }; }
  if (!rows.length) return { valid: false, rowCount: 0, issues: ["CSV is empty."], categoryCounts: {} };
  const [headers, ...dataRows] = rows;
  if (headers.length !== requiredHeaders.length || headers.some((header, index) => header !== requiredHeaders[index])) issues.push(`Header must exactly match: ${requiredHeaders.join(",")}`);
  if (!dataRows.length) issues.push("CSV contains no stone rows.");
  if (issues.length) return { valid: false, rowCount: dataRows.length, issues, categoryCounts: {} };
  const seenStockNumbers = new Set();
  const categoryCounts = { White: 0, "Fancy Colour": 0 };
  dataRows.forEach((row, rowIndex) => {
    const line = rowIndex + 2;
    const record = Object.fromEntries(requiredHeaders.map((header, index) => [header, row[index]?.trim() || ""]));
    const stockNo = record.stock_no || `(row-${line})`;
    const rowIssues = [];
    if (row.length !== requiredHeaders.length) rowIssues.push(`expected ${requiredHeaders.length} columns but found ${row.length}`);
    if (!record.stock_no) rowIssues.push("missing stock_no"); else if (seenStockNumbers.has(record.stock_no)) rowIssues.push("duplicate stock_no");
    if (!["White", "Fancy Colour"].includes(record.category)) rowIssues.push("category must be White or Fancy Colour");
    for (const field of ["colour", "shape", "carat_band", "clarity", "cert_no"]) if (!record[field]) rowIssues.push(`missing ${field}`);
    if (!Number.isFinite(Number(record.carat)) || Number(record.carat) <= 0) rowIssues.push("carat must be a positive number");
    if (!httpUrl(record.verify_url)) rowIssues.push("verify_url must be an http or https URL");
    if (record.video_url && !httpUrl(record.video_url)) rowIssues.push("video_url must be an http or https URL when provided");
    for (const field of ["depth_pct", "table_pct", "ratio"]) if (!numeric(record[field])) rowIssues.push(`${field} must be numeric when provided`);
    if (rowIssues.length) issues.push(`Row ${line} (${stockNo}): ${rowIssues.join("; ")}.`);
    else { seenStockNumbers.add(record.stock_no); categoryCounts[record.category] += 1; }
  });
  return { valid: issues.length === 0, rowCount: dataRows.length, issues, categoryCounts };
}

export function runPreflight(path) {
  const result = validatePartnerAvailabilityCsv(readFileSync(path, "utf8"));
  console.log(`${result.valid ? "PASS" : "BLOCKED"}: checked ${result.rowCount} row${result.rowCount === 1 ? "" : "s"}.`);
  console.log(`- Fancy Colour: ${result.categoryCounts["Fancy Colour"] ?? 0}; White: ${result.categoryCounts.White ?? 0}.`);
  if (result.issues.length) console.log(result.issues.map((issue) => `- REJECT: ${issue}`).join("\n"));
  console.log("This preflight does not import data, activate a catalog snapshot, enable buyer early access, calculate prices, or create buyer collateral.");
  return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const inputPath = process.argv[2];
  if (!inputPath) { console.error("Usage: node scripts/validate-partner-availability.mjs /absolute/path/to/current_production.csv"); process.exitCode = 64; }
  else if (!runPreflight(inputPath).valid) process.exitCode = 1;
}
