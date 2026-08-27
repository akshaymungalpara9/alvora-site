DROP INDEX `availability_imports_status_idx` ON `availability_imports`;--> statement-breakpoint
ALTER TABLE `availability_imports` ADD `collection` varchar(30) DEFAULT 'core' NOT NULL;--> statement-breakpoint
ALTER TABLE `availability_stones` ADD `imageUrl` varchar(1024);--> statement-breakpoint
ALTER TABLE `availability_stones` ADD `statementType` varchar(40);--> statement-breakpoint
ALTER TABLE `availability_stones` ADD `crownHeight` double;--> statement-breakpoint
ALTER TABLE `availability_stones` ADD `pavilionDepth` double;--> statement-breakpoint
ALTER TABLE `availability_stones` ADD `crownAngle` double;--> statement-breakpoint
ALTER TABLE `availability_stones` ADD `pavilionAngle` double;--> statement-breakpoint
ALTER TABLE `availability_stones` ADD `girdlePct` double;--> statement-breakpoint
CREATE INDEX `availability_imports_status_idx` ON `availability_imports` (`collection`,`status`,`activatedAt`);