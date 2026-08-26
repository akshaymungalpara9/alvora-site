import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createProductionBrief: vi.fn(),
  getProductionBriefById: vi.fn(),
  getQualifierFollowUpSchedule: vi.fn(),
  listProductionBriefs: vi.fn(),
  createEmailLog: vi.fn(),
  markEmailLog: vi.fn(),
  markProductionBriefAlert: vi.fn(),
  markProductionBriefAcknowledgement: vi.fn(),
  saveQualifierFollowUpSchedule: vi.fn(),
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
  source: "direct" as const,
  referrerName: null,
  acknowledgementStatus: "pending" as const,
  acknowledgementMessageId: null,
  acknowledgementError: null,
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
    mocks.createEmailLog.mockResolvedValue(91);
    mocks.getProductionBriefById.mockResolvedValue({ ...savedBrief, alertStatus: "failed", alertError: "mail transport unavailable" });
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

  it("strips control characters from internal alert subject segments", async () => {
    mocks.createProductionBrief.mockResolvedValueOnce({
      ...savedBrief,
      company: "Atelier North\r\nBcc: unwanted@example.invalid",
      requestType: "Production run\nInjected header",
    });
    mocks.sendTransactionalEmail.mockResolvedValueOnce({ id: "resend-public-brief-subject-1" });
    const caller = publicProductionBriefRouter.createCaller({} as any);

    await expect(caller.submit(input)).resolves.toEqual({ briefId: 31, alertStatus: "sent" });
    const subject = mocks.sendTransactionalEmail.mock.calls[0]?.[0]?.subject as string;
    expect(subject).toBe("[Public brief — FR — Atelier North Bcc: unwanted@example.invalid] Production run Injected header");
    expect(subject).not.toMatch(/[\r\n\u0000]/);
  });

  it("rejects a filled honeypot before creating a lead record or attempting an alert", async () => {
    const caller = publicProductionBriefRouter.createCaller({} as any);

    await expect(caller.submit({ ...input, website: "https://automated.example" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(mocks.createProductionBrief).not.toHaveBeenCalled();
    expect(mocks.sendTransactionalEmail).not.toHaveBeenCalled();
    expect(mocks.markProductionBriefAlert).not.toHaveBeenCalled();
  });

  it("normalizes valid public text and rejects whitespace-only or oversized input before persistence", async () => {
    const caller = publicProductionBriefRouter.createCaller({} as any);
    mocks.sendTransactionalEmail.mockResolvedValueOnce({ id: "resend-normalized-brief-1" });

    await caller.submit({
      ...input,
      contactName: "  Asha Patel  ",
      email: "  ASHA@ATELIER.EXAMPLE  ",
      company: "  Atelier North  ",
      brief: `  ${input.brief}  `,
    });
    expect(mocks.createProductionBrief).toHaveBeenCalledWith({
      ...input,
      contactName: "Asha Patel",
      email: "asha@atelier.example",
      company: "Atelier North",
    });

    vi.clearAllMocks();
    await expect(caller.submit({ ...input, contactName: "   " })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.submit({ ...input, brief: "x".repeat(5001) })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(mocks.createProductionBrief).not.toHaveBeenCalled();
    expect(mocks.sendTransactionalEmail).not.toHaveBeenCalled();
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

  it("lets only an admin retry a failed alert from the saved brief without creating a duplicate lead", async () => {
    mocks.sendTransactionalEmail.mockResolvedValueOnce({ id: "resend-public-brief-retry-1" });
    const adminCaller = adminProductionBriefRouter.createCaller(makeContext("admin") as any);
    const userCaller = adminProductionBriefRouter.createCaller(makeContext("user") as any);

    await expect(adminCaller.retryAlert({ briefId: 31 })).resolves.toEqual({ briefId: 31, alertStatus: "sent" });
    expect(mocks.getProductionBriefById).toHaveBeenCalledWith(31);
    expect(mocks.createProductionBrief).not.toHaveBeenCalled();
    expect(mocks.markProductionBriefAlert).toHaveBeenCalledWith(31, "sent", { alertMessageId: "resend-public-brief-retry-1" });
    await expect(userCaller.retryAlert({ briefId: 31 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("does not retry an alert that is not in failed state", async () => {
    mocks.getProductionBriefById.mockResolvedValueOnce({ ...savedBrief, alertStatus: "sent", alertError: null });
    const adminCaller = adminProductionBriefRouter.createCaller(makeContext("admin") as any);

    await expect(adminCaller.retryAlert({ briefId: 31 })).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
    expect(mocks.sendTransactionalEmail).not.toHaveBeenCalled();
    expect(mocks.createProductionBrief).not.toHaveBeenCalled();
  });

  it("retains the existing lead and records a repeat alert failure when an admin retry cannot deliver", async () => {
    mocks.sendTransactionalEmail.mockRejectedValueOnce(new Error("retry transport unavailable"));
    const adminCaller = adminProductionBriefRouter.createCaller(makeContext("admin") as any);

    await expect(adminCaller.retryAlert({ briefId: 31 })).resolves.toEqual({ briefId: 31, alertStatus: "failed" });
    expect(mocks.createProductionBrief).not.toHaveBeenCalled();
    expect(mocks.markProductionBriefAlert).toHaveBeenCalledWith(31, "failed", { alertError: "retry transport unavailable" });
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

  it("exports all or a server-filtered market subset with operational fields only for administrators", async () => {
    mocks.listProductionBriefs.mockResolvedValue([
      { ...savedBrief, ownerName: "AK", internalNote: "Quote after calibration check" },
      { ...savedBrief, id: 32, market: "US", contactName: "Morgan Lee", company: "New York Atelier" },
    ]);
    const adminCaller = adminProductionBriefRouter.createCaller(makeContext("admin") as any);
    const userCaller = adminProductionBriefRouter.createCaller(makeContext("user") as any);

    const exported = await adminCaller.exportCsv();
    expect(exported.filename).toMatch(/^alvora-production-briefs-\d{4}-\d{2}-\d{2}\.csv$/);
    expect(exported.content).toContain("\"Follow-up status\"");
    expect(exported.content).toContain("\"Market\"");
    expect(exported.content).toContain("\"FR\"");
    expect(exported.content).toContain("\"AK\"");
    expect(exported.content).toContain("\"Quote after calibration check\"");
    expect(exported.content).toContain("\"New York Atelier\"");

    const frenchOnly = await adminCaller.exportCsv({ market: "FR" });
    expect(frenchOnly.filename).toMatch(/^alvora-production-briefs-fr-\d{4}-\d{2}-\d{2}\.csv$/);
    expect(frenchOnly.content).toContain("\"Atelier North\"");
    expect(frenchOnly.content).not.toContain("\"New York Atelier\"");
    await expect(userCaller.exportCsv({ market: "FR" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("exports formula-like lead and follow-up values as inert text", async () => {
    mocks.listProductionBriefs.mockResolvedValue([
      { ...savedBrief, company: "=HYPERLINK(\"https://unsafe.example\",\"open\")", internalNote: " +SUM(1,1)" },
    ]);
    const adminCaller = adminProductionBriefRouter.createCaller(makeContext("admin") as any);

    const exported = await adminCaller.exportCsv();
    expect(exported.content).toContain("\"'=HYPERLINK(\"\"https://unsafe.example\"\",\"\"open\"\")\"");
    expect(exported.content).toContain("\"' +SUM(1,1)\"");
  });
});
