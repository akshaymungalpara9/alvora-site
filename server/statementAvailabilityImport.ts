/** Owner-supplied STATEMENT collection contract. Every row is catalog availability; price is prohibited. */
import { hasTrustedCertificateLink } from "./catalogCertification";

export const statementAvailabilityImportHeaders = [
  "stock_no", "category", "type", "colour", "shape", "carat", "carat_band", "clarity", "cut", "polish", "symmetry", "fluorescence", "measurements", "ratio", "depth_pct", "table_pct", "crown_height", "pavilion_depth", "crown_angle", "pavilion_angle", "girdle_pct", "lab", "cert_no", "cert_pdf_url", "video_url", "image_url",
] as const;

type StatementHeader = (typeof statementAvailabilityImportHeaders)[number];
export type StatementAvailabilityRejection = { row: number; sku: string; reason: string };
export type StatementAvailabilityImportRecord = {
  stockNo: string;
  category: "White" | "Fancy Colour";
  statementType: string;
  colour: string;
  shape: string;
  carat: number;
  caratBand: string;
  clarity: string;
  cut: string | null;
  polish: string | null;
  symmetry: string | null;
  fluorescence: string | null;
  measurements: string | null;
  ratio: number | null;
  depthPct: number | null;
  tablePct: number | null;
  crownHeight: number | null;
  pavilionDepth: number | null;
  crownAngle: number | null;
  pavilionAngle: number | null;
  girdlePct: number | null;
  lab: string | null;
  certNo: string | null;
  certPdfUrl: string | null;
  videoUrl: string | null;
  imageUrl: string | null;
};

function parseCsv(source: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (quoted) {
      if (character === '"' && source[index + 1] === '"') { value += '"'; index += 1; }
      else if (character === '"') quoted = false;
      else value += character;
      continue;
    }
    if (character === '"') quoted = true;
    else if (character === ",") { row.push(value.trim()); value = ""; }
    else if (character === "\n") { row.push(value.trim()); rows.push(row); row = []; value = ""; }
    else if (character !== "\r") value += character;
  }
  if (quoted) throw new Error("CSV contains an unterminated quoted value.");
  if (value.length || row.length) { row.push(value.trim()); rows.push(row); }
  return rows.filter((entry) => entry.some(Boolean));
}

function valueAt(row: string[], header: StatementHeader, headers: string[]) {
  const value = row[headers.indexOf(header)]?.trim() || "";
  return value.toLowerCase() === "null" ? "" : value;
}

function optionalNumber(value: string, field: string, reasons: string[]) {
  if (!value) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) { reasons.push(`${field} must be numeric when provided`); return null; }
  return parsed;
}

function isHttpUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateStatementAvailabilityImportCsv(source: string) {
  const rejections: StatementAvailabilityRejection[] = [];
  if (source.includes("\uFFFD")) return { valid: false, rowCount: 0, records: [] as StatementAvailabilityImportRecord[], rejections: [{ row: 1, sku: "(file)", reason: "File does not appear to be valid UTF-8." }] };
  let rows: string[][];
  try { rows = parseCsv(source.replace(/^\uFEFF/, "")); }
  catch (error) { return { valid: false, rowCount: 0, records: [] as StatementAvailabilityImportRecord[], rejections: [{ row: 1, sku: "(file)", reason: error instanceof Error ? error.message : "CSV could not be parsed." }] }; }
  if (!rows.length) return { valid: false, rowCount: 0, records: [] as StatementAvailabilityImportRecord[], rejections: [{ row: 1, sku: "(file)", reason: "CSV is empty." }] };
  const [headers, ...dataRows] = rows;
  if (headers.length !== statementAvailabilityImportHeaders.length || headers.some((header, index) => header !== statementAvailabilityImportHeaders[index])) return { valid: false, rowCount: dataRows.length, records: [] as StatementAvailabilityImportRecord[], rejections: [{ row: 1, sku: "(file)", reason: `Header must exactly match: ${statementAvailabilityImportHeaders.join(",")}` }] };
  if (!dataRows.length) return { valid: false, rowCount: 0, records: [] as StatementAvailabilityImportRecord[], rejections: [{ row: 1, sku: "(file)", reason: "CSV contains no stone rows." }] };

  const records: StatementAvailabilityImportRecord[] = [];
  const seenStockNumbers = new Set<string>();
  dataRows.forEach((row, index) => {
    const line = index + 2;
    const stockNo = valueAt(row, "stock_no", headers) || `(row-${line})`;
    if (row.length !== statementAvailabilityImportHeaders.length) { rejections.push({ row: line, sku: stockNo, reason: `Expected ${statementAvailabilityImportHeaders.length} columns but found ${row.length}.` }); return; }
    const reasons: string[] = [];
    const category = valueAt(row, "category", headers);
    const carat = Number(valueAt(row, "carat", headers));
    const certPdfUrl = valueAt(row, "cert_pdf_url", headers);
    const videoUrl = valueAt(row, "video_url", headers);
    const imageUrl = valueAt(row, "image_url", headers);
    if (!valueAt(row, "stock_no", headers)) reasons.push("missing stock_no");
    else if (seenStockNumbers.has(stockNo)) reasons.push("duplicate stock_no");
    if (category !== "White" && category !== "Fancy Colour") reasons.push("category must be White or Fancy Colour");
    if (!valueAt(row, "type", headers)) reasons.push("missing type");
    if (!valueAt(row, "colour", headers)) reasons.push("missing colour");
    if (!valueAt(row, "shape", headers)) reasons.push("missing shape");
    if (!Number.isFinite(carat) || carat <= 0) reasons.push("carat must be a positive number");
    if (!valueAt(row, "carat_band", headers)) reasons.push("missing carat_band");
    if (!valueAt(row, "clarity", headers)) reasons.push("missing clarity");
    if (!valueAt(row, "lab", headers)) reasons.push("missing lab");
    if (!valueAt(row, "cert_no", headers)) reasons.push("missing cert_no");
    if (!certPdfUrl) reasons.push("missing cert_pdf_url");
    if (certPdfUrl && !isHttpUrl(certPdfUrl)) reasons.push("cert_pdf_url must be an http or https URL when provided");
    if (certPdfUrl && isHttpUrl(certPdfUrl) && !hasTrustedCertificateLink({ lab: valueAt(row, "lab", headers), reportNumber: valueAt(row, "cert_no", headers), verifyUrl: certPdfUrl })) reasons.push("cert_pdf_url must resolve to the listed IGI or GIA certificate number");
    if (videoUrl && !isHttpUrl(videoUrl)) reasons.push("video_url must be an http or https URL when provided");
    if (imageUrl && !isHttpUrl(imageUrl)) reasons.push("image_url must be an http or https URL when provided");
    const ratio = optionalNumber(valueAt(row, "ratio", headers), "ratio", reasons);
    const depthPct = optionalNumber(valueAt(row, "depth_pct", headers), "depth_pct", reasons);
    const tablePct = optionalNumber(valueAt(row, "table_pct", headers), "table_pct", reasons);
    const crownHeight = optionalNumber(valueAt(row, "crown_height", headers), "crown_height", reasons);
    const pavilionDepth = optionalNumber(valueAt(row, "pavilion_depth", headers), "pavilion_depth", reasons);
    const crownAngle = optionalNumber(valueAt(row, "crown_angle", headers), "crown_angle", reasons);
    const pavilionAngle = optionalNumber(valueAt(row, "pavilion_angle", headers), "pavilion_angle", reasons);
    const girdlePct = optionalNumber(valueAt(row, "girdle_pct", headers), "girdle_pct", reasons);
    if (reasons.length) { rejections.push({ row: line, sku: stockNo, reason: reasons.join("; ") }); return; }
    seenStockNumbers.add(stockNo);
    records.push({
      stockNo, category: category as "White" | "Fancy Colour", statementType: valueAt(row, "type", headers), colour: valueAt(row, "colour", headers), shape: valueAt(row, "shape", headers), carat, caratBand: valueAt(row, "carat_band", headers), clarity: valueAt(row, "clarity", headers), cut: valueAt(row, "cut", headers) || null, polish: valueAt(row, "polish", headers) || null, symmetry: valueAt(row, "symmetry", headers) || null, fluorescence: valueAt(row, "fluorescence", headers) || null, measurements: valueAt(row, "measurements", headers) || null, ratio, depthPct, tablePct, crownHeight, pavilionDepth, crownAngle, pavilionAngle, girdlePct, lab: valueAt(row, "lab", headers) || null, certNo: valueAt(row, "cert_no", headers) || null, certPdfUrl: certPdfUrl || null, videoUrl: videoUrl || null, imageUrl: imageUrl || null,
    });
  });
  return { valid: rejections.length === 0, rowCount: dataRows.length, records, rejections };
}
