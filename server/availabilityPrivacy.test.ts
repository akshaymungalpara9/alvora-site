import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createAvailabilityImport: vi.fn(),
  getAvailabilityAdminSummary: vi.fn(),
  listAvailabilityImports: vi.fn(),
  listPublicAvailabilityProfiles: vi.fn(),
  restoreAvailabilityImport: vi.fn(),
}));

vi.mock("./db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./db")>();
  return { ...actual, ...mocks };
});

import { publicAvailabilityProfile, safeAvailabilityStone } from "./db";
import { adminAvailabilityRouter, publicAvailabilityRouter } from "./routers/availability";

const context = {
  user: { id: 1, openId: "admin", email: "admin@alvora.example", name: "Admin", loginMethod: "email", role: "admin" as const, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
  req: { headers: {}, protocol: "https", get: () => "alvora.example" },
  res: {},
};
const header = "sku,shape,carat,color,clarity,cut,fluorescence,measurements,igi_cert_number,video_url,price_usd,band_tag,origin_partner";
const standardRow = "ALV-001,Round,1.25,G,VS2,EX,None,6.90 x 6.92 x 4.25,IGI-123456789,https://video.example/ALV-001,1250,Core,Partner Private";

describe("availability import privacy and activation", () => {
  it("removes origin partner and standards-review metadata from buyer/public-safe records", () => {
    const safe = safeAvailabilityStone({
      id: 1, importId: 2, stockNumber: "ALV-001", availability: "Available", shape: "ROUND", carat: 1.25, color: "G", clarity: "VS2", cut: "EX", polish: null, lab: "IGI", reportNumber: "IGI-123", price: 1250, location: "India", fluorescence: "NONE", measurements: "6.90 x 6.92", videoUrl: "https://video.example/ALV-001", bandTag: "Core", originPartner: "Partner Private", standardsFlags: ["review"], isStandardMenu: true, importedAt: new Date(),
    });
    expect(safe).not.toHaveProperty("originPartner");
    expect(safe).not.toHaveProperty("standardsFlags");
    expect(safe).not.toHaveProperty("importId");
    expect(safe).toMatchObject({ stockNumber: "ALV-001", reportNumber: "IGI-123", price: 1250 });
  });

  it("limits public responses to matched profile attributes rather than individual commercial or certificate details", () => {
    const profile = publicAvailabilityProfile({
      id: 1, importId: 2, stockNumber: "ALV-001", availability: "Available", shape: "ROUND", carat: 1.25, color: "G", clarity: "VS2", cut: "EX", polish: null, lab: "IGI", reportNumber: "IGI-123", price: 1250, location: "India", fluorescence: "NONE", measurements: "6.90 x 6.92", videoUrl: "https://video.example/ALV-001", bandTag: "Core", originPartner: "Partner Private", standardsFlags: [], isStandardMenu: true, importedAt: new Date(),
    });
    expect(profile).toMatchObject({ shape: "ROUND", carat: 1.25, color: "G" });
    expect(profile).not.toHaveProperty("stockNumber");
    expect(profile).not.toHaveProperty("reportNumber");
    expect(profile).not.toHaveProperty("videoUrl");
    expect(profile).not.toHaveProperty("price");
    expect(profile).not.toHaveProperty("originPartner");
  });

  it("returns SKU-level rejection details and cannot call replacement for invalid rows", async () => {
    const caller = adminAvailabilityRouter.createCaller(context as any);
    const preview = await caller.validateImport({ filename: "bad.csv", csv: `${header}\nALV-BAD,Round,1.25,G,VS2,EX,None,, ,not-a-url,0,Core,Partner Private\n` });
    expect(preview.valid).toBe(false);
    expect(preview.rejectionReport[0]).toMatchObject({ sku: "ALV-BAD" });
    await expect(caller.replaceImport({ filename: "bad.csv", csv: `${header}\nALV-BAD,Round,1.25,G,VS2,EX,None,, ,not-a-url,0,Core,Partner Private\n` })).rejects.toThrow("Availability import was not applied");
    expect(mocks.createAvailabilityImport).not.toHaveBeenCalled();
  });

  it("allows a structurally valid replacement and reports standards flags without silently discarding the row", async () => {
    mocks.createAvailabilityImport.mockResolvedValue({ id: 5, status: "active" });
    const caller = adminAvailabilityRouter.createCaller(context as any);
    const result = await caller.replaceImport({ filename: "live.csv", csv: `${header}\n${standardRow}\nALV-FLAG,Cushion,0.90,I,SI1,VG,Faint,6.00 x 6.00,IGI-987654321,https://video.example/ALV-FLAG,980,High,Partner Private\n` });
    expect(mocks.createAvailabilityImport).toHaveBeenCalledWith(expect.objectContaining({ importedByUserId: 1, sourceFilename: "live.csv" }));
    expect(result.flaggedRows).toEqual([expect.objectContaining({ sku: "ALV-FLAG" })]);
  });

  it("keeps the public profile procedure limited to the safe data helper result", async () => {
    mocks.listPublicAvailabilityProfiles.mockResolvedValue({ import: { id: 5, activatedAt: new Date() }, profiles: [{ id: 1, stockNumber: "ALV-001", shape: "ROUND", carat: 1.25, color: "G", clarity: "VS2", cut: "EX", polish: null, fluorescence: "NONE", measurements: null, reportNumber: "IGI-123", videoUrl: "https://video.example/ALV-001", price: 1250, bandTag: "Core", importedAt: new Date() }] });
    const caller = publicAvailabilityRouter.createCaller({ req: {}, res: {}, user: null } as any);
    const result = await caller.profiles();
    expect(result.profiles[0]).not.toHaveProperty("originPartner");
    expect(result.profiles[0]).not.toHaveProperty("standardsFlags");
  });
});
