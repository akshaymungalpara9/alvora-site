CREATE TABLE `availability_curation` (
	`id` int AUTO_INCREMENT NOT NULL,
	`collection` varchar(30) NOT NULL,
	`stockNumber` varchar(100) NOT NULL,
	`pinned` boolean NOT NULL DEFAULT false,
	`pinRank` int,
	`heroNote` varchar(120),
	`firstSeenAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `availability_curation_id` PRIMARY KEY(`id`),
	CONSTRAINT `availability_curation_collection_stock_unique` UNIQUE(`collection`,`stockNumber`)
);
--> statement-breakpoint
CREATE INDEX `availability_curation_pinned_idx` ON `availability_curation` (`collection`,`pinned`,`pinRank`);--> statement-breakpoint
CREATE INDEX `availability_curation_first_seen_idx` ON `availability_curation` (`collection`,`firstSeenAt`);