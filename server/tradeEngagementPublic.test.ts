import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = new URL("..", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");

describe("trade engagement public surfaces", () => {
  it("keeps the optional referral attribution in every public production-brief route", () => {
    expect(read("client/src/pages/Home.tsx")).toContain('name="referrer_name"');
    const market = read("client/src/pages/MarketLanding.tsx");
    expect(market).toContain('name="referrer_name"');
    expect(market).toContain("Introduit par un contact professionnel");
    expect(market).toContain("Presentato da un contatto commerciale");
  });

  it("uses the requested anonymous WhatsApp event name without attaching buyer data", () => {
    const component = read("client/src/components/WhatsAppQuickContact.tsx");
    const helper = read("client/src/lib/whatsapp.ts");
    expect(component).toContain('data-umami-event="whatsapp_click"');
    expect(helper).toContain("Hello Alvora, I'd like to enquire about production availability.");
    expect(component).not.toContain("data-umami-event-email");
  });

  it("keeps unreviewed Insights notes out of buyer navigation while retaining a noindex preparation page", () => {
    const insights = read("client/src/pages/Insights.tsx");
    expect(insights).toContain("Manufacturing notes are in preparation.");
    expect(insights).not.toContain("Owner draft");
    expect(insights).not.toContain("Open draft");
    expect(insights).toContain('robots: "noindex,follow,max-image-preview:large"');
  });

  it("discloses the new WhatsApp event and qualifier email sequence in the public privacy draft", () => {
    const legal = read("client/src/pages/LegalPage.tsx");
    expect(legal).toContain("whatsapp_click");
    expect(legal).toContain("one concise follow-up after at least 24 hours");
    expect(legal).toContain("Resend");
  });

  it("keeps the private introduction route separate from public navigation", () => {
    const app = read("client/src/App.tsx");
    expect(app).toContain('path="/refer"');
    const refer = read("client/src/pages/Refer.tsx");
    expect(refer).toContain("existing Alvora trade accounts");
    expect(refer).toContain("first confirmed order");
    expect(refer).not.toMatch(/commission/i);
  });
});
