export const availabilityImportHeaders = [
  "sku",
  "shape",
  "carat",
  "color",
  "clarity",
  "cut",
  "fluorescence",
  "measurements",
  "igi_cert_number",
  "video_url",
  "price_usd",
  "band_tag",
  "origin_partner",
] as const;

export type AvailabilityImportHeader = (typeof availabilityImportHeaders)[number];
export type AvailabilityRejection = { row: number; sku: string; reason: string };
export type AvailabilityImportRecord = {
  sku: string;
  shape: string;
  carat: number;
  color: string;
  clarity: string;
  cut: string;
  fluorescence: string;
  measurements: string | null;
  igiCertNumber: string;
  videoUrl: string;
  priceUsd: number;
  bandTag: string | null;
  originPartner: string | null;
  standardsFlags: string[];
};

const menuShapes = new Set(["ROUND", "OVAL", "EMERALD", "PEAR"]);
const clarityRank = ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "I1"];
const standardColors = new Set(["D", "E", "F", "G", "H"]);
const standardClarities = new Set(clarityRank.slice(0, clarityRank.indexOf("VS2") + 1));

export function parseAvailabilityCsv(source: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (quoted) {
      if (character === '"' && source[index + 1] === '"') {
        value += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        value += character;
      }
      continue;
    }
    if (character === '"') {
      quoted = true;
    } else if (character === ",") {
      row.push(value.trim());
      value = "";
    } else if (character === "\n") {
      row.push(value.trim());
      rows.push(row);
      row = [];
      value = "";
    } else if (character !== "\r") {
      value += character;
    }
  }
  if (quoted) throw new Error("CSV contains an unterminated quoted value.");
  if (value.length || row.length) {
    row.push(value.trim());
    rows.push(row);
  }
  return rows.filter((entry) => entry.some(Boolean));
}

function valueAt(row: string[], header: AvailabilityImportHeader, headers: string[]) {
  return row[headers.indexOf(header)]?.trim() || "";
}

function standardFlags(record: Pick<AvailabilityImportRecord, "shape" | "carat" | "color" | "clarity" | "cut" | "fluorescence">) {
  const flags: string[] = [];
  if (!menuShapes.has(record.shape)) flags.push("shape outside Round / Oval / Emerald / Pear");
  if (record.carat < 1 || record.carat > 4.19) flags.push("carat outside 1.00–4.19 ct");
  if (!standardColors.has(record.color)) flags.push("colour below H");
  if (!standardClarities.has(record.clarity)) flags.push("clarity below VS2");
  if (!["EX", "IDEAL"].includes(record.cut)) flags.push("cut is not EX / Ideal");
  if (record.fluorescence !== "NONE") flags.push("fluorescence is not None");
  return flags;
}

export function validateAvailabilityImportCsv(source: string) {
  const rejections: AvailabilityRejection[] = [];
  if (source.includes("\uFFFD")) {
    return { valid: false, rowCount: 0, records: [] as AvailabilityImportRecord[], rejections: [{ row: 1, sku: "(file)", reason: "File does not appear to be valid UTF-8." }] };
  }

  let rows: string[][];
  try {
    rows = parseAvailabilityCsv(source.replace(/^\uFEFF/, ""));
  } catch (error) {
    return { valid: false, rowCount: 0, records: [] as AvailabilityImportRecord[], rejections: [{ row: 1, sku: "(file)", reason: error instanceof Error ? error.message : "CSV could not be parsed." }] };
  }
  if (!rows.length) {
    return { valid: false, rowCount: 0, records: [] as AvailabilityImportRecord[], rejections: [{ row: 1, sku: "(file)", reason: "CSV is empty." }] };
  }

  const [headers, ...dataRows] = rows;
  if (headers.length !== availabilityImportHeaders.length || headers.some((header, index) => header !== availabilityImportHeaders[index])) {
    return {
      valid: false,
      rowCount: dataRows.length,
      records: [] as AvailabilityImportRecord[],
      rejections: [{ row: 1, sku: "(file)", reason: `Header must exactly match: ${availabilityImportHeaders.join(",")}` }],
    };
  }
  if (!dataRows.length) {
    return { valid: false, rowCount: 0, records: [] as AvailabilityImportRecord[], rejections: [{ row: 1, sku: "(file)", reason: "CSV contains no stone rows." }] };
  }

  const seenSkus = new Set<string>();
  const records: AvailabilityImportRecord[] = [];
  dataRows.forEach((row, index) => {
    const line = index + 2;
    const sku = valueAt(row, "sku", headers) || `(row-${line})`;
    if (row.length !== availabilityImportHeaders.length) {
      rejections.push({ row: line, sku, reason: `Expected ${availabilityImportHeaders.length} columns but found ${row.length}.` });
      return;
    }
    const shape = valueAt(row, "shape", headers).toUpperCase();
    const carat = Number(valueAt(row, "carat", headers));
    const color = valueAt(row, "color", headers).toUpperCase();
    const clarity = valueAt(row, "clarity", headers).toUpperCase();
    const cut = valueAt(row, "cut", headers).toUpperCase();
    const fluorescence = valueAt(row, "fluorescence", headers).toUpperCase();
    const igiCertNumber = valueAt(row, "igi_cert_number", headers);
    const videoUrl = valueAt(row, "video_url", headers);
    const priceUsd = Number(valueAt(row, "price_usd", headers));
    const reasons: string[] = [];
    if (!valueAt(row, "sku", headers)) reasons.push("missing sku");
    else if (seenSkus.has(sku)) reasons.push("duplicate sku");
    if (!shape) reasons.push("missing shape");
    if (!Number.isFinite(carat) || carat <= 0) reasons.push("carat must be a positive number");
    if (!color) reasons.push("missing color");
    if (!clarity) reasons.push("missing clarity");
    if (!cut) reasons.push("missing cut");
    if (!fluorescence) reasons.push("missing fluorescence");
    if (!igiCertNumber) reasons.push("missing igi_cert_number");
    try {
      const parsed = new URL(videoUrl);
      if (!videoUrl || !["https:", "http:"].includes(parsed.protocol)) reasons.push("video_url must be an http or https URL");
    } catch {
      reasons.push("video_url must be an http or https URL");
    }
    if (!Number.isFinite(priceUsd) || priceUsd <= 0) reasons.push("price_usd must be a positive number");
    if (reasons.length) {
      rejections.push({ row: line, sku, reason: reasons.join("; ") });
      return;
    }
    seenSkus.add(sku);
    const record = {
      sku,
      shape,
      carat,
      color,
      clarity,
      cut,
      fluorescence,
      measurements: valueAt(row, "measurements", headers) || null,
      igiCertNumber,
      videoUrl,
      priceUsd,
      bandTag: valueAt(row, "band_tag", headers) || null,
      originPartner: valueAt(row, "origin_partner", headers) || null,
      standardsFlags: [] as string[],
    };
    record.standardsFlags = standardFlags(record);
    records.push(record);
  });

  return { valid: rejections.length === 0, rowCount: dataRows.length, records, rejections };
}
