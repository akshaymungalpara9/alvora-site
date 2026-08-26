import {
  boolean,
  double,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

/** Core Manus-authenticated user identity. */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

/** A commercial account that can be approved before its contact first signs in. */
export const buyerAccounts = mysqlTable(
  "buyer_accounts",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId"),
    accountName: varchar("accountName", { length: 180 }).notNull(),
    contactName: varchar("contactName", { length: 180 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    status: mysqlEnum("status", ["pending", "approved", "suspended"]).default("pending").notNull(),
    shapes: text("shapes").notNull(),
    caratMin: double("caratMin").notNull(),
    caratMax: double("caratMax").notNull(),
    colors: text("colors").notNull(),
    clarities: text("clarities").notNull(),
    approvedAt: timestamp("approvedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    uniqueIndex("buyer_accounts_email_unique").on(table.email),
    index("buyer_accounts_status_idx").on(table.status),
  ],
);

/** The current availability import. Data derives from the supplied availability CSV. */
export const availabilityStones = mysqlTable(
  "availability_stones",
  {
    id: int("id").autoincrement().primaryKey(),
    stockNumber: varchar("stockNumber", { length: 100 }).notNull(),
    availability: varchar("availability", { length: 40 }).notNull(),
    shape: varchar("shape", { length: 40 }).notNull(),
    carat: double("carat").notNull(),
    color: varchar("color", { length: 20 }).notNull(),
    clarity: varchar("clarity", { length: 30 }).notNull(),
    cut: varchar("cut", { length: 30 }),
    polish: varchar("polish", { length: 30 }),
    lab: varchar("lab", { length: 30 }),
    reportNumber: varchar("reportNumber", { length: 120 }),
    price: double("price"),
    location: varchar("location", { length: 90 }),
    importedAt: timestamp("importedAt").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("availability_stones_stock_number_unique").on(table.stockNumber),
    index("availability_stones_band_idx").on(table.shape, table.carat, table.color, table.clarity),
  ],
);

/** A stored, buyer-filtered PDF line sheet. File bytes live in S3, not this table. */
export const lineSheets = mysqlTable(
  "line_sheets",
  {
    id: int("id").autoincrement().primaryKey(),
    buyerAccountId: int("buyerAccountId").notNull(),
    storageKey: varchar("storageKey", { length: 512 }).notNull(),
    storageUrl: varchar("storageUrl", { length: 1024 }).notNull(),
    validUntil: timestamp("validUntil").notNull(),
    createdByUserId: int("createdByUserId"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [index("line_sheets_buyer_account_idx").on(table.buyerAccountId)],
);

/** Immutable audit log for welcome and private-list email delivery attempts. */
export const emailLogs = mysqlTable(
  "email_logs",
  {
    id: int("id").autoincrement().primaryKey(),
    buyerAccountId: int("buyerAccountId"),
    requestId: int("requestId"),
    productionBriefId: int("productionBriefId"),
    emailType: mysqlEnum("emailType", ["approved_buyer_welcome", "private_list_request_alert", "public_brief_acknowledgement", "public_brief_qualifier_follow_up"]).notNull(),
    recipient: varchar("recipient", { length: 320 }).notNull(),
    subject: varchar("subject", { length: 500 }).notNull(),
    status: mysqlEnum("status", ["queued", "sent", "failed"]).default("queued").notNull(),
    providerMessageId: varchar("providerMessageId", { length: 160 }),
    errorMessage: text("errorMessage"),
    metadata: json("metadata"),
    sentAt: timestamp("sentAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [
    index("email_logs_buyer_account_idx").on(table.buyerAccountId),
    index("email_logs_request_idx").on(table.requestId),
    index("email_logs_production_brief_idx").on(table.productionBriefId),
  ],
);

/** A buyer request is persisted before any alert is attempted. */
export const privateListRequests = mysqlTable(
  "private_list_requests",
  {
    id: int("id").autoincrement().primaryKey(),
    buyerAccountId: int("buyerAccountId").notNull(),
    availabilityStoneId: int("availabilityStoneId").notNull(),
    requestedByUserId: int("requestedByUserId").notNull(),
    certificateNumber: varchar("certificateNumber", { length: 120 }).notNull(),
    buyerAccountName: varchar("buyerAccountName", { length: 180 }).notNull(),
    buyerEmail: varchar("buyerEmail", { length: 320 }).notNull(),
    note: text("note"),
    requestStatus: mysqlEnum("requestStatus", ["pending", "confirmed", "closed"]).default("pending").notNull(),
    emailStatus: mysqlEnum("emailStatus", ["pending", "sent", "failed"]).default("pending").notNull(),
    emailError: text("emailError"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index("private_requests_buyer_idx").on(table.buyerAccountId),
    index("private_requests_status_idx").on(table.requestStatus, table.emailStatus),
  ],
);

/** A public production brief is saved before any alert email is attempted. */
export const productionBriefs = mysqlTable(
  "production_briefs",
  {
    id: int("id").autoincrement().primaryKey(),
    requestType: varchar("requestType", { length: 120 }).notNull(),
    market: mysqlEnum("market", ["GLOBAL", "FR", "IT", "US", "CA"]).default("GLOBAL").notNull(),
    source: mysqlEnum("source", ["direct", "referral"]).default("direct").notNull(),
    referrerName: varchar("referrerName", { length: 180 }),
    contactName: varchar("contactName", { length: 180 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    company: varchar("company", { length: 180 }),
    yearsTrading: varchar("yearsTrading", { length: 20 }).notNull(),
    tradeReferencesAvailable: varchar("tradeReferencesAvailable", { length: 10 }).notNull(),
    preferredPaymentApproach: varchar("preferredPaymentApproach", { length: 120 }).notNull(),
    brief: text("brief").notNull(),
    alertStatus: mysqlEnum("alertStatus", ["pending", "sent", "failed"]).default("pending").notNull(),
    alertError: text("alertError"),
    alertMessageId: varchar("alertMessageId", { length: 160 }),
    followUpStatus: mysqlEnum("followUpStatus", ["new", "reviewing", "shortlist_sent", "quoted", "on_hold", "closed"]).default("new").notNull(),
    ownerName: varchar("ownerName", { length: 120 }),
    internalNote: text("internalNote"),
    lastActionAt: timestamp("lastActionAt"),
    acknowledgementStatus: mysqlEnum("acknowledgementStatus", ["pending", "sent", "failed"]).default("pending").notNull(),
    acknowledgementMessageId: varchar("acknowledgementMessageId", { length: 160 }),
    acknowledgementError: text("acknowledgementError"),
    qualifierFollowUpStatus: mysqlEnum("qualifierFollowUpStatus", ["pending", "processing", "sent", "paused", "failed"]).default("pending").notNull(),
    qualifierFollowUpMessageId: varchar("qualifierFollowUpMessageId", { length: 160 }),
    qualifierFollowUpError: text("qualifierFollowUpError"),
    qualifierFollowUpSentAt: timestamp("qualifierFollowUpSentAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index("production_briefs_created_idx").on(table.createdAt),
    index("production_briefs_alert_idx").on(table.alertStatus),
    index("production_briefs_follow_up_idx").on(table.followUpStatus, table.createdAt),
    index("production_briefs_qualifier_follow_up_idx").on(table.qualifierFollowUpStatus, table.createdAt),
  ],
);

/** A durable singleton configuration record for the project-level hourly qualifier follow-up job. */
export const qualifierFollowUpSchedules = mysqlTable(
  "qualifier_follow_up_schedules",
  {
    id: int("id").autoincrement().primaryKey(),
    scheduleCronTaskUid: varchar("scheduleCronTaskUid", { length: 65 }).unique(),
    isEnabled: boolean("isEnabled").default(false).notNull(),
    lastRunAt: timestamp("lastRunAt"),
    lastRunError: text("lastRunError"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [index("qualifier_follow_up_schedules_enabled_idx").on(table.isEnabled)],
);

/** Account-only trade introductions are retained before their internal alert is attempted. */
export const tradeIntroductions = mysqlTable(
  "trade_introductions",
  {
    id: int("id").autoincrement().primaryKey(),
    introducerBuyerAccountId: int("introducerBuyerAccountId").notNull(),
    introducedByUserId: int("introducedByUserId").notNull(),
    jewellerName: varchar("jewellerName", { length: 180 }).notNull(),
    company: varchar("company", { length: 180 }),
    workEmail: varchar("workEmail", { length: 320 }),
    market: mysqlEnum("market", ["GLOBAL", "FR", "IT", "US", "CA"]).default("GLOBAL").notNull(),
    note: text("note"),
    alertStatus: mysqlEnum("alertStatus", ["pending", "sent", "failed"]).default("pending").notNull(),
    alertError: text("alertError"),
    alertMessageId: varchar("alertMessageId", { length: 160 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index("trade_introductions_buyer_idx").on(table.introducerBuyerAccountId),
    index("trade_introductions_alert_idx").on(table.alertStatus),
  ],
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type BuyerAccount = typeof buyerAccounts.$inferSelect;
export type AvailabilityStone = typeof availabilityStones.$inferSelect;
export type ProductionBrief = typeof productionBriefs.$inferSelect;
