/**
 * Retail prices in Indian rupees (owner-set, 2026-09-25).
 *
 * Engagement rings are priced by metal and centre-stone carat from one table;
 * the "From" price is the smallest stone in silver. Other pieces show
 * "Price on request" until the owner sets rupee prices for them.
 *
 * LAUNCH_OFFER: the table prices are the offer prices. While the offer runs
 * (until `endsOn`, inclusive), the full price is shown struck through beside
 * them. The full price must be what is charged once the offer ends, so the
 * saving shown is genuine. With no end date set, no discount is shown.
 */
import { CENTRE_STONE_CARATS, hasCentreStone } from "./centreStone";
import { convertFromInr, formatAmount, formatMoney, roundingStep, type CurrencyCode } from "./currency";
import type { JewelleryPiece } from "./catalog";

export type RingMetal = "silver" | "14K" | "18K" | "platinum";

export const RING_METALS: Array<{ value: RingMetal; label: string; gold: boolean }> = [
  { value: "silver", label: "Silver", gold: false },
  { value: "14K", label: "14K gold", gold: true },
  { value: "18K", label: "18K gold", gold: true },
  { value: "platinum", label: "Platinum", gold: false },
];

const k = 1000;
/** Price in INR by metal, then by centre-stone carat (CENTRE_STONE_CARATS). */
export const RING_PRICES_INR: Record<RingMetal, Record<string, number>> = {
  silver: { "0.5": 25 * k, "1": 45 * k, "1.5": 70 * k, "2": 90 * k, "2.5": 120 * k, "3": 150 * k, "3.5": 180 * k, "4": 210 * k, "4.5": 240 * k, "5": 270 * k, "5.5": 300 * k, "6": 330 * k },
  "14K": { "0.5": 70 * k, "1": 90 * k, "1.5": 130 * k, "2": 170 * k, "2.5": 210 * k, "3": 240 * k, "3.5": 280 * k, "4": 320 * k, "4.5": 360 * k, "5": 400 * k, "5.5": 440 * k, "6": 480 * k },
  "18K": { "0.5": 90 * k, "1": 120 * k, "1.5": 160 * k, "2": 200 * k, "2.5": 240 * k, "3": 280 * k, "3.5": 320 * k, "4": 360 * k, "4.5": 400 * k, "5": 440 * k, "5.5": 480 * k, "6": 520 * k },
  // Owner-confirmed: platinum is priced the same as 14K gold.
  platinum: { "0.5": 70 * k, "1": 90 * k, "1.5": 130 * k, "2": 170 * k, "2.5": 210 * k, "3": 240 * k, "3.5": 280 * k, "4": 320 * k, "4.5": 360 * k, "5": 400 * k, "5.5": 440 * k, "6": 480 * k },
};

export const LAUNCH_OFFER: { percentOff: number; endsOn: string | null } = {
  percentOff: 30,
  /** Last day of the offer, YYYY-MM-DD (India time). Set by the owner. */
  endsOn: null,
};

type PricedPiece = Pick<JewelleryPiece, "category" | "collections">;

/** Engagement rings follow the rupee price table. */
export function hasRingPricing(piece: PricedPiece) {
  return piece.category === "ring" && hasCentreStone(piece);
}

export function ringPriceInr(metal: RingMetal, carat: string): number | null {
  return RING_PRICES_INR[metal]?.[carat] ?? null;
}

/** Lowest price a customer can choose, or null for "Price on request". */
export function fromPriceInr(piece: PricedPiece): number | null {
  if (!hasRingPricing(piece)) return null;
  return Math.min(...RING_METALS.flatMap(({ value }) => CENTRE_STONE_CARATS.map((carat) => RING_PRICES_INR[value][carat])));
}

/** Highest price a customer can choose, or null. */
export function highPriceInr(piece: PricedPiece): number | null {
  if (!hasRingPricing(piece)) return null;
  return Math.max(...RING_METALS.flatMap(({ value }) => CENTRE_STONE_CARATS.map((carat) => RING_PRICES_INR[value][carat])));
}

function todayInIndia(now: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(now);
}

export function launchOfferActive(now = new Date()) {
  return LAUNCH_OFFER.endsOn != null && todayInIndia(now) <= LAUNCH_OFFER.endsOn;
}

/** Full price before the launch offer, rounded to the nearest ₹100. */
export function fullPriceInr(offerPrice: number) {
  return Math.round(offerPrice / (1 - LAUNCH_OFFER.percentOff / 100) / 100) * 100;
}

/**
 * Full price shown beside an offer price in any currency. Worked out from the
 * converted offer price, so the saving shown stays at the offer's percentage.
 */
export function formatFullPrice(offerPriceInr: number, code: CurrencyCode) {
  const step = roundingStep(code);
  const offer = convertFromInr(offerPriceInr, code);
  return formatAmount(Math.round(offer / (1 - LAUNCH_OFFER.percentOff / 100) / step) * step, code);
}

/** Rupees, e.g. "₹25,000" (search results and structured data use rupees). */
export function formatInr(amount: number) {
  return formatMoney(amount, "INR");
}

/** "12 December 2026" for the offer end date. */
export function formatOfferEnd(endsOn = LAUNCH_OFFER.endsOn) {
  if (!endsOn) return "";
  const [year, month, day] = endsOn.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(Date.UTC(year, month - 1, day));
}
