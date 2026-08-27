import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("route-level client bundle deferral", () => {
  it("defers protected administrative and market-specific modules while retaining an accessible loading fallback", () => {
    const app = readFileSync("client/src/App.tsx", "utf8");
    for (const page of ["AdminBuyers", "AdminOperations", "AdminProductionBriefs"]) {
      expect(app).toContain(`lazy(() => import("./pages/${page}"))`);
    }
    expect(app).not.toContain('lazy(() => import("./pages/BuyerAvailability"))');
    expect(app).toContain('<Route path="/buyer-availability">{() => <PublicAvailability />}</Route>');
    expect(app).toContain('lazy(() => import("./pages/MarketLanding"))');
    expect(app).toContain('<Route path="/fr">{() => <MarketLanding variant="fr" />}</Route>');
    expect(app).toContain('<Route path="/it">{() => <MarketLanding variant="it" />}</Route>');
    expect(app).toContain('<Route path="/us">{() => <MarketLanding variant="us" />}</Route>');
    expect(app).toContain('<Suspense fallback={<RouteLoadingFallback />}>');
    expect(app).toContain('role="status" aria-live="polite"');
  });
});
