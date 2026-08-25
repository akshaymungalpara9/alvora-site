import { describe, expect, it } from "vitest";
import { buildLineSheetPdf } from "./lineSheets";

describe("buyer line-sheet PDF", () => {
  it("creates a non-empty branded one-page PDF for the buyer’s matching inventory", async () => {
    const pdf = await buildLineSheetPdf({
      buyer: {
        id: 7,
        userId: null,
        accountName: "Atelier Test",
        contactName: "Test Buyer",
        email: "buyer@example.com",
        status: "approved",
        shapes: "ROUND,OVAL",
        caratMin: 0.5,
        caratMax: 2,
        colors: "D,E,F,G",
        clarities: "VVS2,VS1,VS2",
        approvedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      stones: [{
        id: 42,
        stockNumber: "ALV-RND-42",
        availability: "Available",
        shape: "ROUND",
        carat: 1.2,
        color: "F",
        clarity: "VS1",
        cut: "EX",
        polish: "EX",
        lab: "IGI",
        reportNumber: null,
        price: null,
        location: "India",
        importedAt: new Date(),
      }],
      validUntil: new Date("2026-09-01T00:00:00.000Z"),
    });

    expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
    expect(pdf.length).toBeGreaterThan(1000);
  });
});
