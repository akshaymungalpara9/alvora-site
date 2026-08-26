import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTradeIntroduction, listTradeIntroductions, markTradeIntroductionAlert, resolveBuyerAccountForUser } from "../db";
import { escapeHtml, sendTransactionalEmail } from "../email";
import { ENV } from "../_core/env";
import { adminProcedure, protectedProcedure, router } from "../_core/trpc";

const introductionInput = z.object({
  jewellerName: z.string().trim().min(2).max(180),
  company: z.string().trim().max(180).optional().transform((value) => value || undefined),
  workEmail: z.string().trim().email().max(320).optional().or(z.literal("")).transform((value) => value ? value.toLowerCase() : undefined),
  market: z.enum(["GLOBAL", "FR", "IT", "US", "CA"]).default("GLOBAL"),
  note: z.string().trim().max(2000).optional().transform((value) => value || undefined),
});

export const tradeIntroducerRouter = router({
  submit: protectedProcedure.input(introductionInput).mutation(async ({ ctx, input }) => {
    const buyer = await resolveBuyerAccountForUser(ctx.user);
    if (!buyer || buyer.status !== "approved") throw new TRPCError({ code: "FORBIDDEN", message: "An approved Alvora trade account is required to make an introduction." });
    const saved = await createTradeIntroduction({
      introducerBuyerAccountId: buyer.id,
      introducedByUserId: ctx.user.id,
      ...input,
    });
    const subject = `[Trade introduction — ${buyer.accountName}] ${saved.jewellerName}`;
    try {
      if (!ENV.leadAlertTo) throw new Error("LEAD_ALERT_TO is not configured");
      const result = await sendTransactionalEmail({
        to: ENV.leadAlertTo,
        subject,
        html: `<div style="font-family:Arial,sans-serif;line-height:1.6"><p><strong>Trade introduction</strong></p><p><strong>Introduced by:</strong> ${escapeHtml(buyer.accountName)} — ${escapeHtml(buyer.contactName)} (${escapeHtml(buyer.email)})<br/><strong>Jeweller:</strong> ${escapeHtml(saved.jewellerName)}<br/><strong>Company:</strong> ${escapeHtml(saved.company || "Not supplied")}<br/><strong>Work email:</strong> ${escapeHtml(saved.workEmail || "Not supplied")}<br/><strong>Market:</strong> ${escapeHtml(saved.market)}</p><p><strong>Note</strong><br/>${escapeHtml(saved.note || "None").replaceAll("\n", "<br/>")}</p><p>Introduction ID: ${saved.id}</p></div>`,
        text: `Trade introduction\nIntroduced by: ${buyer.accountName} — ${buyer.contactName} (${buyer.email})\nJeweller: ${saved.jewellerName}\nCompany: ${saved.company || "Not supplied"}\nWork email: ${saved.workEmail || "Not supplied"}\nMarket: ${saved.market}\n\nNote:\n${saved.note || "None"}\n\nIntroduction ID: ${saved.id}`,
        tags: [{ name: "workflow", value: "trade_introduction" }, { name: "introduction_id", value: String(saved.id) }],
      });
      await markTradeIntroductionAlert(saved.id, "sent", { messageId: result.id });
      return { introductionId: saved.id, alertStatus: "sent" as const };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown introduction alert failure";
      await markTradeIntroductionAlert(saved.id, "failed", { error: message });
      return { introductionId: saved.id, alertStatus: "failed" as const };
    }
  }),
});

export const adminTradeIntroducerRouter = router({
  list: adminProcedure.query(() => listTradeIntroductions()),
});
