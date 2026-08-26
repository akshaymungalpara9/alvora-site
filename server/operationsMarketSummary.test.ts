import { describe, expect, it } from "vitest";
import { summarizeProductionBriefMarkets } from "./db";

describe("production-brief market summary", () => {
  it("separates global, French, Italian, US, and Canadian workload without inventing missing market records", () => {
    const summary = summarizeProductionBriefMarkets([
      { market: "FR", followUpStatus: "new", alertStatus: "failed" },
      { market: "FR", followUpStatus: "quoted", alertStatus: "sent" },
      { market: "US", followUpStatus: "closed", alertStatus: "sent" },
      { market: "CA", followUpStatus: "reviewing", alertStatus: "pending" },
      { market: "GLOBAL", followUpStatus: "on_hold", alertStatus: "sent" },
    ] as any);

    expect(summary.FR).toEqual({ total: 2, new: 1, active: 2, failedAlerts: 1 });
    expect(summary.US).toEqual({ total: 1, new: 0, active: 0, failedAlerts: 0 });
    expect(summary.CA).toEqual({ total: 1, new: 0, active: 1, failedAlerts: 0 });
    expect(summary.IT).toEqual({ total: 0, new: 0, active: 0, failedAlerts: 0 });
    expect(summary.GLOBAL).toEqual({ total: 1, new: 0, active: 1, failedAlerts: 0 });
  });
});
