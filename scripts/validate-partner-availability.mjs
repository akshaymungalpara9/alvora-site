import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

export const requiredHeaders = [
  "sku", "shape", "carat", "color", "clarity", "cut", "fluorescence", "measurements", "igi_cert_number", "video_url", "price_usd", "band_tag", "origin_partner",
];

const menuShapes = new Set(["ROUND", "OVAL", "EMERALD", "PEAR"]);
const colorMenu = new Set(["D", "E", "F", "G", "H"]);
const clarityMenu = new Set(["FL", "IF", "VVS1", "VVS2", "VS1", "VS2"]);

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
    if (char === '"') quoted = true;
    else if (char === ",") { row.push(value.trim()); value = ""; }
    else if (char === "\n") { row.push(value.trim()); rows.push(row); row = []; value = ""; }
    else if (char !== "\r") value += char;
  }
  if (quoted) throw new Error("CSV contains an unterminated quoted value.");
  if (value.length || row.length) { row.push(value.trim()); rows.push(row); }
  return rows.filter((entry) => entry.some(Boolean));
}

function reviewFlags(record) {
  const flags = [];
  if (!menuShapes.has(record.shape)) flags.push("shape outside Round / Oval / Emerald / Pear");
  if (record.carat < 1 || record.carat > 4.19) flags.push("carat outside 1.00–4.19 ct");
  if (!colorMenu.has(record.color)) flags.push("colour below H");
  if (!clarityMenu.has(record.clarity)) flags.push("clarity below VS2");
  if (!["EX", "IDEAL"].includes(record.cut)) flags.push("cut is not EX / Ideal");
  if (record.fluorescence !== "NONE") flags.push("fluorescence is not None");
  return flags;
}

export function validatePartnerAvailabilityCsv(source) {
  const issues = [];
  const flags = [];
  if (source.includes("\uFFFD")) issues.push("File does not appear to be valid UTF-8.");
  let rows;
  try { rows = parseCsv(source.replace(/^\uFEFF/, "")); }
  catch (error) { return { valid: false, rowCount: 0, issues: [error instanceof Error ? error.message : "CSV could not be parsed."], flags }; }
  if (!rows.length) return { valid: false, rowCount: 0, issues: ["CSV is empty."], flags };

  const [headers, ...dataRows] = rows;
  if (headers.length !== requiredHeaders.length || headers.some((header, index) => header !== requiredHeaders[index])) issues.push(`Header must exactly match: ${requiredHeaders.join(",")}`);
  if (!dataRows.length) issues.push("CSV contains no stone rows.");
  if (issues.length) return { valid: false, rowCount: dataRows.length, issues, flags };

  const seenSkus = new Set();
  dataRows.forEach((row, rowIndex) => {
    const line = rowIndex + 2;
    const record = Object.fromEntries(requiredHeaders.map((header, index) => [header, row[index]?.trim() || ""]));
    const sku = record.sku || `(row-${line})`;
    const rowIssues = [];
    if (row.length !== requiredHeaders.length) rowIssues.push(`expected ${requiredHeaders.length} columns but found ${row.length}`);
    if (!record.sku) rowIssues.push("missing sku");
    else if (seenSkus.has(record.sku)) rowIssues.push("duplicate sku");
    if (!record.igi_cert_number) rowIssues.push("missing igi_cert_number");
    try {
      const url = new URL(record.video_url);
      if (!["http:", "https:"].includes(url.protocol)) rowIssues.push("video_url must be an http or https URL");
    } catch { rowIssues.push("video_url must be an http or https URL"); }
    const carat = Number(record.carat);
    if (!Number.isFinite(carat) || carat <= 0) rowIssues.push("carat must be a positive number");
    const price = Number(record.price_usd);
    if (!Number.isFinite(price) || price <= 0) rowIssues.push("price_usd must be a positive number");
    if (rowIssues.length) issues.push(`Row ${line} (${sku}): ${rowIssues.join("; ")}.`);
    else {
      seenSkus.add(record.sku);
      const rowFlags = reviewFlags({ shape: record.shape.toUpperCase(), carat, color: record.color.toUpperCase(), clarity: record.clarity.toUpperCase(), cut: record.cut.toUpperCase(), fluorescence: record.fluorescence.toUpperCase() });
      if (rowFlags.length) flags.push(`Row ${line} (${sku}): ${rowFlags.join("; ")}.`);
    }
  });
  return { valid: issues.length === 0, rowCount: dataRows.length, issues, flags };
}

export function runPreflight(path) {
  const result = validatePartnerAvailabilityCsv(readFileSync(path, "utf8"));
  console.log(`${result.valid ? "PASS" : "BLOCKED"}: checked ${result.rowCount} row${result.rowCount === 1 ? "" : "s"}.`);
  if (result.issues.length) console.log(result.issues.map((issue) => `- REJECT: ${issue}`).join("\n"));
  if (result.flags.length) console.log(result.flags.map((flag) => `- REVIEW: ${flag}`).join("\n"));
  console.log("This preflight does not import data, validate a report against the live IGI database, enable buyer early access, or create buyer collateral.");
  return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error("Usage: node scripts/validate-partner-availability.mjs /absolute/path/to/live_availability.csv");
    process.exitCode = 64;
  } else if (!runPreflight(inputPath).valid) {
    process.exitCode = 1;
  }
}
