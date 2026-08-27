/** The owner-approved no-price current-production catalog contract. */
import { hasTrustedCertificateLink } from "./catalogCertification";

export const availabilityImportHeaders = [
  "stock_no", "category", "colour", "shape", "carat", "carat_band", "clarity", "cut", "polish", "symmetry", "measurements", "depth_pct", "table_pct", "ratio", "lab", "cert_no", "verify_url", "video_url",
] as const;

export type AvailabilityImportHeader = (typeof availabilityImportHeaders)[number];
export type AvailabilityRejection = { row: number; sku: string; reason: string };
export type AvailabilityImportRecord = {
  stockNo: string;
  category: "White" | "Fancy Colour";
  colour: string;
  shape: string;
  carat: number;
  caratBand: string;
  clarity: string;
  cut: string | null;
  polish: string | null;
  symmetry: string | null;
  measurements: string | null;
  depthPct: number | null;
  tablePct: number | null;
  ratio: number | null;
  lab: string | null;
  certNo: string;
  verifyUrl: string;
  videoUrl: string | null;
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

function valueAt(row: string[], header: AvailabilityImportHeader, headers: string[]) {
  return row[headers.indexOf(header)]?.trim() || "";
}

function parsedOptionalNumber(value: string, field: string, reasons: string[]) {
  if (!value) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) { reasons.push(`${field} must be numeric when provided`); return null; }
  return parsed;
}

function httpUrl(value: string) {
  try {
    const parsed = new URL(value);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function normalizedVerifyUrl(value: string, lab: string, certNo: string) {
  const parsed = new URL(value);
  const hostname = parsed.hostname.toLowerCase();
  const isIgi = hostname === "igi.org" || hostname.endsWith(".igi.org");
  if (!isIgi) return value;
  return `https://api.igi.org/viewpdf.php?r=${encodeURIComponent(certNo)}`;
}

export function validateAvailabilityImportCsv(source: string) {
  const rejections: AvailabilityRejection[] = [];
  if (source.includes("\uFFFD")) return { valid: false, rowCount: 0, records: [] as AvailabilityImportRecord[], rejections: [{ row: 1, sku: "(file)", reason: "File does not appear to be valid UTF-8." }] };
  let rows: string[][];
  try { rows = parseCsv(source.replace(/^\uFEFF/, "")); }
  catch (error) { return { valid: false, rowCount: 0, records: [] as AvailabilityImportRecord[], rejections: [{ row: 1, sku: "(file)", reason: error instanceof Error ? error.message : "CSV could not be parsed." }] }; }
  if (!rows.length) return { valid: false, rowCount: 0, records: [] as AvailabilityImportRecord[], rejections: [{ row: 1, sku: "(file)", reason: "CSV is empty." }] };

  const [headers, ...dataRows] = rows;
  if (headers.length !== availabilityImportHeaders.length || headers.some((header, index) => header !== availabilityImportHeaders[index])) return { valid: false, rowCount: dataRows.length, records: [] as AvailabilityImportRecord[], rejections: [{ row: 1, sku: "(file)", reason: `Header must exactly match: ${availabilityImportHeaders.join(",")}` }] };
  if (!dataRows.length) return { valid: false, rowCount: 0, records: [] as AvailabilityImportRecord[], rejections: [{ row: 1, sku: "(file)", reason: "CSV contains no stone rows." }] };

  const records: AvailabilityImportRecord[] = [];
  const seenStockNumbers = new Set<string>();
  dataRows.forEach((row, index) => {
    const line = index + 2;
    const stockNo = valueAt(row, "stock_no", headers) || `(row-${line})`;
    if (row.length !== availabilityImportHeaders.length) { rejections.push({ row: line, sku: stockNo, reason: `Expected ${availabilityImportHeaders.length} columns but found ${row.length}.` }); return; }
    const reasons: string[] = [];
    const category = valueAt(row, "category", headers);
    const carat = Number(valueAt(row, "carat", headers));
    const verifyUrl = valueAt(row, "verify_url", headers);
    const videoUrl = valueAt(row, "video_url", headers);
    if (!valueAt(row, "stock_no", headers)) reasons.push("missing stock_no");
    else if (seenStockNumbers.has(stockNo)) reasons.push("duplicate stock_no");
    if (category !== "White" && category !== "Fancy Colour") reasons.push("category must be White or Fancy Colour");
    if (!valueAt(row, "colour", headers)) reasons.push("missing colour");
    if (!valueAt(row, "shape", headers)) reasons.push("missing shape");
    if (!Number.isFinite(carat) || carat <= 0) reasons.push("carat must be a positive number");
    if (!valueAt(row, "carat_band", headers)) reasons.push("missing carat_band");
    if (!valueAt(row, "clarity", headers)) reasons.push("missing clarity");
    const normalizedUrl = httpUrl(verifyUrl) ? normalizedVerifyUrl(verifyUrl, valueAt(row, "lab", headers), valueAt(row, "cert_no", headers)) : verifyUrl;
    if (!valueAt(row, "lab", headers)) reasons.push("missing lab");
    if (!valueAt(row, "cert_no", headers)) reasons.push("missing cert_no");
    if (!httpUrl(verifyUrl)) reasons.push("verify_url must be an http or https URL");
    if (httpUrl(verifyUrl) && !hasTrustedCertificateLink({ lab: valueAt(row, "lab", headers), reportNumber: valueAt(row, "cert_no", headers), verifyUrl: normalizedUrl })) reasons.push("verify_url must resolve to the listed IGI or GIA certificate number");
    if (videoUrl && !httpUrl(videoUrl)) reasons.push("video_url must be an http or https URL when provided");
    const depthPct = parsedOptionalNumber(valueAt(row, "depth_pct", headers), "depth_pct", reasons);
    const tablePct = parsedOptionalNumber(valueAt(row, "table_pct", headers), "table_pct", reasons);
    const ratio = parsedOptionalNumber(valueAt(row, "ratio", headers), "ratio", reasons);
    if (reasons.length) { rejections.push({ row: line, sku: stockNo, reason: reasons.join("; ") }); return; }
    seenStockNumbers.add(stockNo);
    records.push({
      stockNo,
      category: category as "White" | "Fancy Colour",
      colour: valueAt(row, "colour", headers),
      shape: valueAt(row, "shape", headers),
      carat,
      caratBand: valueAt(row, "carat_band", headers),
      clarity: valueAt(row, "clarity", headers),
      cut: valueAt(row, "cut", headers) || null,
      polish: valueAt(row, "polish", headers) || null,
      symmetry: valueAt(row, "symmetry", headers) || null,
      measurements: valueAt(row, "measurements", headers) || null,
      depthPct,
      tablePct,
      ratio,
      lab: valueAt(row, "lab", headers) || null,
      certNo: valueAt(row, "cert_no", headers),
      verifyUrl: normalizedUrl,
      videoUrl: videoUrl || null,
    });
  });
  return { valid: rejections.length === 0, rowCount: dataRows.length, records, rejections };
}
