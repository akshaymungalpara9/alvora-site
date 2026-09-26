/** Refresh DB-IP's free monthly country file. Run pnpm geo:refresh monthly and commit the file. */
import fs from "node:fs";
import { gunzipSync } from "node:zlib";
const month = new Date().toISOString().slice(0, 7);
const url = `https://download.db-ip.com/free/dbip-country-lite-${month}.csv.gz`;
const response = await fetch(url);
if (!response.ok) throw new Error(`DB-IP download failed (${response.status}): ${url}`);
const bytes = Buffer.from(await response.arrayBuffer());
const sample = gunzipSync(bytes).toString("utf8");
if (!/^\d+\.\d+\.\d+\.\d+,\d+\.\d+\.\d+\.\d+,[A-Z]{2}/.test(sample) || sample.split("\n").length < 10000) throw new Error("Unexpected DB-IP country file");
fs.writeFileSync(new URL("../server/data/geo/dbip-country-lite.csv.gz", import.meta.url), bytes);
console.log(`Updated country database from ${url} (${sample.split("\n").length - 1} rows)`);
