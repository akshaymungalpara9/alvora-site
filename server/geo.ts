/** Offline DB-IP Country Lite lookup. The source file contains ranges, not visitor data. */
import fs from "node:fs";
import path from "node:path";
import net from "node:net";
import { gunzipSync } from "node:zlib";
import type { Express } from "express";

type Range = { start: bigint; end: bigint; country: string };
let ranges: { 4: Range[]; 6: Range[] } | undefined;

function address(ip: string): bigint | null {
  const version = net.isIP(ip);
  if (version === 4) return ip.split(".").reduce((number, octet) => number * BigInt("256") + BigInt(octet), BigInt("0"));
  if (version !== 6) return null;
  // Expand a single compressed run, including an embedded IPv4 address.
  const normalized = ip.includes(".") ? ip.replace(/(\d+\.\d+\.\d+\.\d+)$/, (v) => {
    const n = v.split(".").map(Number);
    return `${((n[0] << 8) | n[1]).toString(16)}:${((n[2] << 8) | n[3]).toString(16)}`;
  }) : ip;
  const halves = normalized.split("::");
  const left = halves[0] ? halves[0].split(":") : [];
  const right = halves[1] ? halves[1].split(":") : [];
  const words = halves.length === 2 ? [...left, ...Array(8 - left.length - right.length).fill("0"), ...right] : left;
  return words.reduce((n, word) => n * BigInt("65536") + BigInt(`0x${word}`), BigInt("0"));
}

function database() {
  if (ranges) return ranges;
  const filename = [
    path.resolve(process.cwd(), "server/data/geo/dbip-country-lite.csv.gz"),
    path.resolve(process.cwd(), "dist/data/geo/dbip-country-lite.csv.gz"),
  ].find((candidate) => fs.existsSync(candidate));
  if (!filename) return { 4: [], 6: [] } as { 4: Range[]; 6: Range[] };
  const text = gunzipSync(fs.readFileSync(filename)).toString("utf8");
  const loaded: { 4: Range[]; 6: Range[] } = { 4: [], 6: [] };
  for (const row of text.split("\n")) {
    const [from, to, country] = row.trim().split(",");
    if (!from || !to || !country) continue;
    const version = net.isIP(from);
    if (version !== 4 && version !== 6) continue;
    const start = address(from), end = address(to);
    if (start != null && end != null) loaded[version].push({ start, end, country });
  }
  loaded[4].sort((a, b) => a.start < b.start ? -1 : a.start > b.start ? 1 : 0);
  loaded[6].sort((a, b) => a.start < b.start ? -1 : a.start > b.start ? 1 : 0);
  ranges = loaded;
  return ranges;
}

export function countryForIp(ip: string | undefined): string | null {
  if (!ip) return null;
  const normalized = ip.startsWith("::ffff:") ? ip.slice(7) : ip;
  const version = net.isIP(normalized);
  if (version !== 4 && version !== 6) return null;
  const number = address(normalized)!;
  // Local/private/reserved space must not produce a country even if listed in the file.
  if (version === 4 && (
    (number >> BigInt("24")) === BigInt("10") || (number >> BigInt("20")) === BigInt("0xac1") || (number >> BigInt("16")) === BigInt("0xc0a8") ||
    (number >> BigInt("24")) === BigInt("127") || (number >> BigInt("16")) === BigInt("0xa9fe") || (number >> BigInt("24")) === BigInt("0") ||
    (number >> BigInt("22")) === BigInt("0x191") || number >= BigInt("0xe0000000")
  )) return null;
  if (version === 6 && (number === BigInt("0") || number === BigInt("1") || (number >> BigInt("121")) === BigInt("0x7e") || (number >> BigInt("118")) === BigInt("0x3fa"))) return null;
  const list = database()[version];
  let low = 0, high = list.length - 1;
  while (low <= high) {
    const middle = (low + high) >>> 1;
    const range = list[middle];
    if (number < range.start) high = middle - 1;
    else if (number > range.end) low = middle + 1;
    else return /^[A-Z]{2}$/.test(range.country) && range.country !== "ZZ" ? range.country : null;
  }
  return null;
}

export function registerGeoRoute(app: Express) {
  app.get("/api/geo", (req, res) => {
    res.set("Cache-Control", "private, no-store");
    // Only the test process in development may set this header. Production always ignores it.
    const testIp = process.env.NODE_ENV === "development" && process.env.GEO_TEST_MODE === "1" ? req.get("x-test-geo-ip") : undefined;
    res.json({ country: countryForIp(testIp || req.ip) });
  });
}
