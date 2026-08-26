import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("failed alert retry control", () => {
  it("renders a retry action only for failed alerts and keeps its pending state explicit", () => {
    const page = readFileSync("client/src/pages/AdminProductionBriefs.tsx", "utf8");
    const styles = readFileSync("client/src/index.css", "utf8");
    expect(page).toContain('item.alertStatus === "failed"');
    expect(page).toContain("retryAlert.mutate({ briefId: item.id })");
    expect(page).toContain("retryAlert.isPending");
    expect(page).toContain("Retry internal alert");
    expect(styles).toContain(".brief-retry-button");
  });
});
