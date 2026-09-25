import { describe, expect, it } from "vitest";
import { CENTRE_STONE_CARATS } from "@shared/jewellery/centreStone";
import { convertFromInr, currencyForTimeZone, formatMoney } from "@shared/jewellery/currency";
import { LAUNCH_OFFER, RING_METALS, RING_PRICES_INR, formatFullPrice, fromPriceInr, fullPriceInr, launchOfferActive, ringPriceInr } from "@shared/jewellery/pricing";
import { PUBLIC_PIECES } from "@shared/jewellery/catalog";

describe("jewellery pricing", () => {
  it("prices every metal at every centre-stone size, rising with carat", () => {
    for (const { value } of RING_METALS) {
      const prices = CENTRE_STONE_CARATS.map((carat) => ringPriceInr(value, carat));
      expect(prices.every((p) => typeof p === "number" && p > 0)).toBe(true);
      for (let i = 1; i < prices.length; i += 1) expect(prices[i]!).toBeGreaterThan(prices[i - 1]!);
    }
  });

  it("matches every owner-set price at every metal and centre-stone size", () => {
    const expected = {
      silver: [25, 45, 70, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      "14K": [70, 90, 130, 170, 210, 240, 280, 320, 360, 400, 440, 480],
      "18K": [90, 120, 160, 200, 240, 280, 320, 360, 400, 440, 480, 520],
      platinum: [70, 90, 130, 170, 210, 240, 280, 320, 360, 400, 440, 480],
    } as const;
    for (const { value } of RING_METALS) {
      expect(CENTRE_STONE_CARATS.map((carat) => RING_PRICES_INR[value][carat])).toEqual(expected[value].map((thousands) => thousands * 1000));
    }
    expect(RING_PRICES_INR.platinum).toEqual(RING_PRICES_INR["14K"]);
  });

  it("starts every live engagement ring at 0.5 ct in silver and leaves earrings on request", () => {
    for (const piece of PUBLIC_PIECES) {
      if (piece.category === "ring" && piece.collections.includes("engagement-rings")) expect(fromPriceInr(piece)).toBe(25000);
      if (piece.category === "earrings") expect(fromPriceInr(piece)).toBeNull();
    }
  });

  it("shows the launch offer only while a real end date is running", () => {
    const full = fullPriceInr(25000);
    expect(full % 100).toBe(0);
    expect(1 - 25000 / full).toBeGreaterThanOrEqual(LAUNCH_OFFER.percentOff / 100);
    expect(1 - 25000 / full).toBeLessThan(LAUNCH_OFFER.percentOff / 100 + 0.005);
    if (LAUNCH_OFFER.endsOn == null) expect(launchOfferActive()).toBe(false);
    else expect(launchOfferActive(new Date(`${LAUNCH_OFFER.endsOn}T23:00:00+05:30`))).toBe(true);
  });

  it("converts with the owner's rates, rounded to tidy amounts", () => {
    expect(formatMoney(250000, "INR")).toBe("₹2,50,000");
    expect(convertFromInr(25000, "USD")).toBe(260);
    expect(convertFromInr(25000, "GBP")).toBe(200);
    expect(convertFromInr(25000, "EUR")).toBe(230);
    expect(convertFromInr(25000, "CAD")).toBe(360);
    expect(convertFromInr(25000, "AUD")).toBe(360);
    for (const code of ["USD", "GBP", "EUR", "CAD", "AUD"] as const) expect(convertFromInr(123456, code) % 10).toBe(0);
  });

  it("guesses the currency from the time zone and falls back to rupees without a rate", () => {
    expect(currencyForTimeZone("Asia/Kolkata")).toBe("INR");
    expect(currencyForTimeZone("Europe/London")).toBe("GBP");
    expect(currencyForTimeZone("Europe/Paris")).toBe("EUR");
    expect(currencyForTimeZone("America/New_York")).toBe("USD");
    expect(currencyForTimeZone("America/Toronto")).toBe("CAD");
    expect(currencyForTimeZone("Australia/Sydney")).toBe("AUD");
    expect(currencyForTimeZone("Asia/Dubai")).toBe("INR");
    expect(currencyForTimeZone(undefined)).toBe("INR");
  });

  it("keeps the saving at the offer percentage in every currency", () => {
    for (const code of ["INR", "USD", "GBP", "EUR", "CAD", "AUD"] as const) {
      const offer = convertFromInr(25000, code);
      const full = Number(formatFullPrice(25000, code).replace(/[^0-9]/g, ""));
      const saving = 1 - offer / full;
      expect(saving).toBeGreaterThanOrEqual(LAUNCH_OFFER.percentOff / 100);
      expect(saving).toBeLessThan(LAUNCH_OFFER.percentOff / 100 + 0.02);
    }
  });
});
