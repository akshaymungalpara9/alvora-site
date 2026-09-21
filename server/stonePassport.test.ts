import { describe, expect, it, beforeAll, afterAll, beforeEach } from "vitest";
import express from "express";
import http from "node:http";
import { readFileSync } from "node:fs";
import path from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { registerStonePassportRoutes, type StoneRecord } from "./stonePassport";
import { StonePassportView } from "../client/src/pages/StonePassport";

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

const stonesPath = path.resolve(import.meta.dirname, "data", "stones.public.json");
const stones = JSON.parse(readFileSync(stonesPath, "utf-8")) as StoneRecord[];
const igiRecord = stones.find((s) => s.lab === "IGI");
const giaRecord = stones.find((s) => s.lab === "GIA");
if (!igiRecord || !giaRecord) {
  throw new Error("Expected at least one IGI and one GIA record in stones.public.json for tests");
}

const knownIgi = igiRecord;
const knownGia = giaRecord;

describe("GET /api/stone/:report", () => {
  it("returns the record with Cache-Control public max-age=300 and no price leak", async () => {
    const res = await fetch(`${serverBase}/api/stone/${knownIgi.report}`);
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toMatch(/public, max-age=300/);
    const body = await res.text();
    expect(body).not.toMatch(/sellperct|totalusd|usd|\$|price/i);
    const record = JSON.parse(body) as StoneRecord;
    expect(record.report).toBe(knownIgi.report);
  });

  it("returns 404 for an unknown numeric report", async () => {
    const res = await fetch(`${serverBase}/api/stone/000000`);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body).toEqual({ error: "not_found" });
  });

  it("returns 404 for a non-numeric report", async () => {
    const res = await fetch(`${serverBase}/api/stone/abc`);
    expect(res.status).toBe(404);
  });

  it("returns 404 for a report with fewer than six digits", async () => {
    const res = await fetch(`${serverBase}/api/stone/12345`);
    expect(res.status).toBe(404);
  });
});

describe("GET /api/stone/exists", () => {
  it("returns a boolean map with Cache-Control public max-age=3600", async () => {
    const res = await fetch(`${serverBase}/api/stone/exists?reports=${knownIgi.report},000000`);
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toMatch(/public, max-age=3600/);
    const body = (await res.json()) as Record<string, boolean>;
    expect(body[knownIgi.report]).toBe(true);
    expect(body["000000"]).toBe(false);
  });

  it("returns 400 when more than 60 reports are supplied", async () => {
    const list = Array.from({ length: 61 }, (_, i) => String(100000 + i)).join(",");
    const res = await fetch(`${serverBase}/api/stone/exists?reports=${list}`);
    expect(res.status).toBe(400);
  });

  it("returns 400 when reports contain malformed values", async () => {
    const res = await fetch(`${serverBase}/api/stone/exists?reports=abc,${knownIgi.report}`);
    expect(res.status).toBe(400);
  });

  it("returns 400 when reports is missing", async () => {
    const res = await fetch(`${serverBase}/api/stone/exists`);
    expect(res.status).toBe(400);
  });
});

describe("seoInjection for /stone/:report", () => {
  const baseHtml =
    '<!doctype html><html lang="en"><head><title>Alvora</title><meta name="description" content="x" /></head><body><div id="root"></div></body></html>';

  beforeEach(() => {
    delete process.env.STONE_PASSPORT_INDEXABLE;
  });

  it("carries noindex,nofollow and the report number in the title when indexable is false", async () => {
    process.env.STONE_PASSPORT_INDEXABLE = "false";
    const { injectSeoIntoHtml } = await import("./seoInjection");
    const html = injectSeoIntoHtml(baseHtml, `/stone/${knownIgi.report}`, "https://www.alvoradiamonds.com");
    expect(html).toContain("noindex,nofollow");
    const titleMatch = /<title>([^<]+)<\/title>/.exec(html);
    expect(titleMatch).not.toBeNull();
    expect(titleMatch![1]).toContain(knownIgi.report);
  });

  it("omits noindex when indexable is true", async () => {
    process.env.STONE_PASSPORT_INDEXABLE = "true";
    const { injectSeoIntoHtml } = await import("./seoInjection");
    const html = injectSeoIntoHtml(baseHtml, `/stone/${knownIgi.report}`, "https://www.alvoradiamonds.com");
    expect(html).not.toContain("noindex");
  });
});

describe("StonePassportView render", () => {
  const embeddable: StoneRecord = { ...knownIgi, videoEmbeddable: true, videoUrl: "https://example.test/vid" };
  const nonEmbeddable: StoneRecord = { ...knownIgi, videoEmbeddable: false, videoUrl: "https://example.test/vid" };

  it("renders the 'Open 360 video' link and no iframe when videoEmbeddable is false", () => {
    const html = renderToStaticMarkup(React.createElement(StonePassportView, { record: nonEmbeddable }));
    expect(html).toContain("Open 360 video");
    expect(html.includes("<iframe")).toBe(false);
  });

  it("renders exactly one iframe with src equal to videoUrl when videoEmbeddable is true", () => {
    const html = renderToStaticMarkup(React.createElement(StonePassportView, { record: embeddable }));
    const matches = html.match(/<iframe/g) ?? [];
    expect(matches.length).toBe(1);
    expect(html).toContain(`src="${embeddable.videoUrl}"`);
  });

  it("rendered HTML contains no $, no USD, no price, and no U+2014", () => {
    const html = renderToStaticMarkup(React.createElement(StonePassportView, { record: knownIgi }));
    expect(html.includes("$")).toBe(false);
    expect(html.includes("USD")).toBe(false);
    expect(html.toLowerCase().includes("price")).toBe(false);
    expect(html.includes("—")).toBe(false);
  });

  it("GIA record shows 'GIA <report>' in the H1 and 'Opened on gia.edu' in the DOM", () => {
    const html = renderToStaticMarkup(React.createElement(StonePassportView, { record: knownGia }));
    expect(html).toContain(`GIA ${knownGia.report}`);
    expect(html).toContain("Opened on gia.edu");
    expect(html).toContain("gia.edu");
    expect(html).not.toContain("Opened on igi.org");
  });
});

describe("price-field scan for passport source files", () => {
  const filesToScan = [
    path.resolve(import.meta.dirname, "..", "client", "src", "pages", "StonePassport.tsx"),
    path.resolve(import.meta.dirname, "stonePassport.ts"),
  ];
  const bans = [/sellperct/i, /totalusd/i, /\busd\b/i, /\bprice\b/i];

  for (const file of filesToScan) {
    it(`${path.basename(file)} contains no price identifiers`, () => {
      const src = readFileSync(file, "utf-8");
      for (const ban of bans) {
        expect(src).not.toMatch(ban);
      }
    });
  }
});
