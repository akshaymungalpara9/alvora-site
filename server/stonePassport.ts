/**
 * Stone passport routes and in-memory index.
 *
 * The build script produces server/data/stones.public.json. This module loads
 * it once at startup (dist/data first, then server/data, matching the pattern
 * in publicSeoRoutes.loadPublicRoutes) and exposes two HTTP endpoints plus a
 * synchronous getter that seoInjection.ts uses to build per-request meta.
 */

import fs from "fs";
import path from "path";
import type { Express, Request, Response } from "express";
import { formatInTimeZone } from "date-fns-tz";

export interface StoneRecord {
  report: string;
  lab: "IGI" | "GIA";
  shape: string;
  weight: number;
  color: string;
  clarity: string;
  cut: string | null;
  polish: string;
  symmetry: string;
  measurements: string;
  stock: string;
  certUrl: string;
  videoUrl: string | null;
  videoHost: string | null;
  videoEmbeddable: boolean;
  lists: string[];
  band: "yellow" | "green" | "pink" | "blue";
  listedOn: string;
}

function loadStonesPublic(): StoneRecord[] {
  const candidates = [
    path.resolve(import.meta.dirname, "data", "stones.public.json"),
    path.resolve(import.meta.dirname, "..", "server", "data", "stones.public.json"),
    path.resolve(import.meta.dirname, "..", "data", "stones.public.json"),
  ];
  for (const p of candidates) {
    try {
      const raw = fs.readFileSync(p, "utf-8");
      return JSON.parse(raw) as StoneRecord[];
    } catch {
      /* try next */
    }
  }
  console.warn("[stonePassport] stones.public.json not found in any candidate path; passport will 404 every request");
  return [];
}

interface StoneMeta {
  generatedAt: string;
  generatedAtLabel?: string;
  total: number;
  byLab: { IGI: number; GIA: number };
  withVideo: number;
  withEmbeddableVideo: number;
  byList: Record<string, number>;
}

function loadStonesMeta(): StoneMeta | null {
  const candidates = [
    path.resolve(import.meta.dirname, "data", "stones.meta.json"),
    path.resolve(import.meta.dirname, "..", "server", "data", "stones.meta.json"),
    path.resolve(import.meta.dirname, "..", "data", "stones.meta.json"),
  ];
  for (const p of candidates) {
    try {
      const raw = fs.readFileSync(p, "utf-8");
      return JSON.parse(raw) as StoneMeta;
    } catch {
      /* try next */
    }
  }
  console.warn("[stonePassport] stones.meta.json not found; /api/stone/ledger will 503 every request");
  return null;
}

const STONES = loadStonesPublic();
const STONES_BY_REPORT = new Map<string, StoneRecord>(STONES.map((s) => [s.report, s]));
const STONES_META = loadStonesMeta();

/** Candidates for the daily rotation: IGI stones with an embeddable video, sorted by report ascending. */
const TODAY_CANDIDATES: readonly StoneRecord[] = STONES
  .filter((s) => s.lab === "IGI" && s.videoUrl !== null && s.videoEmbeddable)
  .slice()
  .sort((a, b) => {
    if (a.report.length !== b.report.length) return a.report.length - b.report.length;
    return a.report.localeCompare(b.report);
  });

const MS_PER_DAY = 86_400_000;
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/** Days since epoch in Asia/Kolkata (add 5.5 hours before flooring). */
export function daysSinceEpochIST(now: number = Date.now()): number {
  return Math.floor((now + IST_OFFSET_MS) / MS_PER_DAY);
}

/** Today's stone by the daysSinceEpoch mod length formula. */
export function selectTodayCandidate(now: number = Date.now()): StoneRecord | null {
  if (TODAY_CANDIDATES.length === 0) return null;
  const index = daysSinceEpochIST(now) % TODAY_CANDIDATES.length;
  return TODAY_CANDIDATES[index];
}

/** Uniformly random candidate whose report is not equal to exclude. Returns null when no valid candidate remains. */
export function selectAnotherCandidate(exclude: string): StoneRecord | null {
  const pool = TODAY_CANDIDATES.filter((s) => s.report !== exclude);
  if (pool.length === 0) return null;
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}

function todayLabel(now: number = Date.now()): string {
  return formatInTimeZone(new Date(now), "Asia/Kolkata", "d MMMM yyyy");
}

/** Today's stone with a formatted dateLabel, used by both /today and /another. */
function withDateLabel(record: StoneRecord): StoneRecord & { dateLabel: string } {
  return { ...record, dateLabel: todayLabel() };
}

/** Exposed so HeroStone's server hydration can compute the same record synchronously in seoInjection. */
export function getStoneOfToday(now: number = Date.now()): (StoneRecord & { dateLabel: string }) | null {
  const record = selectTodayCandidate(now);
  if (!record) return null;
  return { ...record, dateLabel: todayLabel(now) };
}

export function getStonesMetaSnapshot(): StoneMeta | null {
  return STONES_META;
}

/** Synchronous lookup used by both the HTTP layer and seoInjection. */
export function getStone(report: string): StoneRecord | undefined {
  return STONES_BY_REPORT.get(report);
}

/** Snapshot count used by health/diagnostics; not part of the public API surface. */
export function stonesLoadedCount(): number {
  return STONES_BY_REPORT.size;
}

const REPORT_PATTERN = /^\d{6,12}$/;

function serveStone(request: Request, response: Response) {
  const report = String(request.params.report ?? "");
  if (!REPORT_PATTERN.test(report)) {
    response.status(404).json({ error: "not_found" });
    return;
  }
  const record = STONES_BY_REPORT.get(report);
  if (!record) {
    response.status(404).json({ error: "not_found" });
    return;
  }
  response.set("Cache-Control", "public, max-age=300");
  response.status(200).json(record);
}

function serveExists(request: Request, response: Response) {
  const raw = String(request.query.reports ?? "").trim();
  if (!raw) {
    response.status(400).json({ error: "bad_request" });
    return;
  }
  const reports = raw.split(",").map((s) => s.trim()).filter(Boolean);
  if (reports.length === 0 || reports.length > 60) {
    response.status(400).json({ error: "bad_request" });
    return;
  }
  const result: Record<string, boolean> = {};
  for (const report of reports) {
    if (!REPORT_PATTERN.test(report)) {
      response.status(400).json({ error: "bad_request" });
      return;
    }
    result[report] = STONES_BY_REPORT.has(report);
  }
  response.set("Cache-Control", "public, max-age=3600");
  response.status(200).json(result);
}

function serveToday(_request: Request, response: Response) {
  const record = getStoneOfToday();
  if (!record) {
    response.status(503).json({ error: "no_candidates" });
    return;
  }
  response.set("Cache-Control", "public, max-age=3600");
  response.status(200).json(record);
}

function serveAnother(request: Request, response: Response) {
  const exclude = String(request.query.exclude ?? "").trim();
  const candidate = selectAnotherCandidate(exclude);
  if (!candidate) {
    response.status(503).json({ error: "no_candidates" });
    return;
  }
  response.set("Cache-Control", "no-store");
  response.status(200).json(withDateLabel(candidate));
}

function serveLedger(_request: Request, response: Response) {
  if (!STONES_META) {
    response.status(503).json({ error: "no_meta" });
    return;
  }
  const generatedAtLabel = formatInTimeZone(new Date(STONES_META.generatedAt), "Asia/Kolkata", "d MMMM yyyy");
  response.set("Cache-Control", "public, max-age=3600");
  response.status(200).json({ ...STONES_META, generatedAtLabel });
}

export function registerStonePassportRoutes(app: Express) {
  app.get("/api/stone/exists", serveExists);
  app.get("/api/stone/today", serveToday);
  app.get("/api/stone/another", serveAnother);
  app.get("/api/stone/ledger", serveLedger);
  app.get("/api/stone/:report", serveStone);
}
