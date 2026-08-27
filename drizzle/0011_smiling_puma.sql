ALTER TABLE `availability_curation` DROP INDEX `availability_curation_collection_stock_unique`;--> statement-breakpoint
DROP INDEX `availability_curation_pinned_idx` ON `availability_curation`;--> statement-breakpoint
ALTER TABLE `availability_curation` ADD `catalogTab` varchar(30) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `availability_curation` ADD CONSTRAINT `availability_curation_collection_tab_stock_unique` UNIQUE(`collection`,`catalogTab`,`stockNumber`);--> statement-breakpoint
CREATE INDEX `availability_curation_pinned_idx` ON `availability_curation` (`collection`,`catalogTab`,`pinned`,`pinRank`);
CREATE INDEX `availability_curation_pinned_idx` ON `availability_curation` (`collection`,`catalogTab`,`pinned`,`pinRank`);
