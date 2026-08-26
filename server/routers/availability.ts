import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createAvailabilityImport,
  getAvailabilityAdminSummary,
  listAvailabilityImports,
  listPublicAvailabilityProfiles,
  restoreAvailabilityImport,
} from "../db";
import { validateAvailabilityImportCsv } from "../availabilityImport";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";

const csvInput = z.object({
  filename: z.string().min(1).max(255),
  csv: z.string().min(1).max(1_500_000),
});

const profileFilters = z.object({
  shapes: z.array(z.string().min(1).max(40)).max(4).optional(),
  caratMin: z.number().positive().max(25).optional(),
  caratMax: z.number().positive().max(25).optional(),
}).refine((value) => value.caratMin === undefined || value.caratMax === undefined || value.caratMax >= value.caratMin, { message: "Maximum carat must be at least the minimum" });

export const publicAvailabilityRouter = router({
  profiles: publicProcedure.input(profileFilters.optional()).query(({ input }) => listPublicAvailabilityProfiles(input ?? {})),
});

export const adminAvailabilityRouter = router({
  validateImport: adminProcedure.input(csvInput).mutation(({ input }) => {
    const result = validateAvailabilityImportCsv(input.csv);
    return {
      filename: input.filename,
      valid: result.valid,
      rowCount: result.rowCount,
      rejectionReport: result.rejections,
      standardRowCount: result.records.filter((record) => record.standardsFlags.length === 0).length,
      flaggedRows: result.records.filter((record) => record.standardsFlags.length > 0).map((record) => ({ sku: record.sku, flags: record.standardsFlags })),
    };
  }),
  replaceImport: adminProcedure.input(csvInput).mutation(async ({ ctx, input }) => {
    const result = validateAvailabilityImportCsv(input.csv);
    if (!result.valid) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Availability import was not applied because the validation report contains rejected rows.",
        cause: { rejectionReport: result.rejections },
      });
    }
    const imported = await createAvailabilityImport({ sourceFilename: input.filename, importedByUserId: ctx.user.id, records: result.records });
    return {
      import: imported,
      rowCount: result.rowCount,
      standardRowCount: result.records.filter((record) => record.standardsFlags.length === 0).length,
      flaggedRows: result.records.filter((record) => record.standardsFlags.length > 0).map((record) => ({ sku: record.sku, flags: record.standardsFlags })),
    };
  }),
  summary: adminProcedure.query(() => getAvailabilityAdminSummary()),
  versions: adminProcedure.query(() => listAvailabilityImports()),
  restoreVersion: adminProcedure.input(z.object({ importId: z.number().int().positive() })).mutation(async ({ input }) => {
    const restored = await restoreAvailabilityImport(input.importId);
    if (!restored) throw new TRPCError({ code: "NOT_FOUND", message: "Availability version was not found" });
    return restored;
  }),
});
