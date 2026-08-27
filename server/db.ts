import { and, asc, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  availabilityImports,
  availabilityStones,
  buyerAccounts,
  emailLogs,
  type InsertUser,
  lineSheets,
  privateListRequests,
  type ProductionBrief,
  productionBriefs,
  qualifierFollowUpSchedules,
  tradeIntroductions,
  users,
} from "../drizzle/schema";
import type { AvailabilityImportRecord } from "./availabilityImport";
import type { StatementAvailabilityImportRecord } from "./statementAvailabilityImport";
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
export const productionBriefMarketCodes = ["GLOBAL", "FR", "IT", "US", "CA"] as const;

export function summarizeProductionBriefMarkets(briefRows: Pick<ProductionBrief, "market" | "followUpStatus" | "alertStatus">[]) {
  return Object.fromEntries(productionBriefMarketCodes.map((market) => {
    const marketBriefs = briefRows.filter((brief) => brief.market === market);
    return [market, {
      total: marketBriefs.length,
      new: marketBriefs.filter((brief) => brief.followUpStatus === "new").length,
      active: marketBriefs.filter((brief) => ["new", "reviewing", "quoted", "on_hold"].includes(brief.followUpStatus)).length,
      failedAlerts: marketBriefs.filter((brief) => brief.alertStatus === "failed").length,
    }];
  })) as Record<(typeof productionBriefMarketCodes)[number], { total: number; new: number; active: number; failedAlerts: number }>;
}

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
  const activeImports = (await Promise.all([getActiveAvailabilityImport("core"), getActiveAvailabilityImport("statement")])).filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
  if (!activeImports.length) return [];
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
        inArray(availabilityStones.importId, activeImports.map((entry) => entry.id)),
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

export type SafeAvailabilityStone = Pick<typeof availabilityStones.$inferSelect, "id" | "stockNumber" | "category" | "shape" | "carat" | "caratBand" | "color" | "clarity" | "cut" | "polish" | "symmetry" | "fluorescence" | "measurements" | "depthPct" | "tablePct" | "ratio" | "crownHeight" | "pavilionDepth" | "crownAngle" | "pavilionAngle" | "girdlePct" | "statementType" | "lab" | "reportNumber" | "verifyUrl" | "videoUrl" | "imageUrl" | "importedAt">;

export function safeAvailabilityStone(stone: typeof availabilityStones.$inferSelect): SafeAvailabilityStone {
  const { originPartner: _originPartner, standardsFlags: _standardsFlags, importId: _importId, availability: _availability, location: _location, price: _price, bandTag: _bandTag, ...safeStone } = stone;
  return safeStone;
}

export type PublicAvailabilityProfile = Omit<SafeAvailabilityStone, "videoUrl"> & { videoUrl?: string | null };

export function publicAvailabilityProfile(stone: typeof availabilityStones.$inferSelect, includeVideo = false): PublicAvailabilityProfile {
  const { videoUrl: _videoUrl, ...profile } = safeAvailabilityStone(stone);
  return includeVideo ? { ...profile, videoUrl: stone.videoUrl } : profile;
}

export type AvailabilityCollection = "core" | "statement";

export async function getActiveAvailabilityImport(collection: AvailabilityCollection = "core") {
  const db = await requireDb();
  return (await db.select().from(availabilityImports).where(and(eq(availabilityImports.collection, collection), eq(availabilityImports.status, "active"))).orderBy(desc(availabilityImports.activatedAt)).limit(1))[0];
}

export type CatalogFilters = { collection?: AvailabilityCollection; category?: "White" | "Fancy Colour"; shapes?: string[]; caratBands?: string[]; colours?: string[]; clarities?: string[]; statementTypes?: string[]; labs?: string[]; page?: number; pageSize?: number };

export async function listPublicAvailabilityProfiles(input: CatalogFilters = {}) {
  const collection = input.collection ?? "core";
  const activeImport = await getActiveAvailabilityImport(collection);
  if (!activeImport) return { import: null, profiles: [] as PublicAvailabilityProfile[], total: 0, page: 0, pageSize: 48 };
  const db = await requireDb();
  const where = [
    eq(availabilityStones.importId, activeImport.id),
    eq(availabilityStones.availability, "Available"),
  ];
  if (input.category) where.push(eq(availabilityStones.category, input.category));
  if (input.shapes?.length) where.push(inArray(availabilityStones.shape, input.shapes));
  if (input.caratBands?.length) where.push(inArray(availabilityStones.caratBand, input.caratBands));
  if (input.colours?.length) where.push(inArray(availabilityStones.color, input.colours));
  if (input.clarities?.length) where.push(inArray(availabilityStones.clarity, input.clarities));
  if (input.statementTypes?.length) where.push(inArray(availabilityStones.statementType, input.statementTypes));
  if (input.labs?.length) where.push(inArray(availabilityStones.lab, input.labs));
  const pageSize = Math.min(Math.max(input.pageSize ?? 48, 12), 96);
  const page = Math.max(input.page ?? 0, 0);
  const [rows, totalRow] = await Promise.all([
    db.select().from(availabilityStones).where(and(...where)).orderBy(asc(availabilityStones.carat), asc(availabilityStones.shape), asc(availabilityStones.stockNumber)).limit(pageSize).offset(page * pageSize),
    db.select({ total: sql<number>`count(*)` }).from(availabilityStones).where(and(...where)),
  ]);
  return { import: activeImport, profiles: rows.map((row) => publicAvailabilityProfile(row, collection === "statement")), total: Number(totalRow[0]?.total ?? 0), page, pageSize };
}

export async function getPublicAvailabilitySummary(input: { collection?: AvailabilityCollection; category?: "White" | "Fancy Colour" } = {}) {
  const activeImport = await getActiveAvailabilityImport(input.collection ?? "core");
  if (!activeImport) return { import: null, total: 0, byCategory: [] as { category: string; count: number }[], byShape: [] as { shape: string; count: number }[], byColour: [] as { colour: string; count: number }[], byCaratBand: [] as { caratBand: string; count: number }[], byClarity: [] as { clarity: string; count: number }[], byStatementType: [] as { statementType: string; count: number }[], byLab: [] as { lab: string; count: number }[] };
  const db = await requireDb();
  const where = [eq(availabilityStones.importId, activeImport.id), eq(availabilityStones.availability, "Available")];
  if (input.category) where.push(eq(availabilityStones.category, input.category));
  const rows = await db.select({ category: availabilityStones.category, shape: availabilityStones.shape, colour: availabilityStones.color, caratBand: availabilityStones.caratBand, clarity: availabilityStones.clarity, statementType: availabilityStones.statementType, lab: availabilityStones.lab }).from(availabilityStones).where(and(...where));
  const summarize = <K extends string>(values: (K | null)[]) => Array.from(new Set(values.filter((value): value is K => Boolean(value)))).map((value) => ({ [typeof value === "string" ? "value" : "value"]: value, count: values.filter((entry) => entry === value).length }));
  return {
    import: activeImport,
    total: rows.length,
    byCategory: summarize(rows.map((row) => row.category)).map((entry) => ({ category: entry.value, count: entry.count })),
    byShape: summarize(rows.map((row) => row.shape)).map((entry) => ({ shape: entry.value, count: entry.count })),
    byColour: summarize(rows.map((row) => row.colour)).map((entry) => ({ colour: entry.value, count: entry.count })),
    byCaratBand: summarize(rows.map((row) => row.caratBand)).map((entry) => ({ caratBand: entry.value, count: entry.count })),
    byClarity: summarize(rows.map((row) => row.clarity)).map((entry) => ({ clarity: entry.value, count: entry.count })),
    byStatementType: summarize(rows.map((row) => row.statementType)).map((entry) => ({ statementType: entry.value, count: entry.count })),
    byLab: summarize(rows.map((row) => row.lab)).map((entry) => ({ lab: entry.value, count: entry.count })),
  };
}

export async function createAvailabilityImport(input: { sourceFilename: string; importedByUserId: number; records: AvailabilityImportRecord[] }) {
  const db = await requireDb();
  const whiteRowCount = input.records.filter((record) => record.category === "White").length;
  const fancyRowCount = input.records.length - whiteRowCount;
  return db.transaction(async (tx) => {
    await tx.update(availabilityImports).set({ status: "archived", archivedAt: new Date() }).where(and(eq(availabilityImports.collection, "core"), eq(availabilityImports.status, "active")));
    const result = await tx.insert(availabilityImports).values({
      sourceFilename: input.sourceFilename,
      rowCount: input.records.length,
      standardRowCount: input.records.length,
      flaggedRowCount: 0,
      whiteRowCount,
      fancyRowCount,
      collection: "core",
      status: "active",
      importedByUserId: input.importedByUserId,
    });
    const importId = Number(result[0].insertId);
    await tx.insert(availabilityStones).values(input.records.map((record) => ({
      importId,
      stockNumber: record.stockNo,
      availability: "Available",
      category: record.category,
      shape: record.shape,
      carat: record.carat,
      color: record.colour,
      caratBand: record.caratBand,
      clarity: record.clarity,
      cut: record.cut,
      polish: record.polish,
      symmetry: record.symmetry,
      depthPct: record.depthPct,
      tablePct: record.tablePct,
      ratio: record.ratio,
      lab: record.lab,
      reportNumber: record.certNo,
      verifyUrl: record.verifyUrl,
      price: null,
      location: null,
      fluorescence: null,
      measurements: record.measurements,
      videoUrl: record.videoUrl,
      bandTag: record.caratBand,
      originPartner: null,
      standardsFlags: [],
      isStandardMenu: true,
      importedAt: new Date(),
    })));
    return (await tx.select().from(availabilityImports).where(eq(availabilityImports.id, importId)).limit(1))[0];
  });
}

export async function createStatementAvailabilityImport(input: { sourceFilename: string; importedByUserId: number; records: StatementAvailabilityImportRecord[] }) {
  const db = await requireDb();
  const whiteRowCount = input.records.filter((record) => record.category === "White").length;
  const fancyRowCount = input.records.length - whiteRowCount;
  return db.transaction(async (tx) => {
    await tx.update(availabilityImports).set({ status: "archived", archivedAt: new Date() }).where(and(eq(availabilityImports.collection, "statement"), eq(availabilityImports.status, "active")));
    const result = await tx.insert(availabilityImports).values({ sourceFilename: input.sourceFilename, rowCount: input.records.length, standardRowCount: input.records.length, flaggedRowCount: 0, whiteRowCount, fancyRowCount, collection: "statement", status: "active", importedByUserId: input.importedByUserId });
    const importId = Number(result[0].insertId);
    await tx.insert(availabilityStones).values(input.records.map((record) => ({
      importId, stockNumber: record.stockNo, availability: "Available", category: record.category, shape: record.shape, carat: record.carat, color: record.colour, caratBand: record.caratBand, clarity: record.clarity, cut: record.cut, polish: record.polish, symmetry: record.symmetry, fluorescence: record.fluorescence, measurements: record.measurements, ratio: record.ratio, depthPct: record.depthPct, tablePct: record.tablePct, crownHeight: record.crownHeight, pavilionDepth: record.pavilionDepth, crownAngle: record.crownAngle, pavilionAngle: record.pavilionAngle, girdlePct: record.girdlePct, statementType: record.statementType, lab: record.lab, reportNumber: record.certNo, verifyUrl: record.certPdfUrl, videoUrl: record.videoUrl, imageUrl: record.imageUrl, price: null, location: null, bandTag: record.caratBand, originPartner: null, standardsFlags: [], isStandardMenu: true, importedAt: new Date(),
    })));
    return (await tx.select().from(availabilityImports).where(eq(availabilityImports.id, importId)).limit(1))[0];
  });
}

export async function listAvailabilityImports() {
  const db = await requireDb();
  return db.select().from(availabilityImports).orderBy(desc(availabilityImports.activatedAt));
}

export async function restoreAvailabilityImport(importId: number) {
  const db = await requireDb();
  return db.transaction(async (tx) => {
    const target = (await tx.select().from(availabilityImports).where(eq(availabilityImports.id, importId)).limit(1))[0];
    if (!target) return undefined;
    await tx.update(availabilityImports).set({ status: "archived", archivedAt: new Date() }).where(and(eq(availabilityImports.collection, target.collection), eq(availabilityImports.status, "active")));
    await tx.update(availabilityImports).set({ status: "active", activatedAt: new Date(), archivedAt: null }).where(eq(availabilityImports.id, importId));
    return (await tx.select().from(availabilityImports).where(eq(availabilityImports.id, importId)).limit(1))[0];
  });
}

export async function getAvailabilityAdminSummary(collection: AvailabilityCollection = "core") {
  const activeImport = await getActiveAvailabilityImport(collection);
  if (!activeImport) return { activeImport: null, totals: { live: 0, standard: 0, flagged: 0 }, byShape: [] as { shape: string; count: number }[], byCaratBand: [] as { band: string; count: number }[], flaggedRows: [] as (typeof availabilityStones.$inferSelect)[] };
  const db = await requireDb();
  const rows = await db.select().from(availabilityStones).where(eq(availabilityStones.importId, activeImport.id)).orderBy(asc(availabilityStones.shape), asc(availabilityStones.carat));
  const byShape = Array.from(new Set(rows.map((row) => row.shape))).map((shape) => ({ shape, count: rows.filter((row) => row.shape === shape).length }));
  const bands = [
    { band: "Under 1.00 ct", test: (carat: number) => carat < 1 },
    { band: "1.00–1.49 ct", test: (carat: number) => carat >= 1 && carat < 1.5 },
    { band: "1.50–1.99 ct", test: (carat: number) => carat >= 1.5 && carat < 2 },
    { band: "2.00–2.99 ct", test: (carat: number) => carat >= 2 && carat < 3 },
    { band: "3.00–4.19 ct", test: (carat: number) => carat >= 3 && carat <= 4.19 },
    { band: "4.20 ct and above", test: (carat: number) => carat > 4.19 },
  ];
  return {
    activeImport,
    totals: { live: rows.length, standard: rows.filter((row) => row.isStandardMenu).length, flagged: rows.filter((row) => !row.isStandardMenu).length },
    byShape,
    byCaratBand: bands.map(({ band, test }) => ({ band, count: rows.filter((row) => test(row.carat)).length })),
    flaggedRows: rows.filter((row) => !row.isStandardMenu),
  };
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
  productionBriefId?: number;
  emailType: "approved_buyer_welcome" | "private_list_request_alert" | "public_brief_acknowledgement" | "public_brief_qualifier_follow_up";
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
  requestIntent: "request" | "hold";
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
  market: "GLOBAL" | "FR" | "IT" | "US" | "CA";
  contactName: string;
  email: string;
  company?: string;
  yearsTrading: string;
  tradeReferencesAvailable: string;
  preferredPaymentApproach: string;
  referrerName?: string;
  brief: string;
};

export async function createProductionBrief(input: ProductionBriefInput) {
  const db = await requireDb();
  const result = await db.insert(productionBriefs).values({
    ...input,
    contactName: input.contactName.trim(),
    email: input.email.trim().toLowerCase(),
    company: input.company?.trim() || null,
    source: input.referrerName?.trim() ? "referral" : "direct",
    referrerName: input.referrerName?.trim() || null,
    brief: input.brief.trim(),
  });
  return (await db.select().from(productionBriefs).where(eq(productionBriefs.id, Number(result[0].insertId))).limit(1))[0];
}

export async function getProductionBriefById(id: number) {
  const db = await requireDb();
  return (await db.select().from(productionBriefs).where(eq(productionBriefs.id, id)).limit(1))[0];
}

export async function markProductionBriefAlert(id: number, status: "sent" | "failed", details: { alertMessageId?: string; alertError?: string }) {
  const db = await requireDb();
  await db.update(productionBriefs).set({ alertStatus: status, alertMessageId: details.alertMessageId ?? null, alertError: details.alertError ?? null }).where(eq(productionBriefs.id, id));
}

export async function markProductionBriefAcknowledgement(id: number, status: "sent" | "failed", details: { messageId?: string; error?: string }) {
  const db = await requireDb();
  await db.update(productionBriefs).set({ acknowledgementStatus: status, acknowledgementMessageId: details.messageId ?? null, acknowledgementError: details.error ?? null }).where(eq(productionBriefs.id, id));
}

export async function markProductionBriefQualifierFollowUp(id: number, status: "sent" | "paused" | "failed", details: { messageId?: string; error?: string } = {}) {
  const db = await requireDb();
  await db.update(productionBriefs).set({
    qualifierFollowUpStatus: status,
    qualifierFollowUpMessageId: details.messageId ?? null,
    qualifierFollowUpError: details.error ?? null,
    qualifierFollowUpSentAt: status === "sent" ? new Date() : null,
  }).where(eq(productionBriefs.id, id));
}

export async function claimProductionBriefQualifierFollowUp(id: number) {
  const db = await requireDb();
  const result = await db.update(productionBriefs).set({ qualifierFollowUpStatus: "processing", qualifierFollowUpError: null }).where(and(
    eq(productionBriefs.id, id),
    eq(productionBriefs.qualifierFollowUpStatus, "pending"),
  ));
  return Number(result[0].affectedRows) === 1;
}

export async function listProductionBriefs() {
  const db = await requireDb();
  return db.select().from(productionBriefs).orderBy(desc(productionBriefs.createdAt));
}

export async function updateProductionBriefFollowUp(input: {
  id: number;
  followUpStatus: "new" | "reviewing" | "shortlist_sent" | "quoted" | "on_hold" | "closed";
  ownerName?: string;
  internalNote?: string;
}) {
  const db = await requireDb();
  await db.update(productionBriefs).set({
    followUpStatus: input.followUpStatus,
    ownerName: input.ownerName?.trim() || null,
    internalNote: input.internalNote?.trim() || null,
    lastActionAt: new Date(),
    ...(input.followUpStatus === "shortlist_sent" ? { qualifierFollowUpStatus: "paused" as const, qualifierFollowUpError: null } : {}),
  }).where(eq(productionBriefs.id, input.id));
  return (await db.select().from(productionBriefs).where(eq(productionBriefs.id, input.id)).limit(1))[0];
}

export async function getDueQualifierFollowUps(dueBefore: Date) {
  const db = await requireDb();
  return db.select().from(productionBriefs).where(and(
    eq(productionBriefs.qualifierFollowUpStatus, "pending"),
    lte(productionBriefs.createdAt, dueBefore),
  ));
}

export async function getQualifierFollowUpScheduleByTaskUid(taskUid: string) {
  const db = await requireDb();
  return (await db.select().from(qualifierFollowUpSchedules).where(eq(qualifierFollowUpSchedules.scheduleCronTaskUid, taskUid)).limit(1))[0];
}

export async function getQualifierFollowUpSchedule() {
  const db = await requireDb();
  return (await db.select().from(qualifierFollowUpSchedules).orderBy(asc(qualifierFollowUpSchedules.id)).limit(1))[0];
}

export async function saveQualifierFollowUpSchedule(input: { taskUid: string; isEnabled: boolean }) {
  const db = await requireDb();
  const existing = await getQualifierFollowUpSchedule();
  if (existing) {
    await db.update(qualifierFollowUpSchedules).set({ scheduleCronTaskUid: input.taskUid, isEnabled: input.isEnabled, lastRunError: null }).where(eq(qualifierFollowUpSchedules.id, existing.id));
    return getQualifierFollowUpSchedule();
  }
  await db.insert(qualifierFollowUpSchedules).values({ scheduleCronTaskUid: input.taskUid, isEnabled: input.isEnabled });
  return getQualifierFollowUpSchedule();
}

export async function recordQualifierFollowUpRun(scheduleId: number, details: { error?: string }) {
  const db = await requireDb();
  await db.update(qualifierFollowUpSchedules).set({ lastRunAt: new Date(), lastRunError: details.error ?? null }).where(eq(qualifierFollowUpSchedules.id, scheduleId));
}

export async function createTradeIntroduction(input: {
  introducerBuyerAccountId: number;
  introducedByUserId: number;
  jewellerName: string;
  company?: string;
  workEmail?: string;
  market: "GLOBAL" | "FR" | "IT" | "US" | "CA";
  note?: string;
}) {
  const db = await requireDb();
  const result = await db.insert(tradeIntroductions).values({
    ...input,
    jewellerName: input.jewellerName.trim(),
    company: input.company?.trim() || null,
    workEmail: input.workEmail?.trim().toLowerCase() || null,
    note: input.note?.trim() || null,
  });
  return (await db.select().from(tradeIntroductions).where(eq(tradeIntroductions.id, Number(result[0].insertId))).limit(1))[0];
}

export async function markTradeIntroductionAlert(id: number, status: "sent" | "failed", details: { messageId?: string; error?: string }) {
  const db = await requireDb();
  await db.update(tradeIntroductions).set({ alertStatus: status, alertMessageId: details.messageId ?? null, alertError: details.error ?? null }).where(eq(tradeIntroductions.id, id));
}

export async function listTradeIntroductions() {
  const db = await requireDb();
  return db.select().from(tradeIntroductions).orderBy(desc(tradeIntroductions.createdAt));
}

export async function getOperationsOverview() {
  const db = await requireDb();
  const [briefRows, privateRequestRows, inventoryRows, buyerRows] = await Promise.all([
    db.select().from(productionBriefs),
    db.select().from(privateListRequests),
    db.select().from(availabilityStones),
    db.select().from(buyerAccounts),
  ]);

  const newBriefs = briefRows.filter((brief) => brief.followUpStatus === "new");
  const activeBriefs = briefRows.filter((brief) => ["new", "reviewing", "quoted", "on_hold"].includes(brief.followUpStatus));
  const incompleteInventory = inventoryRows.filter((stone) => !stone.reportNumber || !stone.verifyUrl);
  const marketBreakdown = summarizeProductionBriefMarkets(briefRows);

  return {
    productionBriefs: {
      total: briefRows.length,
      new: newBriefs.length,
      active: activeBriefs.length,
      failedAlerts: briefRows.filter((brief) => brief.alertStatus === "failed").length,
      marketBreakdown,
      recent: briefRows.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5),
    },
    privateRequests: {
      total: privateRequestRows.length,
      failedAlerts: privateRequestRows.filter((request) => request.emailStatus === "failed").length,
    },
    inventory: {
      total: inventoryRows.length,
      incomplete: incompleteInventory.length,
      isReady: inventoryRows.length > 0 && incompleteInventory.length === 0,
    },
    buyerRollout: {
      activationEnabled: ENV.alvoraEarlyAccessEnabled,
      accountsCreated: buyerRows.length,
      accountsApproved: buyerRows.filter((account) => account.status === "approved").length,
    },
  };
}
