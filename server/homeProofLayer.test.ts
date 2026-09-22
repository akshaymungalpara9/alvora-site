import { describe, expect, it, beforeAll, afterAll } from "vitest";
import express from "express";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  registerStonePassportRoutes,
  selectTodayCandidate,
  daysSinceEpochIST,
  type StoneRecord,
} from "./stonePassport";
import { HeroStoneView } from "../client/src/components/HeroStone";
import { StockLedgerView } from "../client/src/components/StockLedger";

let serverBase = "";
let server: http.Server;

beforeAll(async () => {
  const app = express();
  registerStonePassportRoutes(app);
  server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const addr = server.address();
  const port = typeof addr === "object" && addr !== null ? addr.port : 0;
  serverBase = `http://127.0.0.1:${port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
});

const stonesDir = path.resolve(import.meta.dirname, "data");
const stonesPath = path.join(stonesDir, "stones.public.json");
const metaPath = path.join(stonesDir, "stones.meta.json");
const stones = JSON.parse(fs.readFileSync(stonesPath, "utf-8")) as StoneRecord[];
const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8")) as {
  generatedAt: string;
  total: number;
  byLab: { IGI: number; GIA: number };
  withVideo: number;
  withEmbeddableVideo: number;
  byList: Record<string, number>;
};

const igiWithVideo = stones.find((s) => s.lab === "IGI" && s.videoUrl);
if (!igiWithVideo) {
  throw new Error("Expected at least one IGI record with videoUrl for the today rotation tests");
}

describe("GET /api/stone/today", () => {
  it("returns an IGI record with videoUrl not null", async () => {
    const res = await fetch(`${serverBase}/api/stone/today`);
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toMatch(/public, max-age=3600/);
    const body = (await res.json()) as StoneRecord & { dateLabel: string };
    expect(body.lab).toBe("IGI");
    expect(body.videoUrl).not.toBeNull();
    expect(typeof body.dateLabel).toBe("string");
  });

  it("two calls within one second return the same report", async () => {
    const r1 = (await (await fetch(`${serverBase}/api/stone/today`)).json()) as StoneRecord;
    const r2 = (await (await fetch(`${serverBase}/api/stone/today`)).json()) as StoneRecord;
    expect(r1.report).toBe(r2.report);
  });

  it("matches the daysSinceEpoch mod length formula for today's Asia/Kolkata date", async () => {
    const now = Date.now();
    const expected = selectTodayCandidate(now);
    expect(expected).not.toBeNull();
    const res = await fetch(`${serverBase}/api/stone/today`);
    const body = (await res.json()) as StoneRecord;
    expect(body.report).toBe(expected!.report);
    expect(daysSinceEpochIST(now)).toBeGreaterThan(0);
  });
});

describe("GET /api/stone/another", () => {
  it("returns a record whose report is not the excluded one, across 50 sequential calls", async () => {
    const res = await fetch(`${serverBase}/api/stone/today`);
    const seed = (await res.json()) as StoneRecord;
    for (let i = 0; i < 50; i += 1) {
      const r = await fetch(`${serverBase}/api/stone/another?exclude=${seed.report}`);
      expect(r.status).toBe(200);
      expect(r.headers.get("cache-control")).toMatch(/no-store/);
      const body = (await r.json()) as StoneRecord & { dateLabel: string };
      expect(body.report).not.toBe(seed.report);
      expect(body.lab).toBe("IGI");
      expect(body.videoUrl).not.toBeNull();
    }
  });
});

describe("GET /api/stone/ledger", () => {
  it("figures equal stones.meta.json exactly", async () => {
    const res = await fetch(`${serverBase}/api/stone/ledger`);
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toMatch(/public, max-age=3600/);
    const body = (await res.json()) as typeof meta & { generatedAtLabel: string };
    expect(body.byLab.IGI).toBe(meta.byLab.IGI);
    expect(body.byLab.GIA).toBe(meta.byLab.GIA);
    expect(body.withVideo).toBe(meta.withVideo);
    expect(Object.keys(body.byList).length).toBe(Object.keys(meta.byList).length);
    expect(typeof body.generatedAtLabel).toBe("string");
  });
});

describe("ledger staleness", () => {
  it("stones.meta.generatedAt is within 45 days of now (Run pnpm stones:build with the current Client Send Lists)", () => {
    const generatedAt = new Date(meta.generatedAt).getTime();
    const now = Date.now();
    const days = (now - generatedAt) / (24 * 60 * 60 * 1000);
    if (days > 45) {
      throw new Error("Run pnpm stones:build with the current Client Send Lists");
    }
    expect(days).toBeLessThanOrEqual(45);
  });
});

describe("HeroStoneView render", () => {
  const baseRecord = {
    ...igiWithVideo,
    dateLabel: "22 September 2026",
  };

  it("renders 'Open 360 video' text and no iframe when videoEmbeddable is false", () => {
    const record = { ...baseRecord, videoEmbeddable: false, videoUrl: "https://example.test/vid" };
    const html = renderToStaticMarkup(React.createElement(HeroStoneView, { record }));
    expect(html).toContain("Open 360 video");
    expect(html.includes("<iframe")).toBe(false);
  });

  it("renders one iframe with src equal to videoUrl when videoEmbeddable is true", () => {
    const record = { ...baseRecord, videoEmbeddable: true, videoUrl: "https://example.test/vid" };
    const html = renderToStaticMarkup(React.createElement(HeroStoneView, { record }));
    const matches = html.match(/<iframe/g) ?? [];
    expect(matches.length).toBe(1);
    expect(html).toContain('src="https://example.test/vid"');
  });

  it("rendered HTML contains no price identifiers or U+2014", () => {
    const record = { ...baseRecord, videoEmbeddable: true, videoUrl: "https://example.test/vid" };
    const html = renderToStaticMarkup(React.createElement(HeroStoneView, { record }));
    expect(html.includes("$")).toBe(false);
    expect(html.includes("USD")).toBe(false);
    expect(html.toLowerCase().includes("price")).toBe(false);
    expect(html.includes("—")).toBe(false);
  });
});

describe("StockLedgerView render", () => {
  it("figures render en-IN with a thousands separator when the value is >= 1000", () => {
    const mockData = {
      generatedAt: new Date().toISOString(),
      generatedAtLabel: "22 September 2026",
      total: 3185,
      byLab: { IGI: 3151, GIA: 34 },
      withVideo: 1195,
      withEmbeddableVideo: 1191,
      byList: Object.fromEntries(Array.from({ length: 16 }, (_, i) => [`k${i}`, i + 1])),
    };
    const html = renderToStaticMarkup(React.createElement(StockLedgerView, { data: mockData }));
    expect(html).toContain("3,151");
    expect(html).toContain("1,195");
    expect(html).toContain("16");
    expect(html).toContain("Certified stones with passports");
  });
});

describe("plates directory", () => {
  const platesDir = path.resolve(import.meta.dirname, "..", "client", "public", "assets", "plates");
  if (!fs.existsSync(platesDir)) {
    it("plates directory exists", () => {
      throw new Error(`Expected ${platesDir} to exist after pnpm plates:build`);
    });
  } else {
    const files = fs.readdirSync(platesDir);
    it("no plate file exceeds 220 KB", () => {
      for (const name of files) {
        const stat = fs.statSync(path.join(platesDir, name));
        expect(stat.size).toBeLessThanOrEqual(220 * 1024);
      }
    });
    it("no filename references excluded slots (F4, F6, F9)", () => {
      for (const name of files) {
        expect(name).not.toMatch(/F4|F6|F9/);
      }
    });
  }
});

describe("price-field scan for home-proof source files", () => {
  const filesToScan = [
    path.resolve(import.meta.dirname, "..", "client", "src", "components", "HeroStone.tsx"),
    path.resolve(import.meta.dirname, "..", "client", "src", "components", "StockLedger.tsx"),
    path.resolve(import.meta.dirname, "..", "client", "src", "components", "PlateSpread.tsx"),
    path.resolve(import.meta.dirname, "..", "client", "src", "pages", "home-proof.css"),
  ];
  const bans = [/sellperct/i, /totalusd/i, /\busd\b/i, /\bprice\b/i];

  for (const file of filesToScan) {
    it(`${path.basename(file)} contains no price identifiers`, () => {
      const src = fs.readFileSync(file, "utf-8");
      for (const ban of bans) {
        expect(src).not.toMatch(ban);
      }
    });
  }
});

describe("prerender snapshot of /", () => {
  const rootManifest = path.resolve(import.meta.dirname, "..", "prerendered", "manifest.json");
  const distManifest = path.resolve(import.meta.dirname, "..", "dist", "prerendered", "manifest.json");
  const candidates = [distManifest, rootManifest];
  const foundManifest = candidates.find((p) => fs.existsSync(p));
  if (!foundManifest) {
    it.skip("prerender manifest not available (run pnpm build first)", () => {});
    return;
  }
  const manifest = JSON.parse(fs.readFileSync(foundManifest, "utf-8")) as Record<string, string>;
  const indexSnapshot = manifest["/"];
  if (!indexSnapshot) {
    it.skip("no / snapshot in prerender manifest", () => {});
    return;
  }
  const snapshotPath = path.join(path.dirname(foundManifest), indexSnapshot);
  if (!fs.existsSync(snapshotPath)) {
    it.skip("snapshot file missing", () => {});
    return;
  }
  const snapshot = fs.readFileSync(snapshotPath, "utf-8");

  it("contains an IGI report number, ledger heading and 1.350 ct caption", () => {
    expect(snapshot).toMatch(/IGI \d{6,12}/);
    expect(snapshot).toContain("Certified stones with passports");
    expect(snapshot).toContain("Scale reads 1.350 ct");
  });

  it("contains the two-track lead-time sentence starting with the resolved stockShort", () => {
    expect(snapshot).toContain("Standard specifications ship in 1 to 5 working days");
  });

  it("does not contain removed or forbidden strings", () => {
    expect(snapshot).not.toContain("LIVE PRODUCTION PROFILES");
    expect(snapshot.toLowerCase()).not.toContain("supply partner");
    expect(snapshot).not.toContain(" IEC ");
    expect(snapshot).not.toContain(" GST ");
    // Whole-page em-dash absence is Prompt 4's eyebrow-purge scope; here we
    // only assert the new home-proof surfaces are em-dash-free.
    const newContent = [
      snapshot.substring(snapshot.indexOf("hero-stone"), snapshot.indexOf("hero-stone") + 4000),
      snapshot.substring(
        snapshot.indexOf("Certified stones with passports"),
        snapshot.indexOf("Certified stones with passports") + 2000
      ),
      snapshot.substring(snapshot.indexOf("plate-spread"), snapshot.indexOf("plate-spread") + 4000),
      snapshot.substring(snapshot.indexOf("footer-registrations"), snapshot.indexOf("footer-registrations") + 500),
    ].join(" ");
    expect(newContent.includes("—")).toBe(false);
  });
});
