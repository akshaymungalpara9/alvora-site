import { readFileSync, writeFileSync } from "node:fs";

const sourcePath = "/home/ubuntu/projects/lgd-623a8bf0/Alvora_Nivoda_Upload_100SKU.csv";
const outputPath = "/home/ubuntu/alvora-site/availability_seed.sql";
const lines = readFileSync(sourcePath, "utf8").trim().split(/\r?\n/);
const headerIndex = lines.findIndex((line) => line.includes("Stock #"));

if (headerIndex < 0) throw new Error("Availability CSV header was not found.");

const headers = lines[headerIndex].split(",").map((value) => value.trim());
const columnIndex = (name) => headers.indexOf(name);
const fields = [
  ["stockNumber", "Stock #"],
  ["availability", "Availability"],
  ["shape", "Shape"],
  ["carat", "Weight"],
  ["color", "Color"],
  ["clarity", "Clarity"],
  ["cut", "Cut"],
  ["polish", "Polish"],
  ["lab", "Lab"],
  ["reportNumber", "Report #"],
  ["price", "Final Price"],
  ["location", "Location"],
];

const escapeSql = (value) => `'${String(value).replaceAll("'", "''")}'`;
const nullableSql = (value) => (value ? escapeSql(value) : "NULL");
const rows = lines
  .slice(headerIndex + 1)
  .filter(Boolean)
  .map((line) => line.split(",").map((value) => value.trim()))
  .filter((row) => row[columnIndex("Stock #")])
  .map((row) => {
    const values = Object.fromEntries(fields.map(([field, column]) => [field, row[columnIndex(column)] ?? ""]));
    return `(${[
      escapeSql(values.stockNumber),
      escapeSql(values.availability || "Available"),
      escapeSql(values.shape),
      Number(values.carat || 0),
      escapeSql(values.color),
      escapeSql(values.clarity),
      nullableSql(values.cut),
      nullableSql(values.polish),
      nullableSql(values.lab),
      nullableSql(values.reportNumber),
      values.price ? Number(values.price) : "NULL",
      nullableSql(values.location),
    ].join(", ")})`;
  });

if (!rows.length) throw new Error("No availability rows were parsed from the supplied CSV.");

const sql = `INSERT INTO availability_stones (stockNumber, availability, shape, carat, color, clarity, cut, polish, lab, reportNumber, price, location)\nVALUES\n${rows.join(",\n")}\nON DUPLICATE KEY UPDATE\n  availability = VALUES(availability),\n  shape = VALUES(shape),\n  carat = VALUES(carat),\n  color = VALUES(color),\n  clarity = VALUES(clarity),\n  cut = VALUES(cut),\n  polish = VALUES(polish),\n  lab = VALUES(lab),\n  reportNumber = VALUES(reportNumber),\n  price = VALUES(price),\n  location = VALUES(location),\n  importedAt = NOW();\n`;

writeFileSync(outputPath, sql);
console.log(`Prepared ${rows.length} real availability rows at ${outputPath}`);
