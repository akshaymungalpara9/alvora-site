CREATE TABLE `qualifier_follow_up_schedules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scheduleCronTaskUid` varchar(65),
	`isEnabled` boolean NOT NULL DEFAULT false,
	`lastRunAt` timestamp,
	`lastRunError` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `qualifier_follow_up_schedules_id` PRIMARY KEY(`id`),
	CONSTRAINT `qualifier_follow_up_schedules_scheduleCronTaskUid_unique` UNIQUE(`scheduleCronTaskUid`)
);
--> statement-breakpoint
CREATE TABLE `trade_introductions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`introducerBuyerAccountId` int NOT NULL,
	`introducedByUserId` int NOT NULL,
	`jewellerName` varchar(180) NOT NULL,
	`company` varchar(180),
	`workEmail` varchar(320),
	`market` enum('GLOBAL','FR','IT','US','CA') NOT NULL DEFAULT 'GLOBAL',
	`note` text,
	`alertStatus` enum('pending','sent','failed') NOT NULL DEFAULT 'pending',
	`alertError` text,
	`alertMessageId` varchar(160),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trade_introductions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `email_logs` MODIFY COLUMN `emailType` enum('approved_buyer_welcome','private_list_request_alert','public_brief_acknowledgement','public_brief_qualifier_follow_up') NOT NULL;--> statement-breakpoint
ALTER TABLE `production_briefs` MODIFY COLUMN `followUpStatus` enum('new','reviewing','shortlist_sent','quoted','on_hold','closed') NOT NULL DEFAULT 'new';--> statement-breakpoint
ALTER TABLE `email_logs` ADD `productionBriefId` int;--> statement-breakpoint
ALTER TABLE `production_briefs` ADD `source` enum('direct','referral') DEFAULT 'direct' NOT NULL;--> statement-breakpoint
ALTER TABLE `production_briefs` ADD `referrerName` varchar(180);--> statement-breakpoint
ALTER TABLE `production_briefs` ADD `acknowledgementStatus` enum('pending','sent','failed') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `production_briefs` ADD `acknowledgementMessageId` varchar(160);--> statement-breakpoint
ALTER TABLE `production_briefs` ADD `acknowledgementError` text;--> statement-breakpoint
ALTER TABLE `production_briefs` ADD `qualifierFollowUpStatus` enum('pending','sent','paused','failed') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `production_briefs` ADD `qualifierFollowUpMessageId` varchar(160);--> statement-breakpoint
ALTER TABLE `production_briefs` ADD `qualifierFollowUpError` text;--> statement-breakpoint
ALTER TABLE `production_briefs` ADD `qualifierFollowUpSentAt` timestamp;--> statement-breakpoint
CREATE INDEX `qualifier_follow_up_schedules_enabled_idx` ON `qualifier_follow_up_schedules` (`isEnabled`);--> statement-breakpoint
CREATE INDEX `trade_introductions_buyer_idx` ON `trade_introductions` (`introducerBuyerAccountId`);--> statement-breakpoint
CREATE INDEX `trade_introductions_alert_idx` ON `trade_introductions` (`alertStatus`);--> statement-breakpoint
CREATE INDEX `email_logs_production_brief_idx` ON `email_logs` (`productionBriefId`);--> statement-breakpoint
CREATE INDEX `production_briefs_qualifier_follow_up_idx` ON `production_briefs` (`qualifierFollowUpStatus`,`createdAt`);