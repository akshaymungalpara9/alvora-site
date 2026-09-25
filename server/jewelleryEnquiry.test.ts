import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * A tiny stand-in for the drizzle client: records inserts/updates and
 * returns the last inserted row from selects.
 */
const state = vi.hoisted(() => ({
  available: true,
  rows: [] as Array<Record<string, unknown>>,
  updates: [] as Array<Record<string, unknown>>,
  executed: [] as string[],
}));

function fakeDb() {
  const selectChain = {
    from: () => selectChain,
    where: () => selectChain,
    orderBy: () => Promise.resolve([...state.rows].reverse()),
    limit: () => Promise.resolve(state.rows.slice(-1)),
  };
  return {
    execute: (query: { queryChunks?: Array<{ value?: string[] }> }) => {
      state.executed.push(JSON.stringify(query));
      return Promise.resolve();
    },
    insert: () => ({
      values: (values: Record<string, unknown>) => {
        const id = state.rows.length + 41;
        state.rows.push({ id, alertStatus: "pending", followUpStatus: "new", createdAt: new Date("2026-09-24T10:00:00Z"), ...values });
        return Promise.resolve([{ insertId: id }]);
      },
    }),
    select: () => selectChain,
    update: () => ({
      set: (values: Record<string, unknown>) => ({
        where: () => {
          state.updates.push(values);
          Object.assign(state.rows[state.rows.length - 1] ?? {}, values);
          return Promise.resolve();
        },
      }),
    }),
  };
}

const email = vi.hoisted(() => ({ sendTransactionalEmail: vi.fn() }));

vi.mock("./db", () => ({ getDb: async () => (state.available ? fakeDb() : null) }));
vi.mock("./email", () => ({ escapeHtml: (value: string) => value, sendTransactionalEmail: email.sendTransactionalEmail }));

import { ENV } from "./_core/env";
import { JEWELLERY_ENQUIRIES_DDL, buildJewelleryAlert, csvCell } from "./jewelleryEnquiries";
import { adminJewelleryRouter, jewelleryRouter } from "./routers/jewellery";
import { PUBLIC_PIECES } from "@shared/jewellery/catalog";

const piece = PUBLIC_PIECES[0];
const pieceInput = {
  kind: "piece" as const,
  pieceCode: piece.code,
  metal: "Yellow gold" as const,
  karat: "14K" as const,
  ringSize: "US 6",
  contactName: "Maya Shah",
  email: "Maya@Example.com",
  preferredContact: "whatsapp" as const,
  phone: "+44 7700 900123",
  message: "Could this be made with a slightly thinner band?",
};

const adminContext = (role: "admin" | "user") => ({
  user: { id: 2, openId: "jw", name: "Admin", email: "a@alvora.example", loginMethod: "email", role, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
  req: { protocol: "https", get: () => "alvora.example" },
  res: {},
});

describe("jewellery enquiries", () => {
  const originalAlertTo = ENV.leadAlertTo;

  beforeEach(() => {
    state.available = true;
    state.rows = [];
    state.updates = [];
    state.executed = [];
    email.sendTransactionalEmail.mockReset();
    ENV.leadAlertTo = "alerts@alvora.example";
  });
  afterEach(() => {
    ENV.leadAlertTo = originalAlertTo;
  });

  it("saves the enquiry before sending the alert, then acknowledges the customer", async () => {
    email.sendTransactionalEmail.mockResolvedValue({ id: "resend-1" });
    const result = await jewelleryRouter.createCaller({} as never).submit(pieceInput);

    expect(result).toEqual({ enquiryId: 41, saved: true, alertStatus: "sent" });
    // First use creates the table (once per process).
    expect(state.executed.join("")).toContain("CREATE TABLE IF NOT EXISTS");
    expect(state.rows[0]).toMatchObject({ pieceCode: piece.code, pieceName: piece.name, email: "maya@example.com", ringSize: "US 6" });
    const [alert, ack] = email.sendTransactionalEmail.mock.calls.map((call) => call[0]);
    expect(alert.to).toBe("alerts@alvora.example");
    expect(alert.replyTo).toBe("maya@example.com");
    expect(alert.subject).toContain(`[Jewellery] ${piece.name}`);
    expect(alert.subject).toContain("14K yellow gold");
    expect(ack.to).toBe("maya@example.com");
    expect(state.updates).toContainEqual(expect.objectContaining({ alertStatus: "sent", alertMessageId: "resend-1" }));
  });

  it("creates the table with the same statement as the migration, and accepts consultations", async () => {
    email.sendTransactionalEmail.mockResolvedValue({ id: "x" });
    await expect(jewelleryRouter.createCaller({} as never).submit({ ...pieceInput, kind: "consultation", pieceCode: undefined })).resolves.toMatchObject({ saved: true });
    expect(email.sendTransactionalEmail.mock.calls[0][0].subject).toContain("[Consultation]");
    const migration = readFileSync("drizzle/0013_jewellery_enquiries.sql", "utf8").trim();
    expect(JEWELLERY_ENQUIRIES_DDL.trim()).toBe(migration);
  });

  it("keeps the saved enquiry and records a failed alert", async () => {
    email.sendTransactionalEmail.mockRejectedValueOnce(new Error("mail down")).mockResolvedValue({ id: "ack" });
    const result = await jewelleryRouter.createCaller({} as never).submit(pieceInput);
    expect(result).toMatchObject({ saved: true, alertStatus: "failed" });
    expect(state.updates).toContainEqual(expect.objectContaining({ alertStatus: "failed", alertError: "mail down" }));
  });

  it("still emails the team when the database is unavailable", async () => {
    state.available = false;
    email.sendTransactionalEmail.mockResolvedValue({ id: "fallback" });
    const result = await jewelleryRouter.createCaller({} as never).submit(pieceInput);
    expect(result).toEqual({ enquiryId: null, saved: false, alertStatus: "sent" });
    expect(email.sendTransactionalEmail.mock.calls[0][0].text).toContain("NOT SAVED");
  });

  it("rejects honeypot submissions and unknown pieces without saving or emailing", async () => {
    const caller = jewelleryRouter.createCaller({} as never);
    await expect(caller.submit({ ...pieceInput, website: "https://spam.example" })).rejects.toThrow();
    await expect(caller.submit({ ...pieceInput, pieceCode: "ALV-R-9999" })).rejects.toThrow();
    expect(state.rows).toHaveLength(0);
    expect(email.sendTransactionalEmail).not.toHaveBeenCalled();
  });

  it("names the maker only in the internal alert, never to the customer", async () => {
    email.sendTransactionalEmail.mockResolvedValue({ id: "x" });
    await jewelleryRouter.createCaller({} as never).submit(pieceInput);
    const [alert, ack] = email.sendTransactionalEmail.mock.calls.map((call) => call[0]);
    expect(alert.text).toContain("Internal - maker");
    expect(`${ack.subject} ${ack.text} ${ack.html}`.toLowerCase()).not.toMatch(/junerings|pooja|caratdiamonds|maker/);
  });

  it("strips control characters from the alert subject", () => {
    const { subject } = buildJewelleryAlert({ ...pieceInput, email: "a@b.co", contactName: "Eve\r\nBcc: x@evil.example", pieceName: "Ring\nX" }, { saved: true });
    expect(subject).not.toMatch(/[\r\n]/);
  });

  it("limits the inbox to admins and neutralises formulas in the CSV export", async () => {
    await expect(adminJewelleryRouter.createCaller(adminContext("user") as never).list()).rejects.toThrow();
    email.sendTransactionalEmail.mockResolvedValue({ id: "x" });
    await jewelleryRouter.createCaller({} as never).submit({ ...pieceInput, message: "=HYPERLINK(\"http://evil\")" });
    const { content } = await adminJewelleryRouter.createCaller(adminContext("admin") as never).exportCsv();
    expect(content).toContain("\"'=HYPERLINK");
    expect(csvCell("+1")).toBe("\"'+1\"");
  });
});
