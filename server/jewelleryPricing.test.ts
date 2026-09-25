import { describe, expect, it } from "vitest";
import { CENTRE_STONE_CARATS } from "@shared/jewellery/centreStone";
import { convertFromInr, currencyForTimeZone, formatMoney } from "@shared/jewellery/currency";
import { LAUNCH_OFFER, RING_METALS, RING_PRICES_INR, fromPriceInr, fullPriceInr, launchOfferActive, ringPriceInr } from "@shared/jewellery/pricing";
import { PUBLIC_PIECES } from "@shared/jewellery/catalog";

describe("jewellery pricing", () => {
  it("prices every metal at every centre-stone size, rising with carat", () => {
    for (const { value } of RING_METALS) {
      const prices = CENTRE_STONE_CARATS.map((carat) => ringPriceInr(value, carat));
      expect(prices.every((p) => typeof p === "number" && p > 0)).toBe(true);
      for (let i = 1; i < prices.length; i += 1) expect(prices[i]!).toBeGreaterThan(prices[i - 1]!);
    }
  });

  it("matches the owner's table at its ends", () => {
    expect(RING_PRICES_INR.silver["0.5"]).toBe(25000);
    expect(RING_PRICES_INR.silver["6"]).toBe(330000);
    expect(RING_PRICES_INR["14K"]["2"]).toBe(170000);
    expect(RING_PRICES_INR["18K"]["6"]).toBe(520000);
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
    expect(Math.abs(1 - 25000 / full - LAUNCH_OFFER.percentOff / 100)).toBeLessThan(0.002);
    if (LAUNCH_OFFER.endsOn == null) expect(launchOfferActive()).toBe(false);
    else expect(launchOfferActive(new Date(`${LAUNCH_OFFER.endsOn}T23:00:00+05:30`))).toBe(true);
  });

  it("formats rupees and falls back to rupees for currencies without a rate", () => {
    expect(formatMoney(250000, "INR")).toBe("₹2,50,000");
    expect(convertFromInr(25000, "INR")).toBe(25000);
    expect(currencyForTimeZone("Asia/Kolkata")).toBe("INR");
    expect(currencyForTimeZone(undefined)).toBe("INR");
  });
});
