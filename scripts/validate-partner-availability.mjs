import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

export const requiredHeaders = [
  "Stock #", "Report #", "Shape", "Weight", "Color", "Clarity", "Cut", "Polish", "Lab", "Final Price", "Location", "Availability",
];

const allowedShapes = new Set(["ROUND", "OVAL", "PEAR", "EMERALD", "CUSHION", "RADIANT", "PRINCESS", "MARQUISE"]);
const allowedFinish = new Set(["EX", "VG", "GD", "ID"]);
const allowedAvailability = new Set(["Available", "Unavailable"]);
const allowedClarity = new Set(["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "I1"]);

export function parseCsv(source) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (quoted) {
      if (char === '"' && source[index + 1] === '"') { value += '"'; index += 1; }
      else if (char === '"') quoted = false;
      else value += char;
      continue;
    }
    if (char === '"') { quoted = true; continue; }
    if (char === ",") { row.push(value.trim()); value = ""; continue; }
    if (char === "\n") { row.push(value.trim()); rows.push(row); row = []; value = ""; continue; }
    if (char !== "\r") value += char;
  }
  if (quoted) throw new Error("CSV contains an unterminated quoted value.");
  if (value.length || row.length) { row.push(value.trim()); rows.push(row); }
  return rows.filter((entry) => entry.some(Boolean));
}

export function validatePartnerAvailabilityCsv(source) {
  const issues = [];
  if (source.includes("\uFFFD")) issues.push("File does not appear to be valid UTF-8.");
  let rows;
  try { rows = parseCsv(source.replace(/^\uFEFF/, "")); }
  catch (error) { return { valid: false, rowCount: 0, issues: [error instanceof Error ? error.message : "CSV could not be parsed."] }; }
  if (!rows.length) return { valid: false, rowCount: 0, issues: ["CSV is empty."] };

  const [headers, ...dataRows] = rows;
  if (headers.length !== requiredHeaders.length || headers.some((header, index) => header !== requiredHeaders[index])) {
    issues.push(`Header must exactly match: ${requiredHeaders.join(",")}`);
  }
  if (!dataRows.length) issues.push("CSV contains no stone rows.");
  if (issues.length) return { valid: false, rowCount: dataRows.length, issues };

  const stockNumbers = new Set();
  dataRows.forEach((row, rowIndex) => {
    const line = rowIndex + 2;
    if (row.length !== requiredHeaders.length) { issues.push(`Row ${line}: expected ${requiredHeaders.length} columns but found ${row.length}.`); return; }
    const record = Object.fromEntries(requiredHeaders.map((header, index) => [header, row[index].trim()]));
    const required = requiredHeaders.filter((header) => !record[header]);
    if (required.length) issues.push(`Row ${line}: missing required value(s): ${required.join(", ")}.`);
    if (stockNumbers.has(record["Stock #"])) issues.push(`Row ${line}: duplicate Stock # "${record["Stock #"]}".`);
    stockNumbers.add(record["Stock #"]);
    if (!allowedShapes.has(record.Shape)) issues.push(`Row ${line}: Shape must be one of ${[...allowedShapes].join(", ")}.`);
    if (!/^\d+(?:\.\d+)?$/.test(record.Weight) || Number(record.Weight) <= 0) issues.push(`Row ${line}: Weight must be a positive decimal without a ct suffix.`);
    if (!/^[D-J]$/.test(record.Color)) issues.push(`Row ${line}: Color must be an uppercase grade from D to J.`);
    if (!allowedClarity.has(record.Clarity)) issues.push(`Row ${line}: Clarity must be an accepted uppercase clarity grade.`);
    if (!allowedFinish.has(record.Cut)) issues.push(`Row ${line}: Cut must be EX, VG, GD, or ID.`);
    if (!allowedFinish.has(record.Polish)) issues.push(`Row ${line}: Polish must be EX, VG, GD, or ID.`);
    if (record.Lab !== "IGI") issues.push(`Row ${line}: Lab must be IGI for the controlled private-list workflow.`);
    if (!/^IGI[-\s]?[A-Z0-9]{6,}$/i.test(record["Report #"])) issues.push(`Row ${line}: Report # must be a plausible IGI certificate identifier (for example IGI-123456789).`);
    if (!/^\d+(?:\.\d{1,2})?$/.test(record["Final Price"]) || Number(record["Final Price"]) <= 0) issues.push(`Row ${line}: Final Price must be a positive decimal with no currency sign, comma, or text.`);
    if (!allowedAvailability.has(record.Availability)) issues.push(`Row ${line}: Availability must be exactly Available or Unavailable.`);
  });
  return { valid: issues.length === 0, rowCount: dataRows.length, issues };
}

export function runPreflight(path) {
  const result = validatePartnerAvailabilityCsv(readFileSync(path, "utf8"));
  const heading = result.valid ? "PASS" : "BLOCKED";
  console.log(`${heading}: checked ${result.rowCount} row${result.rowCount === 1 ? "" : "s"}.`);
  if (result.issues.length) console.log(result.issues.map((issue) => `- ${issue}`).join("\n"));
  console.log("This preflight does not import data, validate a report against the live IGI database, change the buyer rollout lock, or create buyer collateral.");
  return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error("Usage: node scripts/validate-partner-availability.mjs /absolute/path/to/partner_export.csv");
    process.exitCode = 64;
  } else {
    const result = runPreflight(inputPath);
    if (!result.valid) process.exitCode = 1;
  }
}
