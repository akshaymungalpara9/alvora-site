import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getOperationsOverview: vi.fn() }));
vi.mock("./db", () => mocks);

import { adminOperationsRouter } from "./routers/operations";

const overview = {
  productionBriefs: { total: 3, new: 1, active: 2, failedAlerts: 1, recent: [] },
  privateRequests: { total: 0, failedAlerts: 0 },
  inventory: { total: 100, incomplete: 100, isReady: false },
  buyerRollout: { activationEnabled: false, accountsCreated: 0, accountsApproved: 0 },
};

const makeContext = (role: "admin" | "user") => ({
  user: {
    id: 7,
    openId: "operations-workflow-test",
    name: "Operations Test",
    email: "ops@alvora.example",
    loginMethod: "email",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  },
  req: { protocol: "https", get: () => "alvora.example" },
  res: {},
});

describe("operations overview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getOperationsOverview.mockResolvedValue(overview);
  });

  it("returns live readiness and attention metrics to an administrator", async () => {
    const caller = adminOperationsRouter.createCaller(makeContext("admin") as any);
    await expect(caller.overview()).resolves.toEqual(overview);
    expect(mocks.getOperationsOverview).toHaveBeenCalledTimes(1);
  });

  it("rejects operations metrics for non-admin sessions", async () => {
    const caller = adminOperationsRouter.createCaller(makeContext("user") as any);
    await expect(caller.overview()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
