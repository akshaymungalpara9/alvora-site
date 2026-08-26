import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  approveBuyerAccount,
  createBuyerAccount,
  createEmailLog,
  createLineSheetRecord,
  createPrivateListRequest,
  getBuyerAccountById,
  getActiveAvailabilityImport,
  getBuyerStone,
  getLatestLineSheet,
  getStonesForBuyer,
  listBuyerAccounts,
  listEmailLogsForBuyer,
  listPrivateRequests,
  markEmailLog,
  markPrivateRequestEmail,
  resolveBuyerAccountForUser,
  safeAvailabilityStone,
} from "../db";
import { escapeHtml, sendTransactionalEmail } from "../email";
import { buildLineSheetPdf } from "../lineSheets";
import { storagePut } from "../storage";
import { ENV } from "../_core/env";
import { adminProcedure, protectedProcedure, router } from "../_core/trpc";

const buyerBands = z.object({
  accountName: z.string().min(2).max(180),
  contactName: z.string().min(2).max(180),
  email: z.string().email(),
  shapes: z.array(z.string().min(1)).min(1),
  caratMin: z.number().positive(),
  caratMax: z.number().positive(),
  colors: z.array(z.string().min(1)).min(1),
  clarities: z.array(z.string().min(1)).min(1),
});

const originFor = (ctx: { req: { protocol: string; get: (name: string) => string | undefined } }) => {
  const host = ctx.req.get("host");
  if (!host) throw new Error("Unable to determine the application origin for the buyer link");
  return `${ctx.req.protocol}://${host}`;
};

const displayBands = (buyer: NonNullable<Awaited<ReturnType<typeof getBuyerAccountById>>>) =>
  `${buyer.shapes.replaceAll(",", " / ")} · ${buyer.caratMin}–${buyer.caratMax} ct · ${buyer.colors.replaceAll(",", " / ")} · ${buyer.clarities.replaceAll(",", " / ")}`;

async function createStoredLineSheet(buyer: NonNullable<Awaited<ReturnType<typeof getBuyerAccountById>>>, userId: number, selectedStones?: Awaited<ReturnType<typeof getStonesForBuyer>>) {
  const stones = selectedStones ?? await getStonesForBuyer(buyer);
  const validUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const pdf = await buildLineSheetPdf({ buyer, stones, validUntil });
  const safeName = buyer.accountName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `buyer-${buyer.id}`;
  const filename = `alvora-${safeName}-line-sheet-${Date.now()}.pdf`;
  const stored = await storagePut(`line-sheets/${buyer.id}/${filename}`, pdf, "application/pdf");
  const lineSheet = await createLineSheetRecord({
    buyerAccountId: buyer.id,
    storageKey: stored.key,
    storageUrl: stored.url,
    validUntil,
    createdByUserId: userId,
  });
  return { lineSheet, pdf, filename, stones };
}

async function sendWelcomeKit(input: {
  ctx: { req: { protocol: string; get: (name: string) => string | undefined } };
  buyer: NonNullable<Awaited<ReturnType<typeof getBuyerAccountById>>>;
  lineSheet: Awaited<ReturnType<typeof createStoredLineSheet>>["lineSheet"];
  pdf: Buffer;
  filename: string;
}) {
  const privateListUrl = `${originFor(input.ctx)}/buyer-availability`;
  const subject = "Your Alvora buyer account is approved";
  const logId = await createEmailLog({
    buyerAccountId: input.buyer.id,
    emailType: "approved_buyer_welcome",
    recipient: input.buyer.email,
    subject,
    metadata: { lineSheetId: input.lineSheet.id, lineSheetUrl: input.lineSheet.storageUrl },
  });
  const bands = displayBands(input.buyer);
  const html = `<div style="background:#0c0d0d;color:#f0eee7;padding:36px;font-family:Arial,sans-serif;line-height:1.6"><p style="letter-spacing:3px;font-size:12px;color:#c9ff63;margin:0 0 22px">ALVORA / MADE IN SURAT</p><h1 style="font-family:Georgia,serif;font-weight:400;font-size:30px;line-height:1.05;margin:0 0 18px">Your buyer account is approved.</h1><p>Hello ${escapeHtml(input.buyer.contactName)},</p><p>Your approved production bands are <strong>${escapeHtml(bands)}</strong>.</p><p><a href="${privateListUrl}" style="display:inline-block;background:#c9ff63;color:#171b10;padding:12px 18px;text-decoration:none;font-size:12px;letter-spacing:1px">OPEN YOUR PRIVATE LIST</a></p><p>Your current line sheet is attached. It is valid for seven days.</p><hr style="border:0;border-top:1px solid #414540;margin:25px 0"/><p style="color:#c9c7bf"><strong>How to buy from Alvora</strong><br/>Place a request in your private list. We confirm the make within 24 hours, then dispatch on agreed terms.</p><p style="margin-top:30px">Alvora Diamonds — Made in Surat.</p></div>`;
  const text = `Your Alvora buyer account is approved.\n\nApproved production bands: ${bands}\n\nPrivate list: ${privateListUrl}\n\nHow to buy from Alvora: Place a request in your private list, we confirm the make within 24 hours, then dispatch on agreed terms.\n\nAlvora Diamonds — Made in Surat.`;
  try {
    const result = await sendTransactionalEmail({
      to: input.buyer.email,
      subject,
      html,
      text,
      attachments: [{ filename: input.filename, content: input.pdf.toString("base64") }],
      tags: [{ name: "workflow", value: "approved_buyer_welcome" }, { name: "buyer_id", value: String(input.buyer.id) }],
    });
    await markEmailLog(logId, "sent", { providerMessageId: result.id });
    return { logId, status: "sent" as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown email failure";
    await markEmailLog(logId, "failed", { errorMessage: message });
    return { logId, status: "failed" as const, error: message };
  }
}

export const adminBuyerRouter = router({
  rolloutStatus: adminProcedure.query(() => ({ buyerActivationEnabled: ENV.alvoraEarlyAccessEnabled })),
  listBuyerAccounts: adminProcedure.query(() => listBuyerAccounts()),
  createBuyerAccount: adminProcedure.input(buyerBands.refine((value) => value.caratMax >= value.caratMin, { message: "Maximum carat must be at least the minimum" })).mutation(({ input }) => createBuyerAccount(input)),
  approveBuyerAccount: adminProcedure.input(z.object({ buyerAccountId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    if (!ENV.alvoraEarlyAccessEnabled) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Buyer activation is locked while controlled early access is being prepared." });
    const buyer = await approveBuyerAccount(input.buyerAccountId);
    if (!buyer) throw new TRPCError({ code: "NOT_FOUND", message: "Buyer account was not found" });
    const lineSheet = await createStoredLineSheet(buyer, ctx.user.id);
    const welcome = await sendWelcomeKit({ ctx, buyer, ...lineSheet });
    return { buyer, lineSheet: lineSheet.lineSheet, welcome };
  }),
  generateLineSheet: adminProcedure.input(z.object({ buyerAccountId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    const buyer = await getBuyerAccountById(input.buyerAccountId);
    if (!buyer) throw new TRPCError({ code: "NOT_FOUND", message: "Buyer account was not found" });
    const generated = await createStoredLineSheet(buyer, ctx.user.id);
    return { lineSheet: generated.lineSheet, stoneCount: generated.stones.length };
  }),
  buyerActivity: adminProcedure.input(z.object({ buyerAccountId: z.number().int().positive() })).query(async ({ input }) => ({
    latestLineSheet: await getLatestLineSheet(input.buyerAccountId),
    emailLogs: await listEmailLogsForBuyer(input.buyerAccountId),
  })),
  privateRequests: adminProcedure.query(() => listPrivateRequests()),
});

export const buyerPortalRouter = router({
  myAvailability: protectedProcedure.query(async ({ ctx }) => {
    if (!ENV.alvoraEarlyAccessEnabled) return { status: "not_approved" as const, buyer: null, stones: [], latestLineSheet: null };
    const buyer = await resolveBuyerAccountForUser(ctx.user);
    if (!buyer || buyer.status !== "approved") return { status: "not_approved" as const, buyer: null, stones: [], latestLineSheet: null };
    return {
      status: "approved" as const,
      buyer,
      stones: (await getStonesForBuyer(buyer)).map(safeAvailabilityStone),
      activeImport: await getActiveAvailabilityImport(),
      latestLineSheet: await getLatestLineSheet(buyer.id),
    };
  }),
  generateCurrentLineSheet: protectedProcedure.input(z.object({ stoneIds: z.array(z.number().int().positive()).min(1).max(64) })).mutation(async ({ ctx, input }) => {
    if (!ENV.alvoraEarlyAccessEnabled) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Private line sheets are not active during controlled early access." });
    const buyer = await resolveBuyerAccountForUser(ctx.user);
    if (!buyer || buyer.status !== "approved") throw new TRPCError({ code: "FORBIDDEN", message: "This account is not approved for private availability" });
    const permittedStones = await getStonesForBuyer(buyer);
    const permittedById = new Map(permittedStones.map((stone) => [stone.id, stone]));
    const selected = input.stoneIds.map((id) => permittedById.get(id)).filter((stone): stone is NonNullable<typeof stone> => Boolean(stone));
    if (selected.length !== input.stoneIds.length) throw new TRPCError({ code: "FORBIDDEN", message: "The requested line-sheet view contains a stone outside your approved current availability." });
    const generated = await createStoredLineSheet(buyer, ctx.user.id, selected);
    return { lineSheet: generated.lineSheet, stoneCount: selected.length };
  }),
  requestStone: protectedProcedure.input(z.object({ stoneId: z.number().int().positive(), requestIntent: z.enum(["request", "hold"]).default("request"), note: z.string().max(1000).optional() })).mutation(async ({ ctx, input }) => {
    if (!ENV.alvoraEarlyAccessEnabled) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Private-list requests are not active during controlled early access." });
    const buyer = await resolveBuyerAccountForUser(ctx.user);
    if (!buyer || buyer.status !== "approved") throw new TRPCError({ code: "FORBIDDEN", message: "This account is not approved for private availability" });
    const stone = await getBuyerStone(buyer, input.stoneId);
    if (!stone) throw new TRPCError({ code: "NOT_FOUND", message: "This stone is not available within your approved bands" });
    const certificateNumber = stone.reportNumber || "Not listed";
    const requestId = await createPrivateListRequest({
      buyerAccountId: buyer.id,
      availabilityStoneId: stone.id,
      requestedByUserId: ctx.user.id,
      certificateNumber,
      buyerAccountName: buyer.accountName,
      buyerEmail: buyer.email,
      requestIntent: input.requestIntent,
      note: input.note,
    });
    const intentLabel = input.requestIntent === "hold" ? "Hold request" : "Stone request";
    const subject = `[Private list — ${buyer.accountName}] ${intentLabel}: IGI ${certificateNumber}`;
    const emailLogId = await createEmailLog({
      buyerAccountId: buyer.id,
      requestId,
      emailType: "private_list_request_alert",
      recipient: ENV.leadAlertTo,
      subject,
      metadata: { stoneId: stone.id, stockNumber: stone.stockNumber, certificateNumber, requestIntent: input.requestIntent },
    });
    try {
      if (!ENV.leadAlertTo) throw new Error("LEAD_ALERT_TO is not configured");
      const result = await sendTransactionalEmail({
        to: ENV.leadAlertTo,
        subject,
        html: `<div style="font-family:Arial,sans-serif;line-height:1.6"><p><strong>Private-list ${escapeHtml(intentLabel.toLowerCase())}</strong></p><p><strong>Buyer:</strong> ${escapeHtml(buyer.accountName)}<br/><strong>Contact:</strong> ${escapeHtml(buyer.contactName)} (${escapeHtml(buyer.email)})<br/><strong>IGI reference:</strong> ${escapeHtml(certificateNumber)}<br/><strong>Alvora stock #:</strong> ${escapeHtml(stone.stockNumber)}<br/><strong>Stone:</strong> ${stone.carat} ct ${escapeHtml(stone.shape)} ${escapeHtml(stone.color)} ${escapeHtml(stone.clarity)}<br/><strong>Buyer note:</strong> ${escapeHtml(input.note || "None")}</p><p>Request ID: ${requestId}</p></div>`,
        text: `Private-list ${intentLabel.toLowerCase()}\nBuyer: ${buyer.accountName}\nContact: ${buyer.contactName} (${buyer.email})\nIGI reference: ${certificateNumber}\nAlvora stock #: ${stone.stockNumber}\nStone: ${stone.carat} ct ${stone.shape} ${stone.color} ${stone.clarity}\nBuyer note: ${input.note || "None"}\nRequest ID: ${requestId}`,
        tags: [{ name: "workflow", value: "private_list_request" }, { name: "request_intent", value: input.requestIntent }, { name: "request_id", value: String(requestId) }],
      });
      await markEmailLog(emailLogId, "sent", { providerMessageId: result.id });
      await markPrivateRequestEmail(requestId, "sent");
      return { requestId, alertStatus: "sent" as const };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown email failure";
      await markEmailLog(emailLogId, "failed", { errorMessage: message });
      await markPrivateRequestEmail(requestId, "failed", message);
      return { requestId, alertStatus: "failed" as const, emailError: message };
    }
  }),
});
