import { describe, expect, it, beforeEach, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  approveBuyerAccount: vi.fn(),
  createBuyerAccount: vi.fn(),
  createEmailLog: vi.fn(),
  createLineSheetRecord: vi.fn(),
  createPrivateListRequest: vi.fn(),
  getBuyerAccountById: vi.fn(),
  getBuyerStone: vi.fn(),
  getLatestLineSheet: vi.fn(),
  getStonesForBuyer: vi.fn(),
  listBuyerAccounts: vi.fn(),
  listEmailLogsForBuyer: vi.fn(),
  listPrivateRequests: vi.fn(),
  markEmailLog: vi.fn(),
  markPrivateRequestEmail: vi.fn(),
  resolveBuyerAccountForUser: vi.fn(),
  sendTransactionalEmail: vi.fn(),
  storagePut: vi.fn(),
  buildLineSheetPdf: vi.fn(),
}));

vi.mock("./db", () => mocks);
vi.mock("./email", () => ({
  escapeHtml: (value: string) => value,
  sendTransactionalEmail: mocks.sendTransactionalEmail,
}));
vi.mock("./storage", () => ({ storagePut: mocks.storagePut }));
vi.mock("./lineSheets", () => ({ buildLineSheetPdf: mocks.buildLineSheetPdf }));

import { adminBuyerRouter, buyerPortalRouter } from "./routers/buyers";
import { ENV } from "./_core/env";

const buyer = {
  id: 4,
  userId: 2,
  accountName: "Atelier North",
  contactName: "Buyer Contact",
  email: "buyer@example.com",
  status: "approved" as const,
  shapes: "ROUND,OVAL",
  caratMin: 0.5,
  caratMax: 2,
  colors: "D,E,F,G",
  clarities: "VVS2,VS1,VS2",
  approvedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

const stone = {
  id: 8,
  stockNumber: "ALV-RND-08",
  reportNumber: "IGI-TEST-123",
  shape: "ROUND",
  carat: 1,
  color: "F",
  clarity: "VS1",
  cut: "EX",
  polish: "EX",
  lab: "IGI",
  price: 1200,
  location: "India",
  availability: "Available",
  importedAt: new Date(),
};

const makeContext = (role: "admin" | "user") => ({
  user: {
    id: 2,
    openId: "workflow-test",
    name: "Workflow Test",
    email: "buyer@example.com",
    loginMethod: "email",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  },
  req: { protocol: "https", get: () => "alvora.example" },
  res: {},
});

describe("approved-buyer workflow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ENV.alvoraEarlyAccessEnabled = false;
    mocks.resolveBuyerAccountForUser.mockResolvedValue(buyer);
    mocks.getBuyerStone.mockResolvedValue(stone);
    mocks.createPrivateListRequest.mockResolvedValue(91);
    mocks.createEmailLog.mockResolvedValue(62);
    mocks.getStonesForBuyer.mockResolvedValue([stone]);
    mocks.storagePut.mockResolvedValue({ key: "line-sheets/4/alvora.pdf", url: "/manus-storage/line-sheets/4/alvora.pdf" });
    mocks.createLineSheetRecord.mockResolvedValue({ id: 14, storageUrl: "/manus-storage/line-sheets/4/alvora.pdf" });
    mocks.buildLineSheetPdf.mockResolvedValue(Buffer.from("%PDF test"));
    mocks.approveBuyerAccount.mockResolvedValue(buyer);
  });

  it("persists a private-list request before attempting the tagged alert and preserves it if delivery fails", async () => {
    ENV.alvoraEarlyAccessEnabled = true;
    mocks.sendTransactionalEmail.mockRejectedValueOnce(new Error("delivery unavailable"));
    const caller = buyerPortalRouter.createCaller(makeContext("user") as any);

    const result = await caller.requestStone({ stoneId: 8, note: "Please confirm dispatch timing." });

    expect(result).toMatchObject({ requestId: 91, alertStatus: "failed" });
    expect(mocks.createPrivateListRequest).toHaveBeenCalledWith(expect.objectContaining({
      certificateNumber: "IGI-TEST-123",
      buyerAccountName: "Atelier North",
    }));
    expect(mocks.createPrivateListRequest.mock.invocationCallOrder[0]).toBeLessThan(mocks.sendTransactionalEmail.mock.invocationCallOrder[0]);
    expect(mocks.createEmailLog).toHaveBeenCalledWith(expect.objectContaining({
      emailType: "private_list_request_alert",
      subject: "[Private list — Atelier North] Stone request: IGI IGI-TEST-123",
    }));
    expect(mocks.markEmailLog).toHaveBeenCalledWith(62, "failed", expect.objectContaining({ errorMessage: "delivery unavailable" }));
    expect(mocks.markPrivateRequestEmail).toHaveBeenCalledWith(91, "failed", "delivery unavailable");
  });

  it("stores a line sheet and logs a welcome email when an admin approves a buyer", async () => {
    ENV.alvoraEarlyAccessEnabled = true;
    mocks.sendTransactionalEmail.mockResolvedValueOnce({ id: "resend-welcome-1" });
    const caller = adminBuyerRouter.createCaller(makeContext("admin") as any);

    const result = await caller.approveBuyerAccount({ buyerAccountId: 4 });

    expect(mocks.storagePut).toHaveBeenCalledWith(expect.stringContaining("line-sheets/4/"), expect.any(Buffer), "application/pdf");
    expect(mocks.createLineSheetRecord).toHaveBeenCalledWith(expect.objectContaining({ buyerAccountId: 4, createdByUserId: 2 }));
    expect(mocks.createEmailLog).toHaveBeenCalledWith(expect.objectContaining({
      buyerAccountId: 4,
      emailType: "approved_buyer_welcome",
      recipient: "buyer@example.com",
    }));
    expect(mocks.markEmailLog).toHaveBeenCalledWith(62, "sent", { providerMessageId: "resend-welcome-1" });
    expect(result.welcome.status).toBe("sent");
  });

  it("blocks approval, welcome-email sending, buyer visibility, and requests while early access is locked", async () => {
    const adminCaller = adminBuyerRouter.createCaller(makeContext("admin") as any);
    const buyerCaller = buyerPortalRouter.createCaller(makeContext("user") as any);

    await expect(adminCaller.approveBuyerAccount({ buyerAccountId: 4 })).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
    await expect(buyerCaller.requestStone({ stoneId: 8 })).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
    await expect(buyerCaller.myAvailability()).resolves.toMatchObject({ status: "not_approved", stones: [] });
    expect(mocks.approveBuyerAccount).not.toHaveBeenCalled();
    expect(mocks.sendTransactionalEmail).not.toHaveBeenCalled();
  });

  it("rejects buyer-account administration from a non-admin session", async () => {
    const caller = adminBuyerRouter.createCaller(makeContext("user") as any);
    await expect(caller.listBuyerAccounts()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
