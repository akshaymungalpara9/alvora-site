import { TRPCError } from "@trpc/server";
import { parse as parseCookie } from "cookie";
import { z } from "zod";
import { createProductionBrief, getProductionBriefById, getQualifierFollowUpSchedule, listProductionBriefs, markProductionBriefAlert, saveQualifierFollowUpSchedule, updateProductionBriefFollowUp } from "../db";
import { escapeHtml, sendTransactionalEmail } from "../email";
import { ENV } from "../_core/env";
import { createHeartbeatJob, updateHeartbeatJob } from "../_core/heartbeat";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import { sendProductionBriefAcknowledgement } from "../qualifierFollowUps";
import { COOKIE_NAME } from "../../shared/const";

const publicBriefInput = z.object({
  requestType: z.string().trim().min(2).max(120),
  market: z.enum(["GLOBAL", "FR", "IT", "US", "CA"]).default("GLOBAL"),
  website: z.string().trim().max(200).optional().default(""),
  contactName: z.string().trim().min(2).max(180),
  email: z.string().trim().email().max(320).transform((value) => value.toLowerCase()),
  company: z.string().trim().max(180).optional().transform((value) => value || undefined),
  yearsTrading: z.enum(["Under 2", "2–5", "5–10", "10+"]),
  tradeReferencesAvailable: z.enum(["Yes", "No"]),
  preferredPaymentApproach: z.enum(["Prepaid on proforma", "Agreed trade terms subject to credit check", "Open to discussion"]),
  referrerName: z.string().trim().max(180).optional().transform((value) => value || undefined),
  brief: z.string().trim().min(10).max(5000),
  leadType: z.enum(["fast_rfq", "qualified_brief"]).default("qualified_brief"),
});

const fastRfqInput = z.object({
  market: z.enum(["GLOBAL", "FR", "IT", "US", "CA"]).default("GLOBAL"),
  website: z.string().trim().max(200).optional().default(""),
  contactName: z.string().trim().min(2).max(180),
  email: z.string().trim().email().max(320).transform((value) => value.toLowerCase()),
  company: z.string().trim().max(180).optional().transform((value) => value || undefined),
  phone: z.string().trim().min(2).max(80),
  requirement: z.string().trim().min(2).max(5000),
});
const marketCode = z.enum(["GLOBAL", "FR", "IT", "US", "CA"]);

const csvCell = (value: unknown) => {
  const raw = String(value ?? "");
  const safe = /^\s*[=+\-@]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replaceAll("\"", "\"\"")}"`;
};
const alertSubjectSegment = (value: string) => value.replace(/[\u0000\r\n]+/g, " ").replace(/\s{2,}/g, " ").trim();
const exportProductionBriefCsv = (briefs: Awaited<ReturnType<typeof listProductionBriefs>>) => {
  const columns = [
    "Brief ID", "Received at (UTC)", "Market", "Follow-up status", "Owner", "Contact name", "Work email", "Company / workshop", "Request type", "Years trading", "Trade references", "Preferred first-order approach", "Production brief", "Alert status", "Alert error", "Last action at (UTC)", "Internal note",
  ];
  const rows = briefs.map((brief) => [
    brief.id, brief.createdAt.toISOString(), brief.market, brief.followUpStatus, brief.ownerName, brief.contactName, brief.email, brief.company, brief.requestType, brief.yearsTrading, brief.tradeReferencesAvailable, brief.preferredPaymentApproach, brief.brief, brief.alertStatus, brief.alertError, brief.lastActionAt?.toISOString(), brief.internalNote,
  ].map(csvCell).join(","));
  return [columns.map(csvCell).join(","), ...rows].join("\n");
};

async function sendSavedProductionBriefAlert(saved: NonNullable<Awaited<ReturnType<typeof getProductionBriefById>>>) {
  const senderName = alertSubjectSegment(saved.company || saved.contactName);
  const requestType = alertSubjectSegment(saved.requestType);
  const referralHtml = saved.referrerName ? `<br/><strong>Introduced by:</strong> ${escapeHtml(saved.referrerName)}` : "";
  const referralText = saved.referrerName ? `\nIntroduced by: ${saved.referrerName}` : "";
  const subject = `[Public brief — ${saved.market} — ${senderName}] ${requestType}`;
  try {
    if (!ENV.leadAlertTo) throw new Error("LEAD_ALERT_TO is not configured");
    const result = await sendTransactionalEmail({
      to: ENV.leadAlertTo,
      subject,
      html: `<div style="font-family:Arial,sans-serif;line-height:1.6"><p><strong>Public production brief</strong></p><p><strong>Market:</strong> ${escapeHtml(saved.market)}<br/><strong>Source:</strong> ${escapeHtml(saved.source)}${referralHtml}<br/><strong>Contact:</strong> ${escapeHtml(saved.contactName)} (${escapeHtml(saved.email)})<br/><strong>Company:</strong> ${escapeHtml(saved.company || "Not supplied")}<br/><strong>Request:</strong> ${escapeHtml(saved.requestType)}<br/><strong>Years trading:</strong> ${escapeHtml(saved.yearsTrading)}<br/><strong>Trade references:</strong> ${escapeHtml(saved.tradeReferencesAvailable)}<br/><strong>First-order approach:</strong> ${escapeHtml(saved.preferredPaymentApproach)}</p><p><strong>Brief</strong><br/>${escapeHtml(saved.brief).replaceAll("\n", "<br/>")}</p><p>Brief ID: ${saved.id}</p></div>`,
      text: `Public production brief\nMarket: ${saved.market}\nSource: ${saved.source}${referralText}\nContact: ${saved.contactName} (${saved.email})\nCompany: ${saved.company || "Not supplied"}\nRequest: ${saved.requestType}\nYears trading: ${saved.yearsTrading}\nTrade references: ${saved.tradeReferencesAvailable}\nFirst-order approach: ${saved.preferredPaymentApproach}\n\nBrief:\n${saved.brief}\n\nBrief ID: ${saved.id}`,
      tags: [{ name: "workflow", value: "public_production_brief" }, { name: "brief_id", value: String(saved.id) }, { name: "market", value: saved.market }],
    });
    await markProductionBriefAlert(saved.id, "sent", { alertMessageId: result.id });
    return { briefId: saved.id, alertStatus: "sent" as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown alert failure";
    await markProductionBriefAlert(saved.id, "failed", { alertError: message });
    return { briefId: saved.id, alertStatus: "failed" as const };
  }
}

export const publicProductionBriefRouter = router({
  submit: publicProcedure.input(publicBriefInput).mutation(async ({ input }) => {
    const { website, ...briefInput } = input;
    if (website.trim()) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid public submission" });
    const saved = await createProductionBrief(briefInput);
    if (!saved) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Production brief could not be saved" });

    const [alert] = await Promise.all([
      sendSavedProductionBriefAlert(saved),
      sendProductionBriefAcknowledgement(saved),
    ]);
    return alert;
  }),

  submitFastRfq: publicProcedure.input(fastRfqInput).mutation(async ({ input }) => {
    const { website, phone, requirement, ...rest } = input;
    if (website.trim()) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid public submission" });
    const brief = `Phone / WhatsApp: ${phone}\n\nRequirement:\n${requirement}`;
    const saved = await createProductionBrief({
      ...rest,
      requestType: "Fast RFQ",
      yearsTrading: "N/A",
      tradeReferencesAvailable: "N/A",
      preferredPaymentApproach: "N/A",
      brief,
      leadType: "fast_rfq",
    });
    if (!saved) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Production brief could not be saved" });

    const [alert] = await Promise.all([
      sendSavedProductionBriefAlert(saved),
      sendProductionBriefAcknowledgement(saved),
    ]);
    return alert;
  }),
});

export const adminProductionBriefRouter = router({
  list: adminProcedure.query(() => listProductionBriefs()),
  qualifierFollowUpSchedule: adminProcedure.query(() => getQualifierFollowUpSchedule()),
  enableQualifierFollowUps: adminProcedure.mutation(async ({ ctx }) => {
    const sessionToken = parseCookie(ctx.req.headers.cookie ?? "")[COOKIE_NAME] ?? "";
    const existing = await getQualifierFollowUpSchedule();
    let taskUid: string;
    let nextExecutionAt: string | null | undefined;
    if (existing?.scheduleCronTaskUid) {
      const updated = await updateHeartbeatJob(existing.scheduleCronTaskUid, { cron: "0 0 * * * *", path: "/api/scheduled/qualifier-follow-ups", enable: true }, sessionToken);
      taskUid = existing.scheduleCronTaskUid;
      nextExecutionAt = updated.nextExecutionAt;
    } else {
      const created = await createHeartbeatJob({
        name: "alvora-hourly-qualifier-follow-ups",
        cron: "0 0 * * * *",
        path: "/api/scheduled/qualifier-follow-ups",
        description: "Checks saved production briefs hourly and sends one qualifier follow-up after 24 hours unless an admin has marked a shortlist sent.",
      }, sessionToken);
      taskUid = created.taskUid;
      nextExecutionAt = created.nextExecutionAt;
    }
    const saved = await saveQualifierFollowUpSchedule({ taskUid, isEnabled: true });
    return { schedule: saved, nextExecutionAt: nextExecutionAt ?? null };
  }),
  exportCsv: adminProcedure.input(z.object({ market: marketCode.optional() }).optional()).query(async ({ input }) => {
    const briefs = await listProductionBriefs();
    const scopedBriefs = input?.market ? briefs.filter((brief) => brief.market === input.market) : briefs;
    const stamp = new Date().toISOString().slice(0, 10);
    const scope = input?.market ? `-${input.market.toLowerCase()}` : "";
    return { filename: `alvora-production-briefs${scope}-${stamp}.csv`, content: exportProductionBriefCsv(scopedBriefs) };
  }),
  retryAlert: adminProcedure.input(z.object({ briefId: z.number().int().positive() })).mutation(async ({ input }) => {
    const saved = await getProductionBriefById(input.briefId);
    if (!saved) throw new TRPCError({ code: "NOT_FOUND", message: "Production brief was not found" });
    if (saved.alertStatus !== "failed") throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Only failed alert delivery can be retried" });
    return sendSavedProductionBriefAlert(saved);
  }),
  updateFollowUp: adminProcedure.input(z.object({
    briefId: z.number().int().positive(),
    followUpStatus: z.enum(["new", "reviewing", "shortlist_sent", "quoted", "on_hold", "closed"]),
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
