import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createHeartbeatJob: vi.fn(),
  createProductionBrief: vi.fn(),
  getProductionBriefById: vi.fn(),
  getQualifierFollowUpSchedule: vi.fn(),
  listProductionBriefs: vi.fn(),
  markProductionBriefAlert: vi.fn(),
  saveQualifierFollowUpSchedule: vi.fn(),
  sendProductionBriefAcknowledgement: vi.fn(),
  sendTransactionalEmail: vi.fn(),
  updateHeartbeatJob: vi.fn(),
  updateProductionBriefFollowUp: vi.fn(),
}));

vi.mock("./db", () => mocks);
vi.mock("./email", () => ({ escapeHtml: (value: string) => value, sendTransactionalEmail: mocks.sendTransactionalEmail }));
vi.mock("./_core/heartbeat", () => ({ createHeartbeatJob: mocks.createHeartbeatJob, updateHeartbeatJob: mocks.updateHeartbeatJob }));
vi.mock("./qualifierFollowUps", () => ({ sendProductionBriefAcknowledgement: mocks.sendProductionBriefAcknowledgement }));

import { adminProductionBriefRouter } from "./routers/briefs";

const adminContext = {
  user: { id: 8, openId: "admin", name: "Admin", email: "admin@alvora.example", loginMethod: "email", role: "admin" as const, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
  req: { headers: { cookie: "app_session_id=admin-token" }, protocol: "https", get: () => "alvora.example" },
  res: {},
};

describe("qualifier follow-up scheduler control", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createHeartbeatJob.mockResolvedValue({ taskUid: "cron-qualifier-1", nextExecutionAt: "2026-08-26T13:00:00Z" });
    mocks.saveQualifierFollowUpSchedule.mockResolvedValue({ id: 1, scheduleCronTaskUid: "cron-qualifier-1", isEnabled: true });
  });

  it("allows an administrator to create and persist the hourly project job", async () => {
    mocks.getQualifierFollowUpSchedule.mockResolvedValue(undefined);
    const caller = adminProductionBriefRouter.createCaller(adminContext as any);
    await expect(caller.enableQualifierFollowUps()).resolves.toMatchObject({ nextExecutionAt: "2026-08-26T13:00:00Z" });
    expect(mocks.createHeartbeatJob).toHaveBeenCalledWith(expect.objectContaining({ cron: "0 0 * * * *", path: "/api/scheduled/qualifier-follow-ups" }), "admin-token");
    expect(mocks.saveQualifierFollowUpSchedule).toHaveBeenCalledWith({ taskUid: "cron-qualifier-1", isEnabled: true });
  });

  it("re-enables the existing task rather than creating a duplicate", async () => {
    mocks.getQualifierFollowUpSchedule.mockResolvedValue({ id: 1, scheduleCronTaskUid: "cron-existing", isEnabled: false });
    mocks.updateHeartbeatJob.mockResolvedValue({ nextExecutionAt: "2026-08-26T14:00:00Z" });
    const caller = adminProductionBriefRouter.createCaller(adminContext as any);
    await caller.enableQualifierFollowUps();
    expect(mocks.updateHeartbeatJob).toHaveBeenCalledWith("cron-existing", expect.objectContaining({ enable: true, path: "/api/scheduled/qualifier-follow-ups" }), "admin-token");
    expect(mocks.createHeartbeatJob).not.toHaveBeenCalled();
    expect(mocks.saveQualifierFollowUpSchedule).toHaveBeenCalledWith({ taskUid: "cron-existing", isEnabled: true });
  });
});
