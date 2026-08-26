import {
  claimProductionBriefQualifierFollowUp,
  createEmailLog,
  getDueQualifierFollowUps,
  markEmailLog,
  markProductionBriefAcknowledgement,
  markProductionBriefQualifierFollowUp,
} from "./db";
import { escapeHtml, sendTransactionalEmail } from "./email";
import { ENV } from "./_core/env";

type SavedBrief = Awaited<ReturnType<typeof getDueQualifierFollowUps>>[number];
const twentyFourHoursMs = 24 * 60 * 60 * 1000;

const replyTo = () => ENV.leadAlertTo || ENV.alvoraEmailFrom;

export async function sendProductionBriefAcknowledgement(brief: SavedBrief) {
  const subject = "Your Alvora production brief is recorded";
  const logId = await createEmailLog({
    productionBriefId: brief.id,
    emailType: "public_brief_acknowledgement",
    recipient: brief.email,
    subject,
    metadata: { market: brief.market, requestType: brief.requestType },
  });
  try {
    const result = await sendTransactionalEmail({
      to: brief.email,
      replyTo: replyTo(),
      subject,
      html: `<div style="background:#0c0d0d;color:#f0eee7;padding:32px;font-family:Arial,sans-serif;line-height:1.6"><p style="letter-spacing:3px;font-size:12px;color:#c9ff63;margin:0 0 20px">ALVORA / MADE IN SURAT</p><h1 style="font-family:Georgia,serif;font-size:28px;font-weight:400;margin:0 0 16px">Your brief is with our benches.</h1><p>Hello ${escapeHtml(brief.contactName)},</p><p>We have recorded your production brief for <strong>${escapeHtml(brief.requestType)}</strong>. We will come back with the practical production detail.</p><p style="margin-top:28px">Alvora Diamonds — Made in Surat.</p></div>`,
      text: `Your Alvora production brief is recorded.\n\nHello ${brief.contactName},\n\nWe have recorded your production brief for ${brief.requestType}. We will come back with the practical production detail.\n\nAlvora Diamonds — Made in Surat.`,
      tags: [{ name: "workflow", value: "public_brief_acknowledgement" }, { name: "brief_id", value: String(brief.id) }],
    });
    await markEmailLog(logId, "sent", { providerMessageId: result.id });
    await markProductionBriefAcknowledgement(brief.id, "sent", { messageId: result.id });
    return { briefId: brief.id, status: "sent" as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown acknowledgement failure";
    await markEmailLog(logId, "failed", { errorMessage: message });
    await markProductionBriefAcknowledgement(brief.id, "failed", { error: message });
    return { briefId: brief.id, status: "failed" as const, error: message };
  }
}

export async function runDueQualifierFollowUps(now = new Date()) {
  const dueBefore = new Date(now.getTime() - twentyFourHoursMs);
  const dueBriefs = await getDueQualifierFollowUps(dueBefore);
  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const brief of dueBriefs) {
    if (!await claimProductionBriefQualifierFollowUp(brief.id)) {
      skipped += 1;
      continue;
    }
    const subject = "A little more detail will help us prepare your make";
    const logId = await createEmailLog({
      productionBriefId: brief.id,
      emailType: "public_brief_qualifier_follow_up",
      recipient: brief.email,
      subject,
      metadata: { market: brief.market, requestType: brief.requestType, dueAfterHours: 24 },
    });
    try {
      const result = await sendTransactionalEmail({
        to: brief.email,
        replyTo: replyTo(),
        subject,
        html: `<div style="background:#0c0d0d;color:#f0eee7;padding:32px;font-family:Arial,sans-serif;line-height:1.6"><p style="letter-spacing:3px;font-size:12px;color:#c9ff63;margin:0 0 20px">ALVORA / PRODUCTION NOTE</p><h1 style="font-family:Georgia,serif;font-size:28px;font-weight:400;margin:0 0 16px">A little more detail will help us prepare the make.</h1><p>Hello ${escapeHtml(brief.contactName)},</p><p>If it is useful, reply with any missing detail on your target market, timeline, quantity, or preferred certification. It helps us return with a more useful production answer.</p><p style="margin-top:28px">Alvora Diamonds — Made in Surat.</p></div>`,
        text: `Hello ${brief.contactName},\n\nIf it is useful, reply with any missing detail on your target market, timeline, quantity, or preferred certification. It helps us return with a more useful production answer.\n\nAlvora Diamonds — Made in Surat.`,
        tags: [{ name: "workflow", value: "public_brief_qualifier_follow_up" }, { name: "brief_id", value: String(brief.id) }],
      });
      await markEmailLog(logId, "sent", { providerMessageId: result.id });
      await markProductionBriefQualifierFollowUp(brief.id, "sent", { messageId: result.id });
      sent += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown qualifier follow-up failure";
      await markEmailLog(logId, "failed", { errorMessage: message });
      await markProductionBriefQualifierFollowUp(brief.id, "failed", { error: message });
      failed += 1;
    }
  }

  return { checked: dueBriefs.length, sent, skipped, failed, dueBefore };
}
