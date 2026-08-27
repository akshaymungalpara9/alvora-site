import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createAvailabilityImport,
  createStatementAvailabilityImport,
  getAvailabilityAdminSummary,
  getPublicAvailabilityRowsByIds,
  getPublicAvailabilitySummary,
  listAvailabilityImports,
  listPublicAvailabilityProfiles,
  restoreAvailabilityImport,
} from "../db";
import { validateAvailabilityImportCsv } from "../availabilityImport";
import { validateStatementAvailabilityImportCsv } from "../statementAvailabilityImport";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import { buildLineSheetPdf } from "../lineSheets";
import { storagePut } from "../storage";

const csvInput = z.object({
  filename: z.string().min(1).max(255),
  csv: z.string().min(1).max(1_500_000),
  collection: z.enum(["core", "statement"]).default("core"),
});

const profileFilters = z.object({
  collection: z.enum(["core", "statement"]).optional(),
  category: z.enum(["White", "Fancy Colour"]).optional(),
  shapes: z.array(z.string().min(1).max(40)).max(20).optional(),
  caratBands: z.array(z.string().min(1).max(40)).max(8).optional(),
  colours: z.array(z.string().min(1).max(80)).max(30).optional(),
  clarities: z.array(z.string().min(1).max(30)).max(12).optional(),
  statementTypes: z.array(z.string().min(1).max(40)).max(12).optional(),
  labs: z.array(z.string().min(1).max(30)).max(8).optional(),
  page: z.number().int().min(0).max(1_000).optional(),
  pageSize: z.number().int().min(12).max(96).optional(),
});

const publicCurrentViewInput = z.object({
  collection: z.enum(["core", "statement"]),
  stoneIds: z.array(z.number().int().positive()).min(1).max(48),
});

export const publicAvailabilityRouter = router({
  profiles: publicProcedure.input(profileFilters.optional()).query(({ input }) => listPublicAvailabilityProfiles(input ?? {})),
  summary: publicProcedure.input(z.object({ collection: z.enum(["core", "statement"]).optional(), category: z.enum(["White", "Fancy Colour"]).optional() }).optional()).query(({ input }) => getPublicAvailabilitySummary(input ?? {})),
  downloadCurrentView: publicProcedure.input(publicCurrentViewInput).mutation(async ({ input }) => {
    const stones = await getPublicAvailabilityRowsByIds(input);
    if (stones.length !== input.stoneIds.length) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "The requested current view contains a stone that is no longer publicly available." });
    }
    const validUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const pdf = await buildLineSheetPdf({ title: "Current production view", stones, validUntil });
    const stored = await storagePut(`public-current-views/${input.collection}/alvora-current-production-${Date.now()}.pdf`, pdf, "application/pdf");
    return { storageUrl: stored.url, stoneCount: stones.length, validUntil };
  }),
});

export const adminAvailabilityRouter = router({
  validateImport: adminProcedure.input(csvInput).mutation(({ input }) => {
    const result = input.collection === "statement" ? validateStatementAvailabilityImportCsv(input.csv) : validateAvailabilityImportCsv(input.csv);
    return {
      filename: input.filename,
      collection: input.collection,
      valid: result.valid,
      rowCount: result.rowCount,
      rejectionReport: result.rejections,
      whiteRowCount: result.records.filter((record) => record.category === "White").length,
      fancyRowCount: result.records.filter((record) => record.category === "Fancy Colour").length,
      flaggedRows: [],
    };
  }),
  replaceImport: adminProcedure.input(csvInput).mutation(async ({ ctx, input }) => {
    if (input.collection === "statement") {
      const result = validateStatementAvailabilityImportCsv(input.csv);
      if (!result.valid) throw new TRPCError({ code: "BAD_REQUEST", message: "Availability import was not applied because the validation report contains rejected rows.", cause: { rejectionReport: result.rejections } });
      const imported = await createStatementAvailabilityImport({ sourceFilename: input.filename, importedByUserId: ctx.user.id, records: result.records });
      return { import: imported, collection: input.collection, rowCount: result.rowCount, whiteRowCount: result.records.filter((record) => record.category === "White").length, fancyRowCount: result.records.filter((record) => record.category === "Fancy Colour").length, flaggedRows: [] };
    }
    const result = validateAvailabilityImportCsv(input.csv);
    if (!result.valid) throw new TRPCError({ code: "BAD_REQUEST", message: "Availability import was not applied because the validation report contains rejected rows.", cause: { rejectionReport: result.rejections } });
    const imported = await createAvailabilityImport({ sourceFilename: input.filename, importedByUserId: ctx.user.id, records: result.records });
    return {
      import: imported,
      collection: input.collection,
      rowCount: result.rowCount,
      whiteRowCount: result.records.filter((record) => record.category === "White").length,
      fancyRowCount: result.records.filter((record) => record.category === "Fancy Colour").length,
      flaggedRows: [],
    };
  }),
  summary: adminProcedure.input(z.object({ collection: z.enum(["core", "statement"]).default("core") }).optional()).query(({ input }) => getAvailabilityAdminSummary(input?.collection ?? "core")),
  versions: adminProcedure.query(() => listAvailabilityImports()),
  restoreVersion: adminProcedure.input(z.object({ importId: z.number().int().positive() })).mutation(async ({ input }) => {
    const restored = await restoreAvailabilityImport(input.importId);
    if (!restored) throw new TRPCError({ code: "NOT_FOUND", message: "Availability version was not found" });
    return restored;
  }),
});
