import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createProductionBrief, listProductionBriefs, markProductionBriefAlert } from "../db";
import { escapeHtml, sendTransactionalEmail } from "../email";
import { ENV } from "../_core/env";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";

const publicBriefInput = z.object({
  requestType: z.string().min(2).max(120),
  contactName: z.string().min(2).max(180),
  email: z.string().email().max(320),
  company: z.string().max(180).optional(),
  yearsTrading: z.enum(["Under 2", "2–5", "5–10", "10+"]),
  tradeReferencesAvailable: z.enum(["Yes", "No"]),
  preferredPaymentApproach: z.enum(["Prepaid on proforma", "Agreed trade terms subject to credit check", "Open to discussion"]),
  brief: z.string().min(10).max(5000),
});

export const publicProductionBriefRouter = router({
  submit: publicProcedure.input(publicBriefInput).mutation(async ({ input }) => {
    const saved = await createProductionBrief(input);
    if (!saved) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Production brief could not be saved" });

    const senderName = saved.company || saved.contactName;
    const subject = `[Public brief — ${senderName}] ${saved.requestType}`;
    try {
      if (!ENV.leadAlertTo) throw new Error("LEAD_ALERT_TO is not configured");
      const result = await sendTransactionalEmail({
        to: ENV.leadAlertTo,
        subject,
        html: `<div style="font-family:Arial,sans-serif;line-height:1.6"><p><strong>Public production brief</strong></p><p><strong>Contact:</strong> ${escapeHtml(saved.contactName)} (${escapeHtml(saved.email)})<br/><strong>Company:</strong> ${escapeHtml(saved.company || "Not supplied")}<br/><strong>Request:</strong> ${escapeHtml(saved.requestType)}<br/><strong>Years trading:</strong> ${escapeHtml(saved.yearsTrading)}<br/><strong>Trade references:</strong> ${escapeHtml(saved.tradeReferencesAvailable)}<br/><strong>First-order approach:</strong> ${escapeHtml(saved.preferredPaymentApproach)}</p><p><strong>Brief</strong><br/>${escapeHtml(saved.brief).replaceAll("\n", "<br/>")}</p><p>Brief ID: ${saved.id}</p></div>`,
        text: `Public production brief\nContact: ${saved.contactName} (${saved.email})\nCompany: ${saved.company || "Not supplied"}\nRequest: ${saved.requestType}\nYears trading: ${saved.yearsTrading}\nTrade references: ${saved.tradeReferencesAvailable}\nFirst-order approach: ${saved.preferredPaymentApproach}\n\nBrief:\n${saved.brief}\n\nBrief ID: ${saved.id}`,
        tags: [{ name: "workflow", value: "public_production_brief" }, { name: "brief_id", value: String(saved.id) }],
      });
      await markProductionBriefAlert(saved.id, "sent", { alertMessageId: result.id });
      return { briefId: saved.id, alertStatus: "sent" as const };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown alert failure";
      await markProductionBriefAlert(saved.id, "failed", { alertError: message });
      return { briefId: saved.id, alertStatus: "failed" as const };
    }
  }),
});

export const adminProductionBriefRouter = router({
  list: adminProcedure.query(() => listProductionBriefs()),
});
