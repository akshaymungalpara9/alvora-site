import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { findPieceByCode, isShown } from "../../shared/jewellery/catalog";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import {
  createJewelleryEnquiry,
  deliverSavedJewelleryAlert,
  exportJewelleryEnquiriesCsv,
  getJewelleryEnquiryById,
  listJewelleryEnquiries,
  loadJewellerySourcing,
  sendJewelleryAcknowledgement,
  sendJewelleryAlert,
  updateJewelleryEnquiryFollowUp,
  type JewelleryEnquiryInput,
} from "../jewelleryEnquiries";

/** Collapse runs of whitespace; empty optional text becomes undefined. */
const optionalText = (max: number) =>
  z.string().max(max * 2).optional().transform((value) => {
    const cleaned = value?.replace(/[ \t]+/g, " ").trim();
    return cleaned ? cleaned.slice(0, max) : undefined;
  });

export const jewelleryEnquiryInput = z.object({
  kind: z.enum(["piece", "consultation"]),
  website: z.string().max(200).optional().default(""),
  pieceCode: z.string().trim().regex(/^ALV-[A-Z]-\d{4}$/).optional(),
  metal: z.enum(["Yellow gold", "White gold", "Rose gold", "Silver", "Platinum"]).optional(),
  karat: z.enum(["10K", "14K", "18K"]).optional(),
  caratWeight: optionalText(20),
  ringSize: optionalText(20),
  contactName: z.string().trim().min(2).max(180),
  email: z.string().trim().email().max(320).transform((value) => value.toLowerCase()),
  phone: optionalText(80),
  country: optionalText(80),
  displayedCurrency: z.string().length(3).optional().transform((code) => ["INR", "USD", "GBP", "EUR", "CAD", "AUD"].includes(code ?? "") ? code : undefined),
  preferredContact: z.enum(["email", "whatsapp", "phone"]).default("email"),
  preferredTime: optionalText(160),
  budget: optionalText(60),
  message: z.string().max(6000).optional().transform((value) => value?.trim().slice(0, 3000) || undefined),
  // Attribution: the first page of the visit and the external referrer host.
  landingPage: optionalText(300).transform((value) => (value && value.startsWith("/") ? value : undefined)),
  referrer: optionalText(200),
});

export const jewelleryRouter = router({
  submit: publicProcedure.input(jewelleryEnquiryInput).mutation(async ({ input }) => {
    const { website, ...rest } = input;
    // Honeypot: real visitors never see or fill this field.
    if (website.trim()) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid public submission" });

    const found = rest.pieceCode ? findPieceByCode(rest.pieceCode) : undefined;
    const piece = found && isShown(found) ? found : undefined;
    if (rest.kind === "piece" && !piece) throw new TRPCError({ code: "BAD_REQUEST", message: "Unknown piece" });
    const enquiry: JewelleryEnquiryInput = { ...rest, pieceCode: piece?.code, pieceName: piece?.name };

    let saved: Awaited<ReturnType<typeof createJewelleryEnquiry>> | undefined;
    try {
      saved = await createJewelleryEnquiry(enquiry);
    } catch (error) {
      console.error("[jewellery] enquiry could not be saved; sending alert only", error instanceof Error ? error.message : error);
    }

    if (saved) {
      const [alertStatus] = await Promise.all([deliverSavedJewelleryAlert(saved), sendJewelleryAcknowledgement(enquiry)]);
      return { enquiryId: saved.id, saved: true, alertStatus };
    }

    // Database unavailable: the email alert is the only record, so it must succeed.
    try {
      await sendJewelleryAlert(enquiry, { saved: false });
    } catch {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Your enquiry could not be sent. Please message us on WhatsApp." });
    }
    await sendJewelleryAcknowledgement(enquiry);
    return { enquiryId: null, saved: false, alertStatus: "sent" as const };
  }),
});

const followUpStatus = z.enum(["new", "contacted", "quoted", "won", "lost", "on_hold"]);

export const adminJewelleryRouter = router({
  list: adminProcedure.query(async () => {
    const rows = await listJewelleryEnquiries();
    const sourcing = loadJewellerySourcing();
    return rows.map((row) => ({ ...row, maker: row.pieceCode ? sourcing[row.pieceCode] ?? null : null }));
  }),
  updateFollowUp: adminProcedure
    .input(z.object({ id: z.number().int().positive(), followUpStatus, ownerName: z.string().max(120).optional(), internalNote: z.string().max(3000).optional() }))
    .mutation(async ({ input }) => {
      const updated = await updateJewelleryEnquiryFollowUp(input);
      if (!updated) throw new TRPCError({ code: "NOT_FOUND", message: "Enquiry was not found" });
      return updated;
    }),
  retryAlert: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => {
    const saved = await getJewelleryEnquiryById(input.id);
    if (!saved) throw new TRPCError({ code: "NOT_FOUND", message: "Enquiry was not found" });
    if (saved.alertStatus !== "failed") throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Only failed alerts can be retried" });
    return { alertStatus: await deliverSavedJewelleryAlert(saved) };
  }),
  exportCsv: adminProcedure.query(async () => {
    const rows = await listJewelleryEnquiries();
    return { filename: `alvora-jewellery-enquiries-${new Date().toISOString().slice(0, 10)}.csv`, content: exportJewelleryEnquiriesCsv(rows) };
  }),
});
