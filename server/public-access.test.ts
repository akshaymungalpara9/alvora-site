import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  listPublicAvailabilityProfiles: vi.fn(),
}));

vi.mock("./db", async importOriginal => ({
  ...(await importOriginal<typeof import("./db")>()),
  ...mocks,
}));

import { publicAvailabilityRouter } from "./routers/availability";

describe("public catalogue access", () => {
  it("allows an anonymous visitor to read active current-production inventory", async () => {
    mocks.listPublicAvailabilityProfiles.mockResolvedValue({
      import: { id: 1, activatedAt: new Date("2026-08-26T11:56:26.000Z") },
      profiles: [{ id: 11, stockNumber: "ALV-PUBLIC-001", category: "White", shape: "Round", carat: 1.25, color: "F", clarity: "VS2", reportNumber: "819696674" }],
      total: 1,
      page: 0,
      pageSize: 48,
    });

    const caller = publicAvailabilityRouter.createCaller({ req: {}, res: {}, user: null } as never);
    await expect(caller.profiles({ collection: "core", category: "White" })).resolves.toMatchObject({
      total: 1,
      profiles: [{ stockNumber: "ALV-PUBLIC-001" }],
    });
    expect(mocks.listPublicAvailabilityProfiles).toHaveBeenCalledWith({ collection: "core", category: "White" });
  });

  it("keeps the client bootstrap free of global unauthenticated auto-login behavior", () => {
    const bootstrap = readFileSync(resolve(process.cwd(), "client/src/main.tsx"), "utf8");

    expect(bootstrap).not.toContain("redirectToLoginIfUnauthorized");
    expect(bootstrap).not.toContain("startLogin(");
    expect(bootstrap).not.toContain("UNAUTHED_ERR_MSG");
  });
});
