import { describe, expect, it } from "vitest";

describe("Resend configuration", () => {
  it("authenticates against the domains endpoint with the configured key", async () => {
    const apiKey = process.env.RESEND_API_KEY;

    expect(apiKey, "RESEND_API_KEY must be configured").toBeTruthy();

    const response = await fetch("https://api.resend.com/domains", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(12_000),
    });

    expect(response.status, "Resend should accept the configured API key").toBe(200);
    const payload = (await response.json()) as { object?: string; data?: unknown[] };
    expect(payload.object).toBe("list");
    expect(Array.isArray(payload.data)).toBe(true);
  }, 15_000);
});
