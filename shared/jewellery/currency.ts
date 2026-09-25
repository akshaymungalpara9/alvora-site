/**
 * Display currencies for retail prices.
 *
 * Prices are set in rupees (pricing.ts). Other currencies are converted with
 * owner-set rates (rupees per one unit) and rounded to a tidy amount. A
 * currency with no rate is not offered; visitors then see rupees.
 *
 * The visitor's currency is guessed from their time zone (no location
 * lookup) and can be changed with the currency switcher.
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

export const CURRENCIES: Currency[] = [
  { code: "INR", label: "₹ INR", inrPerUnit: 1, roundTo: 100, locale: "en-IN" },
  { code: "USD", label: "$ USD", inrPerUnit: null, roundTo: 10, locale: "en-US" },
  { code: "GBP", label: "£ GBP", inrPerUnit: null, roundTo: 10, locale: "en-GB" },
  { code: "EUR", label: "€ EUR", inrPerUnit: null, roundTo: 10, locale: "en-IE" },
  { code: "AED", label: "AED", inrPerUnit: null, roundTo: 50, locale: "en-AE" },
  { code: "CAD", label: "$ CAD", inrPerUnit: null, roundTo: 10, locale: "en-CA" },
  { code: "AUD", label: "$ AUD", inrPerUnit: null, roundTo: 10, locale: "en-AU" },
  { code: "SGD", label: "$ SGD", inrPerUnit: null, roundTo: 10, locale: "en-SG" },
];

export const BASE_CURRENCY: CurrencyCode = "INR";

export function availableCurrencies() {
  return CURRENCIES.filter((c) => c.inrPerUnit != null);
}

function currency(code: CurrencyCode) {
  const found = CURRENCIES.find((c) => c.code === code && c.inrPerUnit != null);
  return found ?? CURRENCIES[0];
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

const EUROZONE = new Set([
  "Amsterdam", "Athens", "Berlin", "Bratislava", "Brussels", "Dublin", "Helsinki", "Lisbon", "Ljubljana", "Luxembourg", "Madrid",
  "Malta", "Monaco", "Paris", "Riga", "Rome", "Tallinn", "Vienna", "Vilnius", "Zagreb", "Nicosia", "Andorra", "San_Marino", "Vatican",
]);

/** Best guess from an IANA time zone such as "Europe/London". */
export function currencyForTimeZone(timeZone: string | undefined): CurrencyCode {
  if (!timeZone) return BASE_CURRENCY;
  const [region, city = ""] = timeZone.split("/");
  let guess: CurrencyCode = "USD";
  if (timeZone === "Asia/Kolkata" || timeZone === "Asia/Calcutta") guess = "INR";
  else if (timeZone === "Europe/London" || timeZone === "Europe/Belfast") guess = "GBP";
  else if (region === "Europe" && EUROZONE.has(city)) guess = "EUR";
  else if (timeZone === "Asia/Dubai") guess = "AED";
  else if (timeZone === "Asia/Singapore") guess = "SGD";
  else if (region === "Australia") guess = "AUD";
  else if (/^America\/(Toronto|Vancouver|Edmonton|Winnipeg|Halifax|St_Johns|Regina|Montreal)$/.test(timeZone)) guess = "CAD";
  return currency(guess).code;
}
