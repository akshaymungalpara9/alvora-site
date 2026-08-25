CREATE TABLE `production_briefs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requestType` varchar(120) NOT NULL,
	`contactName` varchar(180) NOT NULL,
	`email` varchar(320) NOT NULL,
	`company` varchar(180),
	`yearsTrading` varchar(20) NOT NULL,
	`tradeReferencesAvailable` varchar(10) NOT NULL,
	`preferredPaymentApproach` varchar(120) NOT NULL,
	`brief` text NOT NULL,
	`alertStatus` enum('pending','sent','failed') NOT NULL DEFAULT 'pending',
	`alertError` text,
	`alertMessageId` varchar(160),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `production_briefs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `production_briefs_created_idx` ON `production_briefs` (`createdAt`);--> statement-breakpoint
CREATE INDEX `production_briefs_alert_idx` ON `production_briefs` (`alertStatus`);