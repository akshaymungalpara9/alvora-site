/**
 * Jewellery enquiries: persistence, internal alerts and the customer
 * acknowledgement.
 *
 * Flow per enquiry: save the row first, then send the internal alert, then a
 * courtesy acknowledgement to the customer. If the database is unreachable
 * the alert is still sent (flagged "not saved") so no customer is lost.
 *
 * The table is created on first use with CREATE TABLE IF NOT EXISTS (the same
 * statement as drizzle/0013_jewellery_enquiries.sql), so a deploy works
 * without a manual migration step.
 */
import fs from "node:fs";
import path from "node:path";
import { desc, eq, sql } from "drizzle-orm";
import { jewelleryEnquiries, type JewelleryEnquiry } from "../drizzle/schema";
import { getDb } from "./db";
import { escapeHtml, sendTransactionalEmail } from "./email";
import { ENV } from "./_core/env";

export const JEWELLERY_ENQUIRIES_DDL = `CREATE TABLE IF NOT EXISTS \`jewellery_enquiries\` (
	\`id\` int AUTO_INCREMENT NOT NULL,
	\`kind\` enum('piece','consultation') NOT NULL DEFAULT 'piece',
	\`pieceCode\` varchar(20),
	\`pieceName\` varchar(180),
	\`metal\` varchar(40),
	\`karat\` varchar(10),
	\`caratWeight\` varchar(20),
	\`ringSize\` varchar(20),
	\`contactName\` varchar(180) NOT NULL,
	\`email\` varchar(320) NOT NULL,
	\`phone\` varchar(80),
	\`country\` varchar(80),
	\`preferredContact\` enum('email','whatsapp','phone','video') NOT NULL DEFAULT 'email',
	\`preferredTime\` varchar(160),
	\`budget\` varchar(60),
	\`message\` text,
	\`landingPage\` varchar(300),
	\`referrer\` varchar(200),
	\`alertStatus\` enum('pending','sent','failed') NOT NULL DEFAULT 'pending',
	\`alertError\` text,
	\`alertMessageId\` varchar(160),
	\`followUpStatus\` enum('new','contacted','quoted','won','lost','on_hold') NOT NULL DEFAULT 'new',
	\`ownerName\` varchar(120),
	\`internalNote\` text,
	\`lastActionAt\` timestamp,
	\`createdAt\` timestamp NOT NULL DEFAULT (now()),
	\`updatedAt\` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT \`jewellery_enquiries_id\` PRIMARY KEY(\`id\`),
	KEY \`jewellery_enquiries_created_idx\` (\`createdAt\`),
	KEY \`jewellery_enquiries_status_idx\` (\`followUpStatus\`,\`createdAt\`)
);`;

export type JewelleryEnquiryInput = {
  kind: "piece" | "consultation";
  pieceCode?: string;
  pieceName?: string;
  metal?: string;
  karat?: string;
  caratWeight?: string;
  ringSize?: string;
  contactName: string;
  email: string;
  phone?: string;
  country?: string;
  preferredContact: "email" | "whatsapp" | "phone" | "video";
  preferredTime?: string;
  budget?: string;
  message?: string;
  landingPage?: string;
  referrer?: string;
};

export type FollowUpStatus = JewelleryEnquiry["followUpStatus"];

let tableReady: Promise<void> | null = null;

async function requireEnquiryDb() {
  const db = await getDb();
  if (!db) throw new Error("Database connection is unavailable");
  if (!tableReady) {
    tableReady = db.execute(sql.raw(JEWELLERY_ENQUIRIES_DDL)).then(() => undefined);
    tableReady.catch(() => {
      tableReady = null;
    });
  }
  await tableReady;
  return db;
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

export async function createJewelleryEnquiry(input: JewelleryEnquiryInput) {
  const db = await requireEnquiryDb();
  const result = await db.insert(jewelleryEnquiries).values({ ...input, email: input.email.toLowerCase() });
  const id = Number((result as unknown as Array<{ insertId: number }>)[0].insertId);
  return (await db.select().from(jewelleryEnquiries).where(eq(jewelleryEnquiries.id, id)).limit(1))[0];
}

export async function getJewelleryEnquiryById(id: number) {
  const db = await requireEnquiryDb();
  return (await db.select().from(jewelleryEnquiries).where(eq(jewelleryEnquiries.id, id)).limit(1))[0];
}

export async function listJewelleryEnquiries() {
  const db = await requireEnquiryDb();
  return db.select().from(jewelleryEnquiries).orderBy(desc(jewelleryEnquiries.createdAt));
}

export async function markJewelleryEnquiryAlert(id: number, status: "sent" | "failed", details: { alertMessageId?: string; alertError?: string }) {
  const db = await requireEnquiryDb();
  await db.update(jewelleryEnquiries).set({ alertStatus: status, alertMessageId: details.alertMessageId ?? null, alertError: details.alertError ?? null }).where(eq(jewelleryEnquiries.id, id));
}

export async function updateJewelleryEnquiryFollowUp(input: { id: number; followUpStatus: FollowUpStatus; ownerName?: string; internalNote?: string }) {
  const db = await requireEnquiryDb();
  await db.update(jewelleryEnquiries).set({
    followUpStatus: input.followUpStatus,
    ownerName: input.ownerName?.trim() || null,
    internalNote: input.internalNote?.trim() || null,
    lastActionAt: new Date(),
  }).where(eq(jewelleryEnquiries.id, input.id));
  return (await db.select().from(jewelleryEnquiries).where(eq(jewelleryEnquiries.id, input.id)).limit(1))[0];
}

// ---------------------------------------------------------------------------
// Private sourcing lookup (internal alerts and admin only)
// ---------------------------------------------------------------------------

type SourcingEntry = { partner: string; handle: string; partnerTitle: string; partnerPriceUsd: number | null };
let sourcingCache: Record<string, SourcingEntry> | null = null;

export function loadJewellerySourcing(): Record<string, SourcingEntry> {
  if (sourcingCache) return sourcingCache;
  const candidates = [
    path.resolve(import.meta.dirname, "data", "jewellery-sourcing.json"), // prod: dist/data
    path.resolve(import.meta.dirname, "..", "server", "data", "jewellery-sourcing.json"),
    path.resolve(import.meta.dirname, "..", "data", "jewellery-sourcing.json"),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      sourcingCache = JSON.parse(fs.readFileSync(candidate, "utf8"));
      return sourcingCache!;
    }
  }
  sourcingCache = {};
  return sourcingCache;
}

// ---------------------------------------------------------------------------
// Email
// ---------------------------------------------------------------------------

/** Strip control characters so customer text cannot alter the subject line. */
export const subjectSegment = (value: string) => value.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s{2,}/g, " ").trim();

const CONTACT_LABELS: Record<JewelleryEnquiryInput["preferredContact"], string> = {
  email: "Email",
  whatsapp: "WhatsApp",
  phone: "Phone call",
  video: "Video call",
};

export function describeSelection(input: Pick<JewelleryEnquiryInput, "karat" | "metal" | "caratWeight" | "ringSize">) {
  return [input.karat && input.metal ? `${input.karat} ${input.metal.toLowerCase()}` : input.metal || input.karat, input.caratWeight ? `${input.caratWeight} ct` : null, input.ringSize ? `size ${input.ringSize}` : null]
    .filter(Boolean)
    .join(" · ");
}

export function buildJewelleryAlert(enquiry: JewelleryEnquiryInput & { id?: number }, options: { saved: boolean }) {
  const selection = describeSelection(enquiry);
  const heading = enquiry.kind === "consultation" ? "Consultation request" : "Jewellery enquiry";
  const subjectParts = [enquiry.kind === "consultation" ? "[Consultation]" : "[Jewellery]", enquiry.pieceName, selection, `— ${enquiry.contactName}`]
    .filter(Boolean)
    .map((part) => subjectSegment(String(part)));
  const subject = subjectParts.join(" ").slice(0, 200);

  const sourcing = enquiry.pieceCode ? loadJewellerySourcing()[enquiry.pieceCode] : undefined;
  const rows: Array<[string, string | undefined]> = [
    ["Piece", enquiry.pieceName ? `${enquiry.pieceName} (${enquiry.pieceCode})` : undefined],
    ["Selection", selection || undefined],
    ["Contact", `${enquiry.contactName} <${enquiry.email}>`],
    ["Phone / WhatsApp", enquiry.phone],
    ["Country", enquiry.country],
    ["Prefers", CONTACT_LABELS[enquiry.preferredContact]],
    ["Best time", enquiry.preferredTime],
    ["Budget", enquiry.budget],
    ["Landing page", enquiry.landingPage ? `${enquiry.landingPage}${enquiry.referrer ? ` (from ${enquiry.referrer})` : ""}` : undefined],
    ["Internal — maker", sourcing ? `${sourcing.partner} · ${sourcing.handle}${sourcing.partnerPriceUsd != null ? ` · partner price $${sourcing.partnerPriceUsd}` : ""}` : undefined],
    ["Enquiry ID", enquiry.id ? String(enquiry.id) : "NOT SAVED — database unavailable, reply from this email"],
  ];
  const present = rows.filter((row): row is [string, string] => Boolean(row[1]));
  const warning = options.saved ? "" : "<p style=\"color:#a33\"><strong>This enquiry could not be saved to the database. Reply directly from this email.</strong></p>";
  const html = `<div style="font-family:Arial,sans-serif;line-height:1.6"><p><strong>${heading}</strong></p>${warning}<p>${present.map(([label, value]) => `<strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}`).join("<br/>")}</p>${enquiry.message ? `<p><strong>Message</strong><br/>${escapeHtml(enquiry.message).replaceAll("\n", "<br/>")}</p>` : ""}</div>`;
  const text = `${heading}\n${options.saved ? "" : "NOT SAVED — reply directly from this email\n"}${present.map(([label, value]) => `${label}: ${value}`).join("\n")}${enquiry.message ? `\n\nMessage:\n${enquiry.message}` : ""}`;
  return { subject, html, text };
}

export async function sendJewelleryAlert(enquiry: JewelleryEnquiryInput & { id?: number }, options: { saved: boolean }) {
  if (!ENV.leadAlertTo) throw new Error("LEAD_ALERT_TO is not configured");
  const { subject, html, text } = buildJewelleryAlert(enquiry, options);
  return sendTransactionalEmail({
    to: ENV.leadAlertTo,
    subject,
    html,
    text,
    replyTo: enquiry.email,
    tags: [{ name: "workflow", value: enquiry.kind === "consultation" ? "jewellery_consultation" : "jewellery_enquiry" }, ...(enquiry.id ? [{ name: "enquiry_id", value: String(enquiry.id) }] : [])],
  });
}

export async function deliverSavedJewelleryAlert(saved: JewelleryEnquiry) {
  try {
    const result = await sendJewelleryAlert(toInput(saved) as JewelleryEnquiryInput & { id: number }, { saved: true });
    await markJewelleryEnquiryAlert(saved.id, "sent", { alertMessageId: result.id });
    return "sent" as const;
  } catch (error) {
    await markJewelleryEnquiryAlert(saved.id, "failed", { alertError: error instanceof Error ? error.message : "Unknown alert failure" }).catch(() => undefined);
    return "failed" as const;
  }
}

/** Courtesy acknowledgement to the customer; failures are ignored. */
export async function sendJewelleryAcknowledgement(enquiry: JewelleryEnquiryInput) {
  const firstName = enquiry.contactName.split(/\s+/)[0] || enquiry.contactName;
  const about = enquiry.kind === "consultation" ? "your consultation request" : `your enquiry${enquiry.pieceName ? ` about the ${enquiry.pieceName}` : ""}`;
  const html = `<div style="font-family:Georgia,serif;line-height:1.7;color:#1b1a18"><p>Dear ${escapeHtml(firstName)},</p><p>Thank you for ${escapeHtml(about)}. A member of the Alvora team will reply within one working day with the details you asked for${enquiry.kind === "piece" ? ", including a written price for your selection" : " and a time for your consultation"}.</p><p>Nothing is made or charged until you confirm.</p><p>With warm regards,<br/>Alvora · Surat</p></div>`;
  const text = `Dear ${firstName},\n\nThank you for ${about}. A member of the Alvora team will reply within one working day with the details you asked for${enquiry.kind === "piece" ? ", including a written price for your selection" : " and a time for your consultation"}.\n\nNothing is made or charged until you confirm.\n\nWith warm regards,\nAlvora · Surat`;
  try {
    await sendTransactionalEmail({ to: enquiry.email, subject: "We have your enquiry — Alvora", html, text, replyTo: ENV.leadAlertTo || undefined, tags: [{ name: "workflow", value: "jewellery_acknowledgement" }] });
  } catch {
    // Acknowledgements are best-effort.
  }
}

function toInput(row: JewelleryEnquiry): JewelleryEnquiryInput & { id: number } {
  return {
    id: row.id,
    kind: row.kind,
    pieceCode: row.pieceCode ?? undefined,
    pieceName: row.pieceName ?? undefined,
    metal: row.metal ?? undefined,
    karat: row.karat ?? undefined,
    caratWeight: row.caratWeight ?? undefined,
    ringSize: row.ringSize ?? undefined,
    contactName: row.contactName,
    email: row.email,
    phone: row.phone ?? undefined,
    country: row.country ?? undefined,
    preferredContact: row.preferredContact,
    preferredTime: row.preferredTime ?? undefined,
    budget: row.budget ?? undefined,
    message: row.message ?? undefined,
    landingPage: row.landingPage ?? undefined,
    referrer: row.referrer ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// CSV export
// ---------------------------------------------------------------------------

/** Formula-like cells are prefixed so spreadsheets treat them as text. */
export const csvCell = (value: unknown) => {
  const raw = String(value ?? "");
  const safe = /^\s*[=+\-@]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replaceAll('"', '""')}"`;
};

export function exportJewelleryEnquiriesCsv(rows: JewelleryEnquiry[]) {
  const sourcing = loadJewellerySourcing();
  const columns = ["ID", "Received (UTC)", "Type", "Status", "Owner", "Name", "Email", "Phone", "Country", "Prefers", "Best time", "Piece code", "Piece", "Metal", "Karat", "Carat", "Ring size", "Budget", "Message", "Landing page", "Referrer", "Maker", "Maker handle", "Alert", "Internal note"];
  const lines = rows.map((row) => [
    row.id, row.createdAt.toISOString(), row.kind, row.followUpStatus, row.ownerName, row.contactName, row.email, row.phone, row.country, row.preferredContact, row.preferredTime, row.pieceCode, row.pieceName, row.metal, row.karat, row.caratWeight, row.ringSize, row.budget, row.message, row.landingPage, row.referrer,
    row.pieceCode ? sourcing[row.pieceCode]?.partner : "", row.pieceCode ? sourcing[row.pieceCode]?.handle : "", row.alertStatus, row.internalNote,
  ].map(csvCell).join(","));
  return [columns.map(csvCell).join(","), ...lines].join("\n");
}
