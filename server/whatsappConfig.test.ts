import { describe, expect, it } from "vitest";

describe("WhatsApp Business configuration", () => {
  it("uses an international-digit number accepted by the public WhatsApp click-to-chat endpoint", async () => {
    const number = process.env.VITE_ALVORA_WHATSAPP_NUMBER ?? "";
    expect(number).toMatch(/^\d{8,15}$/);
    const response = await fetch(`https://wa.me/${number}`, { method: "HEAD", redirect: "manual" });
    expect([200, 301, 302, 303, 307, 308]).toContain(response.status);
  });
});
