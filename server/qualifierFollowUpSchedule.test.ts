import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  authenticateRequest: vi.fn(),
  getQualifierFollowUpScheduleByTaskUid: vi.fn(),
  recordQualifierFollowUpRun: vi.fn(),
  runDueQualifierFollowUps: vi.fn(),
}));

vi.mock("./db", () => ({ getQualifierFollowUpScheduleByTaskUid: mocks.getQualifierFollowUpScheduleByTaskUid, recordQualifierFollowUpRun: mocks.recordQualifierFollowUpRun }));
vi.mock("./qualifierFollowUps", () => ({ runDueQualifierFollowUps: mocks.runDueQualifierFollowUps }));
vi.mock("./_core/sdk", () => ({ sdk: { authenticateRequest: mocks.authenticateRequest } }));

import { registerQualifierFollowUpSchedule } from "./qualifierFollowUpSchedule";

function setup() {
  let handler: ((req: any, res: any) => Promise<any>) | undefined;
  registerQualifierFollowUpSchedule({ post: (_path: string, next: typeof handler) => { handler = next; } } as any);
  const response = { status: vi.fn(), json: vi.fn() } as any;
  response.status.mockReturnValue(response);
  return { handler: handler!, response };
}

describe("qualifier follow-up scheduled callback", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects callers that are not authenticated cron identities", async () => {
    mocks.authenticateRequest.mockResolvedValue({ isCron: false });
    const { handler, response } = setup();
    await handler({ path: "/api/scheduled/qualifier-follow-ups" }, response);
    expect(response.status).toHaveBeenCalledWith(403);
    expect(response.json).toHaveBeenCalledWith({ error: "cron-only" });
  });

  it("safely skips orphaned or disabled jobs", async () => {
    mocks.authenticateRequest.mockResolvedValue({ isCron: true, taskUid: "cron-1" });
    mocks.getQualifierFollowUpScheduleByTaskUid.mockResolvedValue(undefined);
    const { handler, response } = setup();
    await handler({ path: "/api/scheduled/qualifier-follow-ups" }, response);
    expect(response.json).toHaveBeenCalledWith({ ok: true, skipped: "disabled-or-orphan" });
    expect(mocks.runDueQualifierFollowUps).not.toHaveBeenCalled();
  });

  it("safely skips a persisted schedule that an administrator has disabled", async () => {
    mocks.authenticateRequest.mockResolvedValue({ isCron: true, taskUid: "cron-disabled" });
    mocks.getQualifierFollowUpScheduleByTaskUid.mockResolvedValue({ id: 5, isEnabled: false });
    const { handler, response } = setup();
    await handler({ path: "/api/scheduled/qualifier-follow-ups" }, response);
    expect(response.json).toHaveBeenCalledWith({ ok: true, skipped: "disabled-or-orphan" });
    expect(mocks.runDueQualifierFollowUps).not.toHaveBeenCalled();
    expect(mocks.recordQualifierFollowUpRun).not.toHaveBeenCalled();
  });

  it("runs only the persisted enabled schedule and records its execution", async () => {
    mocks.authenticateRequest.mockResolvedValue({ isCron: true, taskUid: "cron-1" });
    mocks.getQualifierFollowUpScheduleByTaskUid.mockResolvedValue({ id: 4, isEnabled: true });
    mocks.runDueQualifierFollowUps.mockResolvedValue({ checked: 2, sent: 1, skipped: 1, failed: 0 });
    const { handler, response } = setup();
    await handler({ path: "/api/scheduled/qualifier-follow-ups" }, response);
    expect(mocks.recordQualifierFollowUpRun).toHaveBeenCalledWith(4, {});
    expect(response.json).toHaveBeenCalledWith({ ok: true, checked: 2, sent: 1, skipped: 1, failed: 0 });
  });
});
