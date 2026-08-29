import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const catalog = readFileSync("client/src/pages/PublicAvailability.tsx", "utf8");
const seoRoutes = readFileSync("server/publicSeoRoutes.ts", "utf8");

describe("public catalogue resilience and crawlability", () => {
  it("exposes explicit loading, slow-response, error, and retry states", () => {
    expect(catalog).toContain("loadingLonger");
    expect(catalog).toContain("takingLonger");
    expect(catalog).toContain("catalog.isError");
    expect(catalog).toContain("retryAvailability");
    expect(catalog).toContain('role="alert"');
    expect(catalog).toContain("aria-busy={catalog.isLoading || catalog.isFetching}");
    expect(catalog).toContain("staleTime: 30_000");
    expect(catalog).toContain("retry: 1");
    expect(catalog).toContain("refetchOnWindowFocus: false");
  });

  it("does not present empty filter controls as usable when summary data fails", () => {
    expect(catalog).toContain("summaryUnavailable");
    expect(catalog).toContain("disabled={summaryUnavailable}");
    expect(catalog).toContain("filterUnavailable");
  });

  it("records anonymous catalogue success and failure telemetry with latency and result context", () => {
    expect(catalog).toContain('"availability_catalog_loaded"');
    expect(catalog).toContain('"availability_catalog_error"');
    expect(catalog).toContain("latency_ms");
    expect(catalog).toContain("result_count");
    expect(catalog).toContain("locale");
    expect(catalog).toContain("tab");
  });

  it("keeps all public availability locales in the sitemap and leaves availability crawlable", () => {
    expect(seoRoutes).toContain('"/availability"');
    expect(seoRoutes).toContain('"/fr/availability"');
    expect(seoRoutes).toContain('"/it/availability"');
    expect(seoRoutes).not.toContain("Disallow: /availability");
  });
});
