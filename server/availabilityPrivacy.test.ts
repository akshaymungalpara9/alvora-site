import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createAvailabilityImport: vi.fn(),
  getAvailabilityAdminSummary: vi.fn(),
  getPublicAvailabilitySummary: vi.fn(),
  listAvailabilityImports: vi.fn(),
  listPublicAvailabilityProfiles: vi.fn(),
  restoreAvailabilityImport: vi.fn(),
}));

vi.mock("./db", async (importOriginal) => ({ ...(await importOriginal<typeof import("./db")>()), ...mocks }));

import { publicAvailabilityProfile, safeAvailabilityStone } from "./db";
import { adminAvailabilityRouter, publicAvailabilityRouter } from "./routers/availability";

const context = { user: { id: 1, openId: "admin", email: "admin@alvora.example", name: "Admin", loginMethod: "email", role: "admin" as const, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: { headers: {}, protocol: "https", get: () => "alvora.example" }, res: {} };
const header = "stock_no,category,colour,shape,carat,carat_band,clarity,cut,polish,symmetry,measurements,depth_pct,table_pct,ratio,lab,cert_no,verify_url,video_url";
const whiteRow = "ALV-001,White,F,Round,1.25,1.00–1.99ct,VS2,IDEAL,EX,EX,6.90 x 6.92 x 4.25,61.5,58,1,IGI,819696674,https://www.igi.org/API-IGI/report-diagnosis.php?r=819696674,";
const fancyRow = "D-5,Fancy Colour,Fancy Vivid Pink,Pear,25.03,10ct +,VS1,,EX,EX,22.71 x 14.64 x 9.44,64.5,64,1.55,IGI,788606730,https://www.igi.org/API-IGI/report-diagnosis.php?r=788606730,";
const rawStone = {
  id: 1, importId: 2, stockNumber: "ALV-001", availability: "Available", category: "White", shape: "ROUND", carat: 1.25, color: "F", caratBand: "1.00–1.99ct", clarity: "VS2", cut: "IDEAL", polish: "EX", symmetry: "EX", depthPct: 61.5, tablePct: 58, ratio: 1, lab: "IGI", reportNumber: "819696674", verifyUrl: "https://www.igi.org/API-IGI/report-diagnosis.php?r=819696674", price: 1250, location: null, fluorescence: null, measurements: "6.90 x 6.92", videoUrl: "https://video.example/ALV-001", bandTag: "1.00–1.99ct", originPartner: "Partner Private", standardsFlags: [], isStandardMenu: true, importedAt: new Date(),
};

describe("current production catalog privacy and activation", () => {
  it("removes partner metadata and legacy price data from safe buyer responses", () => {
    const safe = safeAvailabilityStone(rawStone);
    expect(safe).toMatchObject({ stockNumber: "ALV-001", reportNumber: "819696674", verifyUrl: expect.stringContaining("r=819696674") });
    expect(safe).not.toHaveProperty("originPartner");
    expect(safe).not.toHaveProperty("price");
    expect(safe).not.toHaveProperty("standardsFlags");
  });

  it("keeps public certification and full non-price catalog fields while withholding buyer-only video", () => {
    const profile = publicAvailabilityProfile(rawStone);
    expect(profile).toMatchObject({ stockNumber: "ALV-001", reportNumber: "819696674", category: "White" });
    expect(profile).not.toHaveProperty("price");
    expect(profile).not.toHaveProperty("videoUrl");
    expect(profile).not.toHaveProperty("originPartner");
  });

  it("returns a stock-number rejection report and never calls replacement for invalid catalog rows", async () => {
    const caller = adminAvailabilityRouter.createCaller(context as any);
    const invalid = `${header}\nALV-BAD,White,F,Round,1.25,1.00–1.99ct,VS2,IDEAL,EX,EX,6.90 x 6.92 x 4.25,61.5,58,1,IGI,,not-a-url,\n`;
    const preview = await caller.validateImport({ filename: "bad.csv", csv: invalid });
    expect(preview.valid).toBe(false);
    expect(preview.rejectionReport[0]).toMatchObject({ sku: "ALV-BAD" });
    await expect(caller.replaceImport({ filename: "bad.csv", csv: invalid })).rejects.toThrow("Availability import was not applied");
    expect(mocks.createAvailabilityImport).not.toHaveBeenCalled();
  });

  it("replaces a valid two-collection snapshot without a price or standards-flag pathway", async () => {
    mocks.createAvailabilityImport.mockResolvedValue({ id: 5, status: "active" });
    const caller = adminAvailabilityRouter.createCaller(context as any);
    const result = await caller.replaceImport({ filename: "live.csv", csv: `${header}\n${whiteRow}\n${fancyRow}\n` });
    expect(mocks.createAvailabilityImport).toHaveBeenCalledWith(expect.objectContaining({ importedByUserId: 1, sourceFilename: "live.csv" }));
    expect(result).toMatchObject({ whiteRowCount: 1, fancyRowCount: 1, flaggedRows: [] });
    expect(JSON.stringify(mocks.createAvailabilityImport.mock.calls[0][0])).not.toContain("price");
  });

  it("returns only the public catalog helper response to anonymous callers", async () => {
    mocks.listPublicAvailabilityProfiles.mockResolvedValue({ import: { id: 5, activatedAt: new Date() }, profiles: [publicAvailabilityProfile(rawStone)], total: 1, page: 0, pageSize: 48 });
    const caller = publicAvailabilityRouter.createCaller({ req: {}, res: {}, user: null } as any);
    const result = await caller.profiles();
    expect(result.profiles[0]).not.toHaveProperty("originPartner");
    expect(result.profiles[0]).not.toHaveProperty("price");
    expect(result.profiles[0]).not.toHaveProperty("videoUrl");
  });
});

