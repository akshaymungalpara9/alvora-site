import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { classifySource, landingContext, rememberLandingPage } from "../client/src/lib/ga4";

function mockSessionStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => void store.set(key, String(value)),
    removeItem: (key: string) => void store.delete(key),
    clear: () => store.clear(),
  };
}

function mockWindow(path: string, search = "", referrer = "") {
  const sessionStorage = mockSessionStorage();
  (globalThis as Record<string, unknown>).window = {
    location: { pathname: path, search, hostname: "www.alvoradiamonds.com" },
    sessionStorage,
  };
  (globalThis as Record<string, unknown>).document = { referrer };
  return sessionStorage;
}

beforeEach(() => {
  // Each test installs its own window/document mocks.
});

afterEach(() => {
  delete (globalThis as Record<string, unknown>).window;
  delete (globalThis as Record<string, unknown>).document;
});

describe("classifySource", () => {
  it("maps paid campaign utm_source values to their channel", () => {
    expect(classifySource("", "pinterest")).toBe("pinterest");
    expect(classifySource("", "Instagram")).toBe("instagram");
    expect(classifySource("", "ig")).toBe("instagram");
    expect(classifySource("", "indiamart")).toBe("indiamart");
    expect(classifySource("", "google")).toBe("google");
    expect(classifySource("", "bing")).toBe("bing");
    expect(classifySource("", "newsletter")).toBe("email");
    expect(classifySource("", "chatgpt")).toBe("ai_assistant");
    expect(classifySource("", "flyer")).toBe("other");
  });

  it("prefers utm_source over the referrer host", () => {
    expect(classifySource("www.google.com", "pinterest")).toBe("pinterest");
  });

  it("maps AI assistant referrers", () => {
    for (const host of ["chatgpt.com", "chat.openai.com", "perplexity.ai", "gemini.google.com", "copilot.microsoft.com", "claude.ai"]) {
      expect(classifySource(host, "")).toBe("ai_assistant");
    }
  });

  it("maps search and social referrers", () => {
    expect(classifySource("www.google.com", "")).toBe("google");
    expect(classifySource("google.co.uk", "")).toBe("google");
    expect(classifySource("www.bing.com", "")).toBe("bing");
    expect(classifySource("in.pinterest.com", "")).toBe("pinterest");
    expect(classifySource("l.instagram.com", "")).toBe("instagram");
    expect(classifySource("seller.indiamart.com", "")).toBe("indiamart");
    expect(classifySource("example.com", "")).toBe("other");
  });

  it("returns direct when there is no referrer and no utm_source", () => {
    expect(classifySource("", "")).toBe("direct");
  });
});

describe("landing record", () => {
  it("stores the first page, external referrer and UTM tags", () => {
    mockWindow("/engagement-rings", "?utm_source=pinterest&utm_medium=social&utm_campaign=p1-2026-10", "https://in.pinterest.com/pin/123/");
    rememberLandingPage();
    expect(landingContext()).toEqual({
      landingPage: "/engagement-rings",
      referrer: "in.pinterest.com",
      utmSource: "pinterest",
      utmMedium: "social",
      utmCampaign: "p1-2026-10",
    });
  });

  it("keeps the first page when later pages call rememberLandingPage again", () => {
    mockWindow("/engagement-rings", "?utm_source=pinterest");
    rememberLandingPage();
    window.location.pathname = "/jewellery/valen-marquise-solitaire";
    window.location.search = "";
    rememberLandingPage();
    expect(landingContext().landingPage).toBe("/engagement-rings");
    expect(landingContext().utmSource).toBe("pinterest");
  });

  it("works without UTM tags and drops internal referrers", () => {
    mockWindow("/", "", "https://www.alvoradiamonds.com/jewellery");
    rememberLandingPage();
    const ctx = landingContext();
    expect(ctx).toEqual({ landingPage: "/", referrer: "", utmSource: "", utmMedium: "", utmCampaign: "" });
    expect(classifySource(ctx.referrer, ctx.utmSource)).toBe("direct");
  });

  it("reads legacy records that predate UTM storage", () => {
    const sessionStorage = mockWindow("/jewellery");
    sessionStorage.setItem("alvora_landing", JSON.stringify({ path: "/engagement-rings", referrer: "www.google.com" }));
    const ctx = landingContext();
    expect(ctx).toEqual({ landingPage: "/engagement-rings", referrer: "www.google.com", utmSource: "", utmMedium: "", utmCampaign: "" });
    expect(classifySource(ctx.referrer, ctx.utmSource)).toBe("google");
  });

  it("falls back to the current page when nothing was stored", () => {
    mockWindow("/contact");
    expect(landingContext().landingPage).toBe("/contact");
  });
});
