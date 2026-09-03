ALTER TABLE `production_briefs` ADD `leadType` enum('fast_rfq','qualified_brief') NOT NULL DEFAULT 'qualified_brief';
