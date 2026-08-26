import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createAvailabilityImport,
  getAvailabilityAdminSummary,
  getPublicAvailabilitySummary,
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
  category: z.enum(["White", "Fancy Colour"]).optional(),
  shapes: z.array(z.string().min(1).max(40)).max(20).optional(),
  caratBands: z.array(z.string().min(1).max(40)).max(8).optional(),
  colours: z.array(z.string().min(1).max(80)).max(30).optional(),
  clarities: z.array(z.string().min(1).max(30)).max(12).optional(),
  page: z.number().int().min(0).max(1_000).optional(),
  pageSize: z.number().int().min(12).max(96).optional(),
});

export const publicAvailabilityRouter = router({
  profiles: publicProcedure.input(profileFilters.optional()).query(({ input }) => listPublicAvailabilityProfiles(input ?? {})),
  summary: publicProcedure.input(z.object({ category: z.enum(["White", "Fancy Colour"]).optional() }).optional()).query(({ input }) => getPublicAvailabilitySummary(input ?? {})),
});

export const adminAvailabilityRouter = router({
  validateImport: adminProcedure.input(csvInput).mutation(({ input }) => {
    const result = validateAvailabilityImportCsv(input.csv);
    return {
      filename: input.filename,
      valid: result.valid,
      rowCount: result.rowCount,
      rejectionReport: result.rejections,
      whiteRowCount: result.records.filter((record) => record.category === "White").length,
      fancyRowCount: result.records.filter((record) => record.category === "Fancy Colour").length,
      flaggedRows: [],
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
      whiteRowCount: result.records.filter((record) => record.category === "White").length,
      fancyRowCount: result.records.filter((record) => record.category === "Fancy Colour").length,
      flaggedRows: [],
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
