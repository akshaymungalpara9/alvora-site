import { and, asc, desc, eq, gte, inArray, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  availabilityStones,
  buyerAccounts,
  emailLogs,
  type InsertUser,
  lineSheets,
  privateListRequests,
  productionBriefs,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export type BuyerBandInput = {
  accountName: string;
  contactName: string;
  email: string;
  shapes: string[];
  caratMin: number;
  caratMax: number;
  colors: string[];
  clarities: string[];
};

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    _db = drizzle(process.env.DATABASE_URL);
  }
  return _db;
}

async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Database connection is unavailable");
  return db;
}

const compactBand = (items: string[]) => items.map((item) => item.trim().toUpperCase()).filter(Boolean).join(",");
export const expandBand = (value: string) => value.split(",").map((item) => item.trim()).filter(Boolean);

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await requireDb();
  const values: InsertUser = { openId: user.openId, lastSignedIn: user.lastSignedIn ?? new Date() };
  const updateSet: Record<string, unknown> = { lastSignedIn: values.lastSignedIn };

  for (const field of ["name", "email", "loginMethod"] as const) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }

  values.role = user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : "user");
  updateSet.role = values.role;
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await requireDb();
  return (await db.select().from(users).where(eq(users.openId, openId)).limit(1))[0];
}

export async function listBuyerAccounts() {
  const db = await requireDb();
  return db.select().from(buyerAccounts).orderBy(desc(buyerAccounts.updatedAt));
}

export async function getBuyerAccountById(id: number) {
  const db = await requireDb();
  return (await db.select().from(buyerAccounts).where(eq(buyerAccounts.id, id)).limit(1))[0];
}

export async function createBuyerAccount(input: BuyerBandInput) {
  const db = await requireDb();
  const values = {
    ...input,
    email: input.email.trim().toLowerCase(),
    shapes: compactBand(input.shapes),
    colors: compactBand(input.colors),
    clarities: compactBand(input.clarities),
  };
  const result = await db.insert(buyerAccounts).values(values);
  return getBuyerAccountById(Number(result[0].insertId));
}

export async function approveBuyerAccount(id: number) {
  const db = await requireDb();
  await db.update(buyerAccounts).set({ status: "approved", approvedAt: new Date() }).where(eq(buyerAccounts.id, id));
  return getBuyerAccountById(id);
}

export async function resolveBuyerAccountForUser(user: { id: number; email: string | null }) {
  if (!user.email) return undefined;
  const db = await requireDb();
  const account = (await db.select().from(buyerAccounts).where(eq(buyerAccounts.email, user.email.toLowerCase())).limit(1))[0];
  if (account && account.userId !== user.id) {
    await db.update(buyerAccounts).set({ userId: user.id }).where(eq(buyerAccounts.id, account.id));
    return { ...account, userId: user.id };
  }
  return account;
}

export async function getStonesForBuyer(account: NonNullable<Awaited<ReturnType<typeof getBuyerAccountById>>>) {
  const db = await requireDb();
  const shapes = expandBand(account.shapes);
  const colors = expandBand(account.colors);
  const clarities = expandBand(account.clarities);
  if (!shapes.length || !colors.length || !clarities.length) return [];
  return db
    .select()
    .from(availabilityStones)
    .where(
      and(
        eq(availabilityStones.availability, "Available"),
        inArray(availabilityStones.shape, shapes),
        gte(availabilityStones.carat, account.caratMin),
        lte(availabilityStones.carat, account.caratMax),
        inArray(availabilityStones.color, colors),
        inArray(availabilityStones.clarity, clarities),
      ),
    )
    .orderBy(asc(availabilityStones.shape), asc(availabilityStones.carat), asc(availabilityStones.color));
}

export async function getBuyerStone(account: NonNullable<Awaited<ReturnType<typeof getBuyerAccountById>>>, stoneId: number) {
  const stones = await getStonesForBuyer(account);
  return stones.find((stone) => stone.id === stoneId);
}

export async function createLineSheetRecord(input: {
  buyerAccountId: number;
  storageKey: string;
  storageUrl: string;
  validUntil: Date;
  createdByUserId: number;
}) {
  const db = await requireDb();
  const result = await db.insert(lineSheets).values(input);
  return (await db.select().from(lineSheets).where(eq(lineSheets.id, Number(result[0].insertId))).limit(1))[0];
}

export async function getLatestLineSheet(buyerAccountId: number) {
  const db = await requireDb();
  return (await db.select().from(lineSheets).where(eq(lineSheets.buyerAccountId, buyerAccountId)).orderBy(desc(lineSheets.createdAt)).limit(1))[0];
}

export async function createEmailLog(input: {
  buyerAccountId?: number;
  requestId?: number;
  emailType: "approved_buyer_welcome" | "private_list_request_alert";
  recipient: string;
  subject: string;
  metadata?: Record<string, unknown>;
}) {
  const db = await requireDb();
  const result = await db.insert(emailLogs).values({ ...input, status: "queued" });
  return Number(result[0].insertId);
}

export async function markEmailLog(id: number, status: "sent" | "failed", details: { providerMessageId?: string; errorMessage?: string }) {
  const db = await requireDb();
  await db.update(emailLogs).set({ status, sentAt: status === "sent" ? new Date() : null, ...details }).where(eq(emailLogs.id, id));
}

export async function listEmailLogsForBuyer(buyerAccountId: number) {
  const db = await requireDb();
  return db.select().from(emailLogs).where(eq(emailLogs.buyerAccountId, buyerAccountId)).orderBy(desc(emailLogs.createdAt));
}

export async function createPrivateListRequest(input: {
  buyerAccountId: number;
  availabilityStoneId: number;
  requestedByUserId: number;
  certificateNumber: string;
  buyerAccountName: string;
  buyerEmail: string;
  note?: string;
}) {
  const db = await requireDb();
  const result = await db.insert(privateListRequests).values(input);
  return Number(result[0].insertId);
}

export async function markPrivateRequestEmail(id: number, status: "sent" | "failed", errorMessage?: string) {
  const db = await requireDb();
  await db.update(privateListRequests).set({ emailStatus: status, emailError: errorMessage ?? null }).where(eq(privateListRequests.id, id));
}

export async function listPrivateRequests() {
  const db = await requireDb();
  return db.select().from(privateListRequests).orderBy(desc(privateListRequests.createdAt));
}

export type ProductionBriefInput = {
  requestType: string;
  contactName: string;
  email: string;
  company?: string;
  yearsTrading: string;
  tradeReferencesAvailable: string;
  preferredPaymentApproach: string;
  brief: string;
};

export async function createProductionBrief(input: ProductionBriefInput) {
  const db = await requireDb();
  const result = await db.insert(productionBriefs).values({
    ...input,
    contactName: input.contactName.trim(),
    email: input.email.trim().toLowerCase(),
    company: input.company?.trim() || null,
    brief: input.brief.trim(),
  });
  return (await db.select().from(productionBriefs).where(eq(productionBriefs.id, Number(result[0].insertId))).limit(1))[0];
}

export async function markProductionBriefAlert(id: number, status: "sent" | "failed", details: { alertMessageId?: string; alertError?: string }) {
  const db = await requireDb();
  await db.update(productionBriefs).set({ alertStatus: status, alertMessageId: details.alertMessageId ?? null, alertError: details.alertError ?? null }).where(eq(productionBriefs.id, id));
}

export async function listProductionBriefs() {
  const db = await requireDb();
  return db.select().from(productionBriefs).orderBy(desc(productionBriefs.createdAt));
}
