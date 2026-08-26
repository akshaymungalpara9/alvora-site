CREATE TABLE `availability_imports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceFilename` varchar(255) NOT NULL,
	`rowCount` int NOT NULL,
	`standardRowCount` int NOT NULL,
	`flaggedRowCount` int NOT NULL,
	`status` enum('active','archived') NOT NULL DEFAULT 'archived',
	`importedByUserId` int NOT NULL,
	`activatedAt` timestamp NOT NULL DEFAULT (now()),
	`archivedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `availability_imports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `availability_stones` DROP INDEX `availability_stones_stock_number_unique`;--> statement-breakpoint
ALTER TABLE `availability_stones` ADD `importId` int;--> statement-breakpoint
ALTER TABLE `availability_stones` ADD `fluorescence` varchar(40);--> statement-breakpoint
ALTER TABLE `availability_stones` ADD `measurements` varchar(180);--> statement-breakpoint
ALTER TABLE `availability_stones` ADD `videoUrl` varchar(1024);--> statement-breakpoint
ALTER TABLE `availability_stones` ADD `bandTag` varchar(80);--> statement-breakpoint
ALTER TABLE `availability_stones` ADD `originPartner` varchar(180);--> statement-breakpoint
ALTER TABLE `availability_stones` ADD `standardsFlags` json;--> statement-breakpoint
ALTER TABLE `availability_stones` ADD `isStandardMenu` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `availability_stones` ADD CONSTRAINT `availability_stones_import_stock_unique` UNIQUE(`importId`,`stockNumber`);--> statement-breakpoint
CREATE INDEX `availability_imports_status_idx` ON `availability_imports` (`status`,`activatedAt`);--> statement-breakpoint
CREATE INDEX `availability_stones_import_menu_idx` ON `availability_stones` (`importId`,`isStandardMenu`);