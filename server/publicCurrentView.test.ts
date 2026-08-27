import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getPublicAvailabilityRowsByIds: vi.fn(),
  buildLineSheetPdf: vi.fn(),
  storagePut: vi.fn(),
}));

vi.mock("./db", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./db")>()),
  getPublicAvailabilityRowsByIds: mocks.getPublicAvailabilityRowsByIds,
}));
vi.mock("./lineSheets", () => ({ buildLineSheetPdf: mocks.buildLineSheetPdf }));
vi.mock("./storage", () => ({ storagePut: mocks.storagePut }));

import { publicAvailabilityRouter } from "./routers/availability";

const activeStone = {
  id: 71,
  stockNumber: "ALV-71",
  reportNumber: "819696674",
  price: null,
};

describe("public current availability PDF", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getPublicAvailabilityRowsByIds.mockResolvedValue([activeStone]);
    mocks.buildLineSheetPdf.mockResolvedValue(Buffer.from("pdf"));
    mocks.storagePut.mockResolvedValue({ key: "public-current-views/core/view.pdf", url: "/manus-storage/public-current-views/core/view.pdf" });
  });

  it("allows an anonymous visitor to generate a bounded no-price view from current public records", async () => {
    const caller = publicAvailabilityRouter.createCaller({ user: null, req: {}, res: {} } as any);
    const result = await caller.downloadCurrentView({ collection: "core", stoneIds: [71] });

    expect(mocks.getPublicAvailabilityRowsByIds).toHaveBeenCalledWith({ collection: "core", stoneIds: [71] });
    expect(mocks.buildLineSheetPdf).toHaveBeenCalledWith(expect.objectContaining({ title: "Current production view", stones: [activeStone] }));
    expect(mocks.storagePut).toHaveBeenCalledWith(expect.stringContaining("public-current-views/core/"), expect.any(Buffer), "application/pdf");
    expect(result).toMatchObject({ storageUrl: "/manus-storage/public-current-views/core/view.pdf", stoneCount: 1 });
  });

  it("rejects a current view if any requested row is not still in the active public catalog", async () => {
    const caller = publicAvailabilityRouter.createCaller({ user: null, req: {}, res: {} } as any);
    await expect(caller.downloadCurrentView({ collection: "core", stoneIds: [71, 72] })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(mocks.buildLineSheetPdf).not.toHaveBeenCalled();
    expect(mocks.storagePut).not.toHaveBeenCalled();
  });
});
