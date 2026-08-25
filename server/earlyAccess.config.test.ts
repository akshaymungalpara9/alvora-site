import { describe, expect, it } from "vitest";
import { ENV } from "./_core/env";

describe("early-access rollout configuration", () => {
  it("keeps buyer activation disabled until the rollout is explicitly enabled", () => {
    expect(ENV.alvoraEarlyAccessEnabled).toBe(false);
  });
});
