import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createAvailabilityImport: vi.fn(),
  getAvailabilityAdminSummary: vi.fn(),
  getPublicAvailabilitySummary: vi.fn(),
  listAvailabilityCuration: vi.fn(),
  listAvailabilityImports: vi.fn(),
  listPublicAvailabilityProfiles: vi.fn(),
  restoreAvailabilityImport: vi.fn(),
  updateAvailabilityCuration: vi.fn(),
}));

vi.mock("./db", async (importOriginal) => ({ ...(await importOriginal<typeof import("./db")>()), ...mocks }));

import { publicAvailabilityProfile, safeAvailabilityStone } from "./db";
import { adminAvailabilityRouter, publicAvailabilityRouter } from "./routers/availability";

const context = { user: { id: 1, openId: "admin", email: "admin@alvora.example", name: "Admin", loginMethod: "email", role: "admin" as const, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: { headers: {}, protocol: "https", get: () => "alvora.example" }, res: {} };
const header = "stock_no,category,colour,shape,carat,carat_band,clarity,cut,polish,symmetry,measurements,depth_pct,table_pct,ratio,lab,cert_no,verify_url,video_url";
const whiteRow = "ALV-001,White,F,Round,1.25,1.00–1.99ct,VS2,IDEAL,EX,EX,6.90 x 6.92 x 4.25,61.5,58,1,IGI,819696674,https://www.igi.org/API-IGI/report-diagnosis.php?r=819696674,";
const fancyRow = "D-5,Fancy Colour,Fancy Vivid Pink,Pear,25.03,10ct +,VS1,,EX,EX,22.71 x 14.64 x 9.44,64.5,64,1.55,IGI,788606730,https://www.igi.org/API-IGI/report-diagnosis.php?r=788606730,";
const rawStone = {
  id: 1, importId: 2, stockNumber: "ALV-001", availability: "Available", category: "White", shape: "ROUND", carat: 1.25, color: "F", caratBand: "1.00–1.99ct", clarity: "VS2", cut: "IDEAL", polish: "EX", symmetry: "EX", depthPct: 61.5, tablePct: 58, ratio: 1, lab: "IGI", reportNumber: "819696674", verifyUrl: "https://api.igi.org/viewpdf.php?r=819696674", price: 1250, location: null, fluorescence: null, measurements: "6.90 x 6.92", videoUrl: "https://video.example/ALV-001", bandTag: "1.00–1.99ct", originPartner: "Partner Private", standardsFlags: [], isStandardMenu: true, importedAt: new Date(),
};

describe("current production catalog privacy and activation", () => {
  it("removes partner metadata and legacy price data from safe buyer responses", () => {
    const safe = safeAvailabilityStone(rawStone);
    expect(safe).toMatchObject({ stockNumber: "ALV-001", reportNumber: "819696674", verifyUrl: "https://api.igi.org/viewpdf.php?r=819696674" });
    expect(safe).not.toHaveProperty("originPartner");
    expect(safe).not.toHaveProperty("price");
    expect(safe).not.toHaveProperty("standardsFlags");
    expect(safe).not.toHaveProperty("isStandardMenu");
  });

  it("keeps public certification, supplied video, and full non-price catalog fields without partner metadata", () => {
    const profile = publicAvailabilityProfile(rawStone, true, { pinned: true, heroNote: "House selection" });
    expect(profile).toMatchObject({ stockNumber: "ALV-001", reportNumber: "819696674", category: "White", isPinned: true, heroNote: "House selection" });
    expect(profile).not.toHaveProperty("price");
    expect(profile).toHaveProperty("videoUrl", "https://video.example/ALV-001");
    expect(profile).not.toHaveProperty("originPartner");
    expect(profile).not.toHaveProperty("isStandardMenu");
    expect(profile).not.toHaveProperty("pinRank");
    expect(profile).not.toHaveProperty("firstSeenAt");
  });

  it("withholds untrusted certificate actions and workshop 360° links from the safe public profile", () => {
    const unverifiedSource = { ...rawStone, verifyUrl: "https://www.igi.org/", videoUrl: "https://workshop.360view.link/360viewer/360view.html?d=ALV-001" };
    const safe = publicAvailabilityProfile(unverifiedSource, true);
    expect(safe.verifyUrl).toBeNull();
    expect(safe.videoUrl).toBeNull();
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
    mocks.listPublicAvailabilityProfiles.mockResolvedValue({ import: { id: 5, activatedAt: new Date() }, profiles: [publicAvailabilityProfile(rawStone, true)], total: 1, page: 0, pageSize: 48 });
    const caller = publicAvailabilityRouter.createCaller({ req: {}, res: {}, user: null } as any);
    const result = await caller.profiles();
    expect(result.profiles[0]).not.toHaveProperty("originPartner");
    expect(result.profiles[0]).not.toHaveProperty("price");
    expect(result.profiles[0]).not.toHaveProperty("isStandardMenu");
    expect(result.profiles[0]).toHaveProperty("videoUrl", "https://video.example/ALV-001");
  });

  it("accepts only the public no-price catalogue sort options", async () => {
    mocks.listPublicAvailabilityProfiles.mockResolvedValue({ import: { id: 5, activatedAt: new Date() }, profiles: [publicAvailabilityProfile(rawStone, true)], total: 1, page: 0, pageSize: 48 });
    const caller = publicAvailabilityRouter.createCaller({ req: {}, res: {}, user: null } as any);
    await expect(caller.profiles({ sort: "curated" })).resolves.toMatchObject({ total: 1 });
    await expect(caller.profiles({ sort: "price_desc" as any })).rejects.toThrow();
  });

  it("keeps stock pinning and hero notes behind the administrator router and scopes the update to a public tab", async () => {
    mocks.listAvailabilityCuration.mockResolvedValue([{ catalogTab: "White", stockNumber: "ALV-001", pinned: false }]);
    mocks.updateAvailabilityCuration.mockResolvedValue({ catalogTab: "White", stockNumber: "ALV-001", pinned: true, pinRank: 1, heroNote: "House selection" });
    const admin = adminAvailabilityRouter.createCaller(context as any);
    await expect(admin.curation({ collection: "core" })).resolves.toEqual([{ catalogTab: "White", stockNumber: "ALV-001", pinned: false }]);
    await expect(admin.updateCuration({ collection: "core", catalogTab: "White", stockNumber: "ALV-001", pinned: true, pinRank: 1, heroNote: "House selection" })).resolves.toMatchObject({ pinned: true, catalogTab: "White" });
    expect(mocks.updateAvailabilityCuration).toHaveBeenCalledWith(expect.objectContaining({ collection: "core", catalogTab: "White", stockNumber: "ALV-001" }));
    const anonymous = adminAvailabilityRouter.createCaller({ req: {}, res: {}, user: null } as any);
    await expect(anonymous.curation({ collection: "core" })).rejects.toThrow();
  });
});
