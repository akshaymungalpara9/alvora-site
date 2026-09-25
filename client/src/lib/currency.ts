import { useSyncExternalStore } from "react";
import { BASE_CURRENCY, availableCurrencies, currencyForTimeZone, type CurrencyCode } from "@shared/jewellery/currency";

const STORAGE_KEY = "alvora-currency";
const listeners = new Set<() => void>();
let current: CurrencyCode | null = null;

function initial(): CurrencyCode {
  const offered = new Set(availableCurrencies().map((c) => c.code));
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY) as CurrencyCode | null;
    if (saved && offered.has(saved)) return saved;
  } catch {
    // Storage blocked: fall back to the time-zone guess.
  }
  return currencyForTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
}

function read(): CurrencyCode {
  if (current == null) current = typeof window === "undefined" ? BASE_CURRENCY : initial();
  return current;
}

export function setCurrency(code: CurrencyCode) {
  current = code;
  try {
    window.localStorage.setItem(STORAGE_KEY, code);
  } catch {
    // Not saved; the choice still applies until the page is closed.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The visitor's display currency: their saved choice, else a guess from their time zone. */
export function useCurrency(): CurrencyCode {
  return useSyncExternalStore(subscribe, read, () => BASE_CURRENCY);
}
