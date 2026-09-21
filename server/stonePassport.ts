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

const STONES = loadStonesPublic();
const STONES_BY_REPORT = new Map<string, StoneRecord>(STONES.map((s) => [s.report, s]));

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

export function registerStonePassportRoutes(app: Express) {
  app.get("/api/stone/exists", serveExists);
  app.get("/api/stone/:report", serveStone);
}
