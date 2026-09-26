import { describe, expect, it } from "vitest";
import { countryForIp } from "./geo";
import { currencyForCountry, convertFromInr, DEFAULT_DISPLAY_CURRENCY } from "@shared/jewellery/currency";
import { chooseCurrency } from "../client/src/lib/currency";
import { PUBLIC_PIECES } from "@shared/jewellery/catalog";
import { fromPriceInr } from "@shared/jewellery/pricing";
import { resolveRouteMeta, injectSeoIntoHtml } from "./seoInjection";

describe("geo currency", () => {
  it("maps countries with offered rates and falls back to USD", () => {
    for (const [country, code] of Object.entries({ IN: "INR", US: "USD", GB: "GBP", CA: "CAD", AU: "AUD", DE: "EUR", FR: "EUR", AE: "USD", SG: "USD" }))
      expect(currencyForCountry(country)).toBe(code);
    expect(currencyForCountry(null)).toBe("USD");
    expect(currencyForCountry("BR")).toBe("USD");
  });
  it("places saved choice above geo, geo above USD, and uses India time zone only for null geo", () => {
    expect(chooseCurrency("EUR", "IN", "America/New_York")).toBe("EUR");
    expect(chooseCurrency(null, "GB", "Asia/Kolkata")).toBe("GBP");
    expect(chooseCurrency(null, null, "Europe/London")).toBe("USD");
    expect(chooseCurrency(null, null, "Asia/Kolkata")).toBe("INR");
    expect(chooseCurrency(null, null, "Asia/Calcutta")).toBe("INR");
  });
  it("starts with USD, never INR, without saved choice or geo answer", () => {
    expect(DEFAULT_DISPLAY_CURRENCY).toBe("USD");
    expect(chooseCurrency(null, null)).toBe("USD");
  });
  it("reads a local database and rejects local IPs", () => {
    expect(countryForIp("8.8.8.8")).toBe("US");
    expect(countryForIp("49.36.0.1")).toBe("IN");
    expect(countryForIp("81.2.69.142")).toBe("GB");
    for (const ip of ["127.0.0.1", "10.0.0.1", "192.168.1.1", "172.16.0.1", "169.254.1.1", "::1", "fc00::1", "not an ip"])
      expect(countryForIp(ip)).toBeNull();
  });
  it("makes product JSON-LD and social price agree with the visible USD conversion", () => {
    const piece = PUBLIC_PIECES.find((item) => fromPriceInr(item) != null)!;
    const path = `/jewellery/${piece.slug}`;
    const meta = resolveRouteMeta(path, "https://example.com")!;
    const product = (meta.serviceJsonLd as Array<Record<string, any>>).find((item) => item["@type"] === "Product")!;
    expect(product.offers.priceCurrency).toBe("USD");
    expect(product.offers.lowPrice).toBe(convertFromInr(fromPriceInr(piece)!, "USD"));
    const html = injectSeoIntoHtml("<html><head></head><body></body></html>", path, "https://example.com");
    expect(html).toContain(`property="product:price:amount" content="${product.offers.lowPrice}"`);
    expect(html).toContain('property="product:price:currency" content="USD"');
  });
});
