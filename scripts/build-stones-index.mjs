#!/usr/bin/env node
/**
 * Build the certified stone index from the 16 Client Send List workbooks.
 * Reads xlsx files from argv[2], writes server/data/stones.public.json and
 * stones.meta.json. Prices are destructured away at the row level and never
 * enter any record. Cert URLs are constructed from the report number; video
 * URLs are copied only when the host is not IGI or GIA. Embeddability of each
 * video host is probed once via curl and cached in scripts/embeddable-hosts.json.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync, execFile } from "node:child_process";
import { promisify } from "node:util";
import * as XLSX from "xlsx";
import { formatInTimeZone } from "date-fns-tz";

const execFileAsync = promisify(execFile);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const STONE_LISTS_JSON = path.join(REPO_ROOT, "shared", "stoneLists.json");
const OUT_DIR = path.join(REPO_ROOT, "server", "data");
const OUT_PUBLIC = path.join(OUT_DIR, "stones.public.json");
const OUT_META = path.join(OUT_DIR, "stones.meta.json");
const EMBEDDABLE_HOSTS_JSON = path.join(__dirname, "embeddable-hosts.json");
const EMBEDDABLE_URLS_JSON = path.join(__dirname, "embeddable-urls.json");
const URL_PROBE_CONCURRENCY = 10;

const stoneLists = JSON.parse(fs.readFileSync(STONE_LISTS_JSON, "utf8"));
const LIST_LABELS = stoneLists.labels;
const LIST_BANDS = stoneLists.bands;

const WORKBOOK_TO_LIST = {
  "Alvora_Rounds_Under1ct": "rounds-under-1ct",
  "Alvora_Rounds_1to2ct": "rounds-1-2ct",
  "Alvora_Rounds_2to3ct": "rounds-2-3ct",
  "Alvora_Rounds_3ct_plus": "rounds-3ct-plus",
  "Alvora_Shapes_Ovals_Pears": "shapes-ovals-pears",
  "Alvora_Shapes_Cushions_Radiants": "shapes-cushions-radiants",
  "Alvora_Shapes_Emerald_Asscher_Step": "shapes-step-cuts",
  "Alvora_Shapes_Other": "shapes-other",
  "Alvora_Fancy_Pink": "fancy-pink",
  "Alvora_Fancy_Blue": "fancy-blue",
  "Alvora_Fancy_Yellow": "fancy-yellow",
  "Alvora_Fancy_Green_Brown_Other": "fancy-other",
  "Alvora_Premium_Pink_5ct": "premium-pink-5ct",
  "Alvora_Big_White_3ct": "big-white-3ct",
  "Alvora_Big_FancyColour_3ct": "big-fancy-3ct",
  "Alvora_Showpiece_10ct": "showpiece-10ct",
};

const KNOWN_SHAPES = new Set([
  "round", "pear", "oval", "emerald", "radiant", "cushion",
  "cushion modified", "asscher", "heart", "princess", "marquise",
]);

const CERT_HOSTS = ["igi.org", "api.igi.org", "gia.edu"];

const INITIAL_HOSTS_TO_PROBE = [
  "workshop.360view.link",
  "d360.tech",
  "video.diamond-video.live",
  "video.s360.services",
  "ds-360.jaykar.co.in",
  "jaykar.co.in",
  "video.diamonds360.in",
];

function loadEmbeddableHosts() {
  try {
    return JSON.parse(fs.readFileSync(EMBEDDABLE_HOSTS_JSON, "utf8"));
  } catch {
    return {};
  }
}

function saveEmbeddableHosts(map) {
  const sorted = {};
  for (const key of Object.keys(map).sort()) sorted[key] = map[key];
  fs.writeFileSync(EMBEDDABLE_HOSTS_JSON, JSON.stringify(sorted, null, 2) + "\n");
}

function loadEmbeddableUrls() {
  try {
    return JSON.parse(fs.readFileSync(EMBEDDABLE_URLS_JSON, "utf8"));
  } catch {
    return {};
  }
}

function saveEmbeddableUrls(map) {
  const sorted = {};
  for (const key of Object.keys(map).sort()) sorted[key] = map[key];
  fs.writeFileSync(EMBEDDABLE_URLS_JSON, JSON.stringify(sorted, null, 2) + "\n");
}

function normaliseHost(hostname) {
  if (!hostname) return null;
  return hostname.toLowerCase();
}

function isCertHost(host) {
  if (!host) return false;
  const h = host.toLowerCase();
  return CERT_HOSTS.some((c) => h === c || h.endsWith("." + c));
}

/**
 * Header analysis shared by per-host and per-URL probes.
 * Returns true only when the response headers don't forbid framing from alvoradiamonds.com.
 */
function headersPermitFraming(stdout) {
  const xfoMatches = [...stdout.matchAll(/^x-frame-options:\s*(.+)$/img)];
  if (xfoMatches.length) {
    const val = xfoMatches[xfoMatches.length - 1][1].trim().toLowerCase();
    if (val.includes("deny") || val.includes("sameorigin")) return false;
  }
  const cspMatches = [...stdout.matchAll(/^content-security-policy:\s*(.+)$/img)];
  if (cspMatches.length) {
    const val = cspMatches[cspMatches.length - 1][1].toLowerCase();
    const fa = /frame-ancestors\s+([^;]+)/i.exec(val);
    if (fa) {
      const ancestors = fa[1].trim();
      if (ancestors === "'none'") return false;
      if (!ancestors.includes("*") && !ancestors.includes("alvoradiamonds.com")) return false;
    }
  }
  return true;
}

/**
 * Probe a sample URL for the host (synchronous, kept for the per-host fallback).
 */
function probeEmbeddable(sampleUrl) {
  try {
    const stdout = execFileSync(
      "curl",
      ["-sIL", "-A", "Mozilla/5.0 (build-stones-index)", "--max-time", "10", sampleUrl],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    );
    return headersPermitFraming(stdout);
  } catch {
    return false;
  }
}

/**
 * Per-URL probe: requires https, HTTP 200 on the final response after redirects,
 * and no XFO / CSP that excludes alvoradiamonds.com. Returns { ok, networkFailure }.
 * networkFailure is true when curl itself errored (offline sandbox, DNS, etc.),
 * so the caller can fall back to per-host cache rather than treating it as a real "no".
 */
async function probeUrlEmbeddable(url) {
  if (!url.startsWith("https://")) return { ok: false, networkFailure: false };
  try {
    const { stdout } = await execFileAsync(
      "curl",
      [
        "-sIL",
        "-A", "Mozilla/5.0 (build-stones-index)",
        "--max-time", "10",
        "-w", "\nHTTP_STATUS:%{http_code}\n",
        url,
      ],
      { encoding: "utf8", maxBuffer: 512 * 1024 },
    );
    const statusMatch = /HTTP_STATUS:(\d+)/.exec(stdout);
    if (!statusMatch || statusMatch[1] !== "200") return { ok: false, networkFailure: false };
    if (!headersPermitFraming(stdout)) return { ok: false, networkFailure: false };
    return { ok: true, networkFailure: false };
  } catch {
    return { ok: false, networkFailure: true };
  }
}

/**
 * Run probeUrlEmbeddable across a list of URLs with bounded concurrency.
 * Skips URLs already present in the cache. Returns { probed, networkFailures }.
 */
async function probeUrlsConcurrently(urls, cache, concurrency = URL_PROBE_CONCURRENCY) {
  const queue = urls.filter((u) => !Object.prototype.hasOwnProperty.call(cache, u));
  let probed = 0;
  let networkFailures = 0;
  let index = 0;
  async function worker() {
    while (true) {
      const i = index;
      index += 1;
      if (i >= queue.length) return;
      const url = queue[i];
      const { ok, networkFailure } = await probeUrlEmbeddable(url);
      if (networkFailure) {
        networkFailures += 1;
      } else {
        cache[url] = ok;
      }
      probed += 1;
      if (probed % 100 === 0) {
        console.log(`[build-stones-index] per-URL probed ${probed}/${queue.length}`);
      }
    }
  }
  await Promise.all(Array.from({ length: Math.max(1, concurrency) }, worker));
  return { probed, networkFailures };
}

function readWorkbook(filePath) {
  const buffer = fs.readFileSync(filePath);
  const wb = XLSX.read(buffer, { type: "buffer", cellDates: false });
  const sheetName = wb.SheetNames[0];
  return XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: "", raw: false });
}

function trimUpper(v) {
  return (v == null ? "" : String(v)).trim().toUpperCase();
}

function toTitleCase(input) {
  return input
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function normaliseShape(raw, unknownLog) {
  const trimmed = String(raw || "").trim();
  if (!trimmed) return "";
  const lower = trimmed.toLowerCase();
  if (KNOWN_SHAPES.has(lower)) return toTitleCase(lower);
  unknownLog.set(trimmed, (unknownLog.get(trimmed) || 0) + 1);
  return toTitleCase(trimmed);
}

function normaliseMeasurements(v) {
  const s = String(v || "").trim();
  if (!s) return "";
  return s.replace(/\s*[×✕xX*]\s*/g, " x ");
}

function parseWeight(v) {
  const raw = String(v == null ? "" : v).replace(/[^\d.\-]/g, "");
  if (!raw) return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100) / 100;
}

function digitsOnly(v) {
  const s = String(v == null ? "" : v).trim();
  return /^\d+$/.test(s) ? s : null;
}

function buildCertUrl(lab, report) {
  if (lab === "IGI") return `https://api.igi.org/viewpdf.php?r=${report}`;
  return `https://www.gia.edu/report-check?reportno=${report}`;
}

function parseVideoLink(raw) {
  const s = String(raw || "").trim();
  if (!s) return { url: null, host: null };
  try {
    const u = new URL(s);
    return { url: u.toString(), host: normaliseHost(u.hostname) };
  } catch {
    return { url: null, host: null };
  }
}

function bandForList(listKey) {
  const band = LIST_BANDS[listKey];
  if (!band) throw new Error(`No band mapping for list key ${listKey}`);
  return band;
}

async function main() {
  const argInput = process.argv[2];
  if (!argInput) {
    console.error("Usage: node scripts/build-stones-index.mjs <path-to-Client-Send-Lists>");
    process.exit(2);
  }
  const workbookDir = path.resolve(argInput);
  if (!fs.existsSync(workbookDir)) {
    console.error(`[build-stones-index] Directory not found: ${workbookDir}`);
    process.exit(2);
  }

  const files = fs.readdirSync(workbookDir)
    .filter((name) => name.toLowerCase().endsWith(".xlsx") && !name.startsWith("~$"))
    .map((name) => path.join(workbookDir, name))
    .sort();

  console.log(`[build-stones-index] Reading ${files.length} workbooks from ${workbookDir}`);

  const rowsByReport = new Map();
  const excludeCounts = { badLab: 0, missingReport: 0, badReport: 0 };
  const unknownShapes = new Map();
  const hostCounts = new Map();
  let duplicateCount = 0;
  let totalRowsRead = 0;

  for (const file of files) {
    const base = path.basename(file, ".xlsx");
    const listKey = WORKBOOK_TO_LIST[base];
    if (!listKey) {
      throw new Error(`[build-stones-index] Unmapped workbook filename: ${base}. Refusing to guess.`);
    }
    const band = bandForList(listKey);
    const mtime = fs.statSync(file).mtime;
    const listedOn = mtime.toISOString().slice(0, 10);

    const rows = readWorkbook(file);
    console.log(`  ${base}: ${rows.length} rows (listedOn ${listedOn})`);

    for (const row of rows) {
      totalRowsRead += 1;

      const {
        Stock, Shape, Weight, Color, Clarity, Cut, Polish, Sym,
        Measurement, Lab, Report,
        "Cert/Video Link": CertVideoLink,
        SellPerCt: _priceA, TotalUSD: _priceB,
      } = row;
      void _priceA; void _priceB;

      const labUpper = trimUpper(Lab);
      if (labUpper !== "IGI" && labUpper !== "GIA") {
        excludeCounts.badLab += 1;
        continue;
      }

      const rawReport = String(Report == null ? "" : Report).trim();
      const report = digitsOnly(Report);
      if (!report) {
        if (rawReport === "") excludeCounts.missingReport += 1;
        else excludeCounts.badReport += 1;
        continue;
      }

      if (rowsByReport.has(report)) {
        const existing = rowsByReport.get(report);
        if (!existing.lists.includes(listKey)) existing.lists.push(listKey);
        duplicateCount += 1;
        continue;
      }

      const shape = normaliseShape(Shape, unknownShapes);
      const weight = parseWeight(Weight);
      const measurements = normaliseMeasurements(Measurement);
      const { url: videoUrl, host: videoHost } = parseVideoLink(CertVideoLink);
      const effectiveVideoUrl = videoUrl && !isCertHost(videoHost) ? videoUrl : null;
      const effectiveVideoHost = effectiveVideoUrl ? videoHost : null;
      if (effectiveVideoHost) {
        hostCounts.set(effectiveVideoHost, (hostCounts.get(effectiveVideoHost) || 0) + 1);
      }
      const cut = Cut != null && String(Cut).trim() !== "" ? trimUpper(Cut) : null;

      rowsByReport.set(report, {
        report,
        lab: labUpper,
        shape,
        weight: weight == null ? 0 : weight,
        color: trimUpper(Color),
        clarity: trimUpper(Clarity),
        cut,
        polish: trimUpper(Polish),
        symmetry: trimUpper(Sym),
        measurements,
        stock: String(Stock == null ? "" : Stock).trim(),
        certUrl: buildCertUrl(labUpper, report),
        videoUrl: effectiveVideoUrl,
        videoHost: effectiveVideoHost,
        videoEmbeddable: false,
        lists: [listKey],
        band,
        listedOn,
      });
    }
  }

  const embeddableCache = loadEmbeddableHosts();
  const seenHosts = new Set([
    ...hostCounts.keys(),
    ...INITIAL_HOSTS_TO_PROBE.map(normaliseHost),
  ]);

  const sampleUrls = new Map();
  for (const record of rowsByReport.values()) {
    if (record.videoUrl && record.videoHost && !sampleUrls.has(record.videoHost)) {
      sampleUrls.set(record.videoHost, record.videoUrl);
    }
  }

  let probedCount = 0;
  for (const host of seenHosts) {
    if (Object.prototype.hasOwnProperty.call(embeddableCache, host)) continue;
    const sample = sampleUrls.get(host);
    if (!sample) {
      embeddableCache[host] = false;
      continue;
    }
    const result = probeEmbeddable(sample);
    embeddableCache[host] = result;
    probedCount += 1;
    console.log(`[build-stones-index] probed ${host} -> ${result}`);
  }
  saveEmbeddableHosts(embeddableCache);

  const urlCache = loadEmbeddableUrls();
  const allUrls = [];
  for (const record of rowsByReport.values()) {
    if (record.videoUrl) allUrls.push(record.videoUrl);
  }
  const { probed: urlsProbed, networkFailures: urlNetworkFailures } = await probeUrlsConcurrently(
    allUrls,
    urlCache,
    URL_PROBE_CONCURRENCY,
  );
  saveEmbeddableUrls(urlCache);

  const urlProbeUsable = allUrls.length > 0 && urlNetworkFailures < allUrls.length;

  for (const record of rowsByReport.values()) {
    if (!record.videoUrl || !record.videoHost) {
      record.videoEmbeddable = false;
      continue;
    }
    if (urlProbeUsable && Object.prototype.hasOwnProperty.call(urlCache, record.videoUrl)) {
      record.videoEmbeddable = urlCache[record.videoUrl] === true;
    } else {
      record.videoEmbeddable = embeddableCache[record.videoHost] === true;
    }
  }

  const publicOut = [...rowsByReport.values()].sort((a, b) => {
    if (a.report.length !== b.report.length) return a.report.length - b.report.length;
    return a.report.localeCompare(b.report);
  });

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_PUBLIC, JSON.stringify(publicOut, null, 2) + "\n");

  const total = publicOut.length;
  const byLab = { IGI: 0, GIA: 0 };
  let withVideo = 0;
  let withEmbeddableVideo = 0;
  const byList = {};
  for (const key of Object.keys(LIST_LABELS)) byList[key] = 0;
  for (const record of publicOut) {
    byLab[record.lab] = (byLab[record.lab] || 0) + 1;
    if (record.videoUrl) withVideo += 1;
    if (record.videoEmbeddable) withEmbeddableVideo += 1;
    for (const key of record.lists) byList[key] = (byList[key] || 0) + 1;
  }
  const now = new Date();
  const meta = {
    generatedAt: now.toISOString(),
    generatedAtLabel: formatInTimeZone(now, "Asia/Kolkata", "d MMMM yyyy"),
    total,
    byLab,
    withVideo,
    withEmbeddableVideo,
    byList,
  };
  fs.writeFileSync(OUT_META, JSON.stringify(meta, null, 2) + "\n");

  console.log("");
  console.log("=== [build-stones-index] Summary ===");
  console.log(`Rows read (all workbooks):        ${totalRowsRead}`);
  console.log(`Included (final unique records):  ${total}`);
  console.log(`Excluded: lab not IGI or GIA:     ${excludeCounts.badLab}`);
  console.log(`Excluded: missing report:         ${excludeCounts.missingReport}`);
  console.log(`Excluded: non-numeric report:     ${excludeCounts.badReport}`);
  console.log(`Duplicate reports (extra list):   ${duplicateCount}`);
  console.log(`Probed hosts this run:            ${probedCount}`);
  console.log(`Probed URLs this run:             ${urlsProbed}  (network failures: ${urlNetworkFailures})`);
  console.log(`URL probe usable (fallback flag): ${urlProbeUsable ? "yes" : "no, using per-host cache"}`);
  console.log("");
  console.log("Unknown shapes (kept as trimmed title case):");
  if (unknownShapes.size === 0) console.log("  (none)");
  for (const [shape, count] of unknownShapes) {
    console.log(`  ${shape}: ${count}`);
  }
  console.log("");
  console.log("Hosts seen (video URLs):");
  if (hostCounts.size === 0) console.log("  (none)");
  const sortedHosts = [...hostCounts.entries()].sort((a, b) => b[1] - a[1]);
  for (const [host, count] of sortedHosts) {
    const embeddable = embeddableCache[host] === true;
    console.log(`  ${host}: ${count}  videoEmbeddable=${embeddable}`);
  }
  console.log("");
  console.log(`Wrote: ${OUT_PUBLIC}`);
  console.log(`Wrote: ${OUT_META}`);
  console.log("");
  console.log("stones.meta.json:");
  console.log(JSON.stringify(meta, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
