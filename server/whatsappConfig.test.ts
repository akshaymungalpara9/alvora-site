import { describe, expect, it } from "vitest";
import { buildWhatsAppHref, isInternationalWhatsAppNumber, normalizeWhatsAppNumber } from "../client/src/lib/whatsapp";
import { COMPANY } from "../shared/companyInfo";

describe("WhatsApp Business configuration", () => {
  it("uses an international-digit number accepted by the public WhatsApp click-to-chat endpoint", async () => {
    const number = normalizeWhatsAppNumber(COMPANY.whatsappNumber);
    expect(isInternationalWhatsAppNumber(number)).toBe(true);
    expect(buildWhatsAppHref(number)).toContain(`https://wa.me/${number}?`);
    expect(buildWhatsAppHref("9924490125")).toBeNull();
    const response = await fetch(`https://wa.me/${number}`, { method: "HEAD", redirect: "manual" });
    expect([200, 301, 302, 303, 307, 308]).toContain(response.status);
  }, 10_000);
});
