ALTER TABLE `availability_stones` MODIFY COLUMN `color` varchar(80) NOT NULL;--> statement-breakpoint
ALTER TABLE `availability_imports` ADD `whiteRowCount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `availability_imports` ADD `fancyRowCount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `availability_stones` ADD `category` varchar(40);--> statement-breakpoint
ALTER TABLE `availability_stones` ADD `caratBand` varchar(40);--> statement-breakpoint
ALTER TABLE `availability_stones` ADD `symmetry` varchar(30);--> statement-breakpoint
ALTER TABLE `availability_stones` ADD `depthPct` double;--> statement-breakpoint
ALTER TABLE `availability_stones` ADD `tablePct` double;--> statement-breakpoint
ALTER TABLE `availability_stones` ADD `ratio` double;--> statement-breakpoint
ALTER TABLE `availability_stones` ADD `verifyUrl` varchar(1024);