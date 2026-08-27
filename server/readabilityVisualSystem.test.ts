import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const stylesheet = readFileSync(resolve(import.meta.dirname, "../client/src/index.css"), "utf8");
const readabilityLayer = stylesheet.slice(stylesheet.indexOf("/* Readability refinement"));

function contrastRatio(foreground: string, background: string) {
  const rgb = (hex: string) => hex.match(/[a-f\d]{2}/gi)!.map((part) => Number.parseInt(part, 16) / 255);
  const luminance = (hex: string) => {
    const [r, g, b] = rgb(hex).map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [light, dark] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
}

describe("public readability visual system", () => {
  it("keeps essential ivory-surface text and interactive brass accents at WCAG AA contrast", () => {
    expect(contrastRatio("#1b1a18", "#f7f4ef")).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio("#6b6459", "#f7f4ef")).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio("#765516", "#f7f4ef")).toBeGreaterThanOrEqual(4.5);
  });

  it("uses an explicit readable scale for catalogue filters, actions, and technical disclosures", () => {
    expect(readabilityLayer).toContain("--text-control: .82rem");
    expect(readabilityLayer).toContain(".catalog-filter select { min-height: 46px");
    expect(readabilityLayer).toContain(".catalog-stone-actions a { min-height: 42px");
    expect(readabilityLayer).toContain(".catalog-stone-details dt { margin-bottom: .38rem; font-size: var(--text-detail-label)");
    expect(readabilityLayer).toContain(".catalog-stone-details dd { font-size: var(--text-detail-value)");
  });

  it("keeps the readability layer presentation-only and never references source media or data procedures", () => {
    expect(readabilityLayer).not.toMatch(/manus-storage|\.jpg|\.png|\.webp|trpc|availability\.profiles|verifyUrl|videoUrl/i);
  });
});
