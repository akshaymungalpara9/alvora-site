import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("route-level client bundle deferral", () => {
  it("defers protected buyer and admin modules while retaining an accessible loading fallback", () => {
    const app = readFileSync("client/src/App.tsx", "utf8");
    for (const page of ["AdminBuyers", "AdminOperations", "AdminProductionBriefs", "BuyerAvailability"]) {
      expect(app).toContain(`lazy(() => import("./pages/${page}"))`);
    }
    expect(app).toContain('<Suspense fallback={<RouteLoadingFallback />}>');
    expect(app).toContain('role="status" aria-live="polite"');
  });
});
