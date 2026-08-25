import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createProductionBrief: vi.fn(),
  listProductionBriefs: vi.fn(),
  markProductionBriefAlert: vi.fn(),
  sendTransactionalEmail: vi.fn(),
  updateProductionBriefFollowUp: vi.fn(),
}));

vi.mock("./db", () => mocks);
vi.mock("./email", () => ({
  escapeHtml: (value: string) => value,
  sendTransactionalEmail: mocks.sendTransactionalEmail,
}));

import { ENV } from "./_core/env";
import { adminProductionBriefRouter, publicProductionBriefRouter } from "./routers/briefs";

const input = {
  requestType: "Production run",
  market: "FR" as const,
  contactName: "Asha Patel",
  email: "asha@atelier.example",
  company: "Atelier North",
  yearsTrading: "5–10" as const,
  tradeReferencesAvailable: "Yes" as const,
  preferredPaymentApproach: "Agreed trade terms subject to credit check" as const,
  brief: "Round calibrated parcel, 1.20–1.35 ct, F–G, VS1–VS2, required for an October setting programme.",
};

const savedBrief = {
  id: 31,
  ...input,
  company: input.company,
  alertStatus: "pending" as const,
  alertError: null,
  alertMessageId: null,
  followUpStatus: "new" as const,
  ownerName: null,
  internalNote: null,
  lastActionAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const makeContext = (role: "admin" | "user") => ({
  user: {
    id: 2,
    openId: "brief-workflow-test",
    name: "Brief Workflow Test",
    email: "admin@alvora.example",
    loginMethod: "email",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  },
  req: { protocol: "https", get: () => "alvora.example" },
  res: {},
});

describe("public production-brief workflow", () => {
  const originalAlertTo = ENV.leadAlertTo;

  beforeEach(() => {
    vi.clearAllMocks();
    ENV.leadAlertTo = "alerts@alvora.example";
    mocks.createProductionBrief.mockResolvedValue(savedBrief);
    mocks.updateProductionBriefFollowUp.mockResolvedValue({ ...savedBrief, followUpStatus: "reviewing", ownerName: "AK", internalNote: "Check setting dimensions", lastActionAt: new Date() });
  });

  afterEach(() => {
    ENV.leadAlertTo = originalAlertTo;
  });

  it("persists a public brief before attempting the alert and retains it when delivery fails", async () => {
    mocks.sendTransactionalEmail.mockRejectedValueOnce(new Error("mail transport unavailable"));
    const caller = publicProductionBriefRouter.createCaller({} as any);

    const result = await caller.submit(input);

    expect(result).toEqual({ briefId: 31, alertStatus: "failed" });
    expect(mocks.createProductionBrief).toHaveBeenCalledWith(input);
    expect(mocks.createProductionBrief.mock.invocationCallOrder[0]).toBeLessThan(mocks.sendTransactionalEmail.mock.invocationCallOrder[0]);
    expect(mocks.sendTransactionalEmail).toHaveBeenCalledWith(expect.objectContaining({
      to: "alerts@alvora.example",
      subject: "[Public brief — FR — Atelier North] Production run",
      tags: expect.arrayContaining([expect.objectContaining({ value: "public_production_brief" }), expect.objectContaining({ name: "market", value: "FR" })]),
    }));
    expect(mocks.markProductionBriefAlert).toHaveBeenCalledWith(31, "failed", { alertError: "mail transport unavailable" });
  });

  it("marks a saved brief sent when alert delivery succeeds", async () => {
    mocks.sendTransactionalEmail.mockResolvedValueOnce({ id: "resend-public-brief-1" });
    const caller = publicProductionBriefRouter.createCaller({} as any);

    await expect(caller.submit(input)).resolves.toEqual({ briefId: 31, alertStatus: "sent" });
    expect(mocks.markProductionBriefAlert).toHaveBeenCalledWith(31, "sent", { alertMessageId: "resend-public-brief-1" });
  });

  it("persists a Canadian market code and includes it in alert routing metadata", async () => {
    const canadianInput = { ...input, market: "CA" as const };
    mocks.createProductionBrief.mockResolvedValueOnce({ ...savedBrief, market: "CA" as const });
    mocks.sendTransactionalEmail.mockResolvedValueOnce({ id: "resend-public-brief-ca-1" });
    const caller = publicProductionBriefRouter.createCaller({} as any);

    await expect(caller.submit(canadianInput)).resolves.toEqual({ briefId: 31, alertStatus: "sent" });
    expect(mocks.createProductionBrief).toHaveBeenCalledWith(canadianInput);
    expect(mocks.sendTransactionalEmail).toHaveBeenCalledWith(expect.objectContaining({
      subject: "[Public brief — CA — Atelier North] Production run",
      tags: expect.arrayContaining([expect.objectContaining({ name: "market", value: "CA" })]),
    }));
  });

  it("limits lead retrieval to administrators", async () => {
    mocks.listProductionBriefs.mockResolvedValue([savedBrief]);
    const adminCaller = adminProductionBriefRouter.createCaller(makeContext("admin") as any);
    const userCaller = adminProductionBriefRouter.createCaller(makeContext("user") as any);

    await expect(adminCaller.list()).resolves.toEqual([savedBrief]);
    await expect(userCaller.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("allows only an admin to record protected triage status, ownership, and internal notes", async () => {
    const adminCaller = adminProductionBriefRouter.createCaller(makeContext("admin") as any);
    const userCaller = adminProductionBriefRouter.createCaller(makeContext("user") as any);

    await expect(adminCaller.updateFollowUp({ briefId: 31, followUpStatus: "reviewing", ownerName: "AK", internalNote: "Check setting dimensions" })).resolves.toMatchObject({ followUpStatus: "reviewing", ownerName: "AK" });
    expect(mocks.updateProductionBriefFollowUp).toHaveBeenCalledWith({ id: 31, followUpStatus: "reviewing", ownerName: "AK", internalNote: "Check setting dimensions" });
    await expect(userCaller.updateFollowUp({ briefId: 31, followUpStatus: "closed" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("exports production briefs with operational fields only for administrators", async () => {
    mocks.listProductionBriefs.mockResolvedValue([{ ...savedBrief, ownerName: "AK", internalNote: "Quote after calibration check" }]);
    const adminCaller = adminProductionBriefRouter.createCaller(makeContext("admin") as any);
    const userCaller = adminProductionBriefRouter.createCaller(makeContext("user") as any);

    const exported = await adminCaller.exportCsv();
    expect(exported.filename).toMatch(/^alvora-production-briefs-\d{4}-\d{2}-\d{2}\.csv$/);
    expect(exported.content).toContain("\"Follow-up status\"");
    expect(exported.content).toContain("\"Market\"");
    expect(exported.content).toContain("\"FR\"");
    expect(exported.content).toContain("\"AK\"");
    expect(exported.content).toContain("\"Quote after calibration check\"");
    await expect(userCaller.exportCsv()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
