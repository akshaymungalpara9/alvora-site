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

  it("publishes the Insights hub with real article links and no draft content", () => {
    const insights = read("client/src/pages/Insights.tsx");
    const content = read("client/src/lib/insightsContent.ts");
    // Real articles are in the published INSIGHTS array
    expect(content).toContain("export const INSIGHTS");
    expect(content).toContain("are-lab-grown-diamonds-real-diamonds");
    expect(content).toContain("cvd-vs-hpht-lab-grown-diamonds");
    // No draft labels in the hub or article renderer
    expect(insights).not.toContain("Owner draft");
    expect(insights).not.toContain("Open draft");
    // Hub renders article list; articles render with ReactMarkdown
    expect(insights).toContain("InsightHub");
    expect(insights).toContain("InsightArticlePage");
    expect(insights).toContain("ReactMarkdown");
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
