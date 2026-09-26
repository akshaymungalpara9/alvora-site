/**
 * Display currencies for retail prices.
 *
 * Prices are set in rupees (pricing.ts). Other currencies are converted with
 * owner-set rates (rupees per one unit) and rounded to a tidy amount. A
 * currency with no rate is not offered; visitors then see USD.
 * The visitor may change the display currency with the switcher.
 */

export type CurrencyCode = "INR" | "USD" | "GBP" | "EUR" | "AED" | "CAD" | "AUD" | "SGD";

type Currency = {
  code: CurrencyCode;
  label: string;
  /** Rupees per one unit of this currency. null = not offered yet. */
  inrPerUnit: number | null;
  /** Converted prices are rounded to this step. */
  roundTo: number;
  locale: string;
};

/** Owner-set rates (2026-09-25). AED and SGD have no rate yet, so they are not offered. */
export const CURRENCIES: Currency[] = [
  { code: "INR", label: "₹ INR", inrPerUnit: 1, roundTo: 100, locale: "en-IN" },
  { code: "USD", label: "$ USD", inrPerUnit: 96, roundTo: 10, locale: "en-US" },
  { code: "GBP", label: "£ GBP", inrPerUnit: 126, roundTo: 10, locale: "en-GB" },
  { code: "EUR", label: "€ EUR", inrPerUnit: 110, roundTo: 10, locale: "en-IE" },
  { code: "AED", label: "AED", inrPerUnit: null, roundTo: 50, locale: "en-AE" },
  { code: "CAD", label: "$ CAD", inrPerUnit: 70, roundTo: 10, locale: "en-CA" },
  { code: "AUD", label: "$ AUD", inrPerUnit: 70, roundTo: 10, locale: "en-AU" },
  { code: "SGD", label: "$ SGD", inrPerUnit: null, roundTo: 10, locale: "en-SG" },
];

export const BASE_CURRENCY: CurrencyCode = "INR";
export const DEFAULT_DISPLAY_CURRENCY: CurrencyCode = "USD";

const EUROZONE_COUNTRIES = new Set("AT BE CY DE EE ES FI FR GR HR IE IT LT LU LV MT NL PT SI SK".split(" "));

export function currencyForCountry(country: string | null | undefined): CurrencyCode {
  const code: CurrencyCode = country === "IN" ? "INR" : country === "GB" ? "GBP" : country === "CA" ? "CAD" : country === "AU" ? "AUD" : country && EUROZONE_COUNTRIES.has(country) ? "EUR" : DEFAULT_DISPLAY_CURRENCY;
  return availableCurrencies().some((entry) => entry.code === code) ? code : DEFAULT_DISPLAY_CURRENCY;
}

export function availableCurrencies() {
  return CURRENCIES.filter((c) => c.inrPerUnit != null);
}

function currency(code: CurrencyCode) {
  const found = CURRENCIES.find((c) => c.code === code && c.inrPerUnit != null);
  return found ?? CURRENCIES.find((c) => c.code === DEFAULT_DISPLAY_CURRENCY)!;
}

/** Rupee amount in the given currency, rounded to its tidy step. */
export function convertFromInr(amountInr: number, code: CurrencyCode) {
  const { inrPerUnit, roundTo } = currency(code);
  if (code === BASE_CURRENCY) return amountInr;
  return Math.round(amountInr / inrPerUnit! / roundTo) * roundTo;
}

/** Format an amount already in the given currency. */
export function formatAmount(amount: number, code: CurrencyCode) {
  const target = currency(code);
  return new Intl.NumberFormat(target.locale, { style: "currency", currency: target.code, maximumFractionDigits: 0 }).format(amount);
}

export function formatMoney(amountInr: number, code: CurrencyCode = BASE_CURRENCY) {
  return formatAmount(convertFromInr(amountInr, code), currency(code).code);
}

export function roundingStep(code: CurrencyCode) {
  return currency(code).roundTo;
}
