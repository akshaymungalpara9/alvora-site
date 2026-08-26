import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  claimProductionBriefQualifierFollowUp: vi.fn(),
  createEmailLog: vi.fn(),
  getDueQualifierFollowUps: vi.fn(),
  markEmailLog: vi.fn(),
  markProductionBriefAcknowledgement: vi.fn(),
  markProductionBriefQualifierFollowUp: vi.fn(),
  sendTransactionalEmail: vi.fn(),
}));

vi.mock("./db", () => mocks);
vi.mock("./email", () => ({ escapeHtml: (value: string) => value, sendTransactionalEmail: mocks.sendTransactionalEmail }));

import { runDueQualifierFollowUps } from "./qualifierFollowUps";

const dueBrief = {
  id: 71,
  market: "US",
  contactName: "Morgan Lee",
  email: "morgan@atelier.example",
  requestType: "Custom / made-to-spec.",
};

describe("hourly qualifier follow-up", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getDueQualifierFollowUps.mockResolvedValue([dueBrief]);
    mocks.claimProductionBriefQualifierFollowUp.mockResolvedValue(true);
    mocks.createEmailLog.mockResolvedValue(202);
    mocks.sendTransactionalEmail.mockResolvedValue({ id: "resend-qualifier-71" });
  });

  it("claims and records one due follow-up before sending it", async () => {
    const now = new Date("2026-08-26T12:00:00.000Z");
    await expect(runDueQualifierFollowUps(now)).resolves.toMatchObject({ checked: 1, sent: 1, skipped: 0, failed: 0 });
    expect(mocks.getDueQualifierFollowUps).toHaveBeenCalledWith(new Date("2026-08-25T12:00:00.000Z"));
    expect(mocks.claimProductionBriefQualifierFollowUp).toHaveBeenCalledWith(71);
    expect(mocks.createEmailLog).toHaveBeenCalledWith(expect.objectContaining({ productionBriefId: 71, emailType: "public_brief_qualifier_follow_up" }));
    expect(mocks.sendTransactionalEmail).toHaveBeenCalledWith(expect.objectContaining({ to: "morgan@atelier.example", subject: "A little more detail will help us prepare your make" }));
    expect(mocks.markEmailLog).toHaveBeenCalledWith(202, "sent", { providerMessageId: "resend-qualifier-71" });
    expect(mocks.markProductionBriefQualifierFollowUp).toHaveBeenCalledWith(71, "sent", { messageId: "resend-qualifier-71" });
  });

  it("does not send when another worker or a shortlist-sent admin action has already claimed the saved brief", async () => {
    mocks.claimProductionBriefQualifierFollowUp.mockResolvedValue(false);
    await expect(runDueQualifierFollowUps()).resolves.toMatchObject({ checked: 1, sent: 0, skipped: 1, failed: 0 });
    expect(mocks.createEmailLog).not.toHaveBeenCalled();
    expect(mocks.sendTransactionalEmail).not.toHaveBeenCalled();
  });

  it("retains a failed delivery in the email and production-brief audit state", async () => {
    mocks.sendTransactionalEmail.mockRejectedValueOnce(new Error("Resend unavailable"));
    await expect(runDueQualifierFollowUps()).resolves.toMatchObject({ checked: 1, sent: 0, skipped: 0, failed: 1 });
    expect(mocks.markEmailLog).toHaveBeenCalledWith(202, "failed", { errorMessage: "Resend unavailable" });
    expect(mocks.markProductionBriefQualifierFollowUp).toHaveBeenCalledWith(71, "failed", { error: "Resend unavailable" });
  });
});
