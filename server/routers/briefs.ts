import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createProductionBrief, listProductionBriefs, markProductionBriefAlert, updateProductionBriefFollowUp } from "../db";
import { escapeHtml, sendTransactionalEmail } from "../email";
import { ENV } from "../_core/env";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";

const publicBriefInput = z.object({
  requestType: z.string().min(2).max(120),
  market: z.enum(["GLOBAL", "FR", "IT", "US", "CA"]).default("GLOBAL"),
  contactName: z.string().min(2).max(180),
  email: z.string().email().max(320),
  company: z.string().max(180).optional(),
  yearsTrading: z.enum(["Under 2", "2–5", "5–10", "10+"]),
  tradeReferencesAvailable: z.enum(["Yes", "No"]),
  preferredPaymentApproach: z.enum(["Prepaid on proforma", "Agreed trade terms subject to credit check", "Open to discussion"]),
  brief: z.string().min(10).max(5000),
});
const marketCode = z.enum(["GLOBAL", "FR", "IT", "US", "CA"]);

const csvCell = (value: unknown) => `"${String(value ?? "").replaceAll("\"", "\"\"")}"`;
const exportProductionBriefCsv = (briefs: Awaited<ReturnType<typeof listProductionBriefs>>) => {
  const columns = [
    "Brief ID", "Received at (UTC)", "Market", "Follow-up status", "Owner", "Contact name", "Work email", "Company / workshop", "Request type", "Years trading", "Trade references", "Preferred first-order approach", "Production brief", "Alert status", "Alert error", "Last action at (UTC)", "Internal note",
  ];
  const rows = briefs.map((brief) => [
    brief.id, brief.createdAt.toISOString(), brief.market, brief.followUpStatus, brief.ownerName, brief.contactName, brief.email, brief.company, brief.requestType, brief.yearsTrading, brief.tradeReferencesAvailable, brief.preferredPaymentApproach, brief.brief, brief.alertStatus, brief.alertError, brief.lastActionAt?.toISOString(), brief.internalNote,
  ].map(csvCell).join(","));
  return [columns.map(csvCell).join(","), ...rows].join("\n");
};

export const publicProductionBriefRouter = router({
  submit: publicProcedure.input(publicBriefInput).mutation(async ({ input }) => {
    const saved = await createProductionBrief(input);
    if (!saved) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Production brief could not be saved" });

    const senderName = saved.company || saved.contactName;
    const subject = `[Public brief — ${saved.market} — ${senderName}] ${saved.requestType}`;
    try {
      if (!ENV.leadAlertTo) throw new Error("LEAD_ALERT_TO is not configured");
      const result = await sendTransactionalEmail({
        to: ENV.leadAlertTo,
        subject,
        html: `<div style="font-family:Arial,sans-serif;line-height:1.6"><p><strong>Public production brief</strong></p><p><strong>Market:</strong> ${escapeHtml(saved.market)}<br/><strong>Contact:</strong> ${escapeHtml(saved.contactName)} (${escapeHtml(saved.email)})<br/><strong>Company:</strong> ${escapeHtml(saved.company || "Not supplied")}<br/><strong>Request:</strong> ${escapeHtml(saved.requestType)}<br/><strong>Years trading:</strong> ${escapeHtml(saved.yearsTrading)}<br/><strong>Trade references:</strong> ${escapeHtml(saved.tradeReferencesAvailable)}<br/><strong>First-order approach:</strong> ${escapeHtml(saved.preferredPaymentApproach)}</p><p><strong>Brief</strong><br/>${escapeHtml(saved.brief).replaceAll("\n", "<br/>")}</p><p>Brief ID: ${saved.id}</p></div>`,
        text: `Public production brief\nMarket: ${saved.market}\nContact: ${saved.contactName} (${saved.email})\nCompany: ${saved.company || "Not supplied"}\nRequest: ${saved.requestType}\nYears trading: ${saved.yearsTrading}\nTrade references: ${saved.tradeReferencesAvailable}\nFirst-order approach: ${saved.preferredPaymentApproach}\n\nBrief:\n${saved.brief}\n\nBrief ID: ${saved.id}`,
        tags: [{ name: "workflow", value: "public_production_brief" }, { name: "brief_id", value: String(saved.id) }, { name: "market", value: saved.market }],
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
  exportCsv: adminProcedure.input(z.object({ market: marketCode.optional() }).optional()).query(async ({ input }) => {
    const briefs = await listProductionBriefs();
    const scopedBriefs = input?.market ? briefs.filter((brief) => brief.market === input.market) : briefs;
    const stamp = new Date().toISOString().slice(0, 10);
    const scope = input?.market ? `-${input.market.toLowerCase()}` : "";
    return { filename: `alvora-production-briefs${scope}-${stamp}.csv`, content: exportProductionBriefCsv(scopedBriefs) };
  }),
  updateFollowUp: adminProcedure.input(z.object({
    briefId: z.number().int().positive(),
    followUpStatus: z.enum(["new", "reviewing", "quoted", "on_hold", "closed"]),
    ownerName: z.string().max(120).optional(),
    internalNote: z.string().max(3000).optional(),
  })).mutation(async ({ input }) => {
    const updated = await updateProductionBriefFollowUp({
      id: input.briefId,
      followUpStatus: input.followUpStatus,
      ownerName: input.ownerName,
      internalNote: input.internalNote,
    });
    if (!updated) throw new TRPCError({ code: "NOT_FOUND", message: "Production brief was not found" });
    return updated;
  }),
});
