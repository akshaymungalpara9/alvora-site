ALTER TABLE `production_briefs` ADD `followUpStatus` enum('new','reviewing','quoted','on_hold','closed') DEFAULT 'new' NOT NULL;--> statement-breakpoint
ALTER TABLE `production_briefs` ADD `ownerName` varchar(120);--> statement-breakpoint
ALTER TABLE `production_briefs` ADD `internalNote` text;--> statement-breakpoint
ALTER TABLE `production_briefs` ADD `lastActionAt` timestamp;--> statement-breakpoint
CREATE INDEX `production_briefs_follow_up_idx` ON `production_briefs` (`followUpStatus`,`createdAt`);