import { useEffect, useSyncExternalStore } from "react";
import { launchOfferActive } from "@shared/jewellery/pricing";
import { DEFAULT_DISPLAY_CURRENCY, availableCurrencies, currencyForCountry, type CurrencyCode } from "@shared/jewellery/currency";

const STORAGE_KEY = "alvora-currency";
const GEO_KEY = "alvora-geo-country";
const listeners = new Set<() => void>();
let current: CurrencyCode = DEFAULT_DISPLAY_CURRENCY;
let started = false;
let manuallySelected = false;

export function chooseCurrency(saved: CurrencyCode | null, country: string | null, timeZone?: string): CurrencyCode {
  if (saved && availableCurrencies().some((entry) => entry.code === saved)) return saved;
  if (country) return currencyForCountry(country);
  if (timeZone === "Asia/Kolkata" || timeZone === "Asia/Calcutta") return "INR";
  return DEFAULT_DISPLAY_CURRENCY;
}

function storedChoice(): CurrencyCode | null {
  try { return window.localStorage.getItem(STORAGE_KEY) as CurrencyCode | null; } catch { return null; }
}
function timeZone(): string | undefined {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return undefined; }
}
function publish(code: CurrencyCode) {
  if (current !== code) { current = code; listeners.forEach((listener) => listener()); }
}

function startGeo() {
  if (started || typeof window === "undefined" || (window as Window & { __ALVORA_PRERENDER__?: boolean }).__ALVORA_PRERENDER__) return;
  started = true;
  const saved = storedChoice();
  if (saved && availableCurrencies().some((entry) => entry.code === saved)) { publish(saved); return; }
  try {
    const cached = window.sessionStorage.getItem(GEO_KEY);
    if (cached !== null) { publish(chooseCurrency(null, cached || null, timeZone())); return; }
  } catch { /* Storage may be blocked. */ }
  // Keep USD on screen while the network answer is pending, even in India.
  fetch("/api/geo").then((response) => response.ok ? response.json() : { country: null })
    .then((data: { country?: unknown }) => {
      const country = typeof data.country === "string" && /^[A-Z]{2}$/.test(data.country) ? data.country : null;
      try { window.sessionStorage.setItem(GEO_KEY, country ?? ""); } catch { /* Storage may be blocked. */ }
      if (!manuallySelected) publish(chooseCurrency(storedChoice(), country, timeZone()));
    }).catch(() => { if (!manuallySelected) publish(chooseCurrency(storedChoice(), null, timeZone())); });
}

export function setCurrency(code: CurrencyCode) {
  if (!availableCurrencies().some((entry) => entry.code === code)) return;
  manuallySelected = true;
  publish(code);
  try { window.localStorage.setItem(STORAGE_KEY, code); } catch { /* Choice lasts until reload. */ }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** USD is the stable first-paint and prerender value; geo updates after hydration. */
export function useCurrency(): CurrencyCode {
  useEffect(startGeo, []);
  return useSyncExternalStore(subscribe, () => current, () => DEFAULT_DISPLAY_CURRENCY);
}

export function currentCurrency(): CurrencyCode { return current; }

/** Snapshots omit dated offers; human visitors see them while they run. */
export function showLaunchOffer() {
  if (typeof window !== "undefined" && (window as Window & { __ALVORA_PRERENDER__?: boolean }).__ALVORA_PRERENDER__) return false;
  return launchOfferActive();
}
