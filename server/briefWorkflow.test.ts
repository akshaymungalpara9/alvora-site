import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createProductionBrief: vi.fn(),
  listProductionBriefs: vi.fn(),
  markProductionBriefAlert: vi.fn(),
  sendTransactionalEmail: vi.fn(),
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
      subject: "[Public brief — Atelier North] Production run",
      tags: expect.arrayContaining([expect.objectContaining({ value: "public_production_brief" })]),
    }));
    expect(mocks.markProductionBriefAlert).toHaveBeenCalledWith(31, "failed", { alertError: "mail transport unavailable" });
  });

  it("marks a saved brief sent when alert delivery succeeds", async () => {
    mocks.sendTransactionalEmail.mockResolvedValueOnce({ id: "resend-public-brief-1" });
    const caller = publicProductionBriefRouter.createCaller({} as any);

    await expect(caller.submit(input)).resolves.toEqual({ briefId: 31, alertStatus: "sent" });
    expect(mocks.markProductionBriefAlert).toHaveBeenCalledWith(31, "sent", { alertMessageId: "resend-public-brief-1" });
  });

  it("limits lead retrieval to administrators", async () => {
    mocks.listProductionBriefs.mockResolvedValue([savedBrief]);
    const adminCaller = adminProductionBriefRouter.createCaller(makeContext("admin") as any);
    const userCaller = adminProductionBriefRouter.createCaller(makeContext("user") as any);

    await expect(adminCaller.list()).resolves.toEqual([savedBrief]);
    await expect(userCaller.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
