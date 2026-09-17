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
    // Articles moved to content/{insights,paa-pages}/*.md, loaded via glob in insightsArticles.ts
    const articlesLoader = read("client/src/lib/insightsArticles.ts");
    expect(articlesLoader).toContain("content/insights/*.md");
    expect(articlesLoader).toContain("content/paa-pages/*.md");
    expect(articlesLoader).toContain("INSIGHT_ARTICLES");
    // Two representative articles exist as real markdown files
    expect(() => read("content/paa-pages/are-lab-grown-diamonds-real-diamonds.md")).not.toThrow();
    expect(() => read("content/insights/cvd-vs-hpht-lab-grown-diamonds.md")).not.toThrow();
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
