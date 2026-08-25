CREATE TABLE `availability_stones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stockNumber` varchar(100) NOT NULL,
	`availability` varchar(40) NOT NULL,
	`shape` varchar(40) NOT NULL,
	`carat` double NOT NULL,
	`color` varchar(20) NOT NULL,
	`clarity` varchar(30) NOT NULL,
	`cut` varchar(30),
	`polish` varchar(30),
	`lab` varchar(30),
	`reportNumber` varchar(120),
	`price` double,
	`location` varchar(90),
	`importedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `availability_stones_id` PRIMARY KEY(`id`),
	CONSTRAINT `availability_stones_stock_number_unique` UNIQUE(`stockNumber`)
);
--> statement-breakpoint
CREATE TABLE `buyer_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`accountName` varchar(180) NOT NULL,
	`contactName` varchar(180) NOT NULL,
	`email` varchar(320) NOT NULL,
	`status` enum('pending','approved','suspended') NOT NULL DEFAULT 'pending',
	`shapes` text NOT NULL,
	`caratMin` double NOT NULL,
	`caratMax` double NOT NULL,
	`colors` text NOT NULL,
	`clarities` text NOT NULL,
	`approvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `buyer_accounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `buyer_accounts_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `email_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`buyerAccountId` int,
	`requestId` int,
	`emailType` enum('approved_buyer_welcome','private_list_request_alert') NOT NULL,
	`recipient` varchar(320) NOT NULL,
	`subject` varchar(500) NOT NULL,
	`status` enum('queued','sent','failed') NOT NULL DEFAULT 'queued',
	`providerMessageId` varchar(160),
	`errorMessage` text,
	`metadata` json,
	`sentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `line_sheets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`buyerAccountId` int NOT NULL,
	`storageKey` varchar(512) NOT NULL,
	`storageUrl` varchar(1024) NOT NULL,
	`validUntil` timestamp NOT NULL,
	`createdByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `line_sheets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `private_list_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`buyerAccountId` int NOT NULL,
	`availabilityStoneId` int NOT NULL,
	`requestedByUserId` int NOT NULL,
	`certificateNumber` varchar(120) NOT NULL,
	`buyerAccountName` varchar(180) NOT NULL,
	`buyerEmail` varchar(320) NOT NULL,
	`note` text,
	`requestStatus` enum('pending','confirmed','closed') NOT NULL DEFAULT 'pending',
	`emailStatus` enum('pending','sent','failed') NOT NULL DEFAULT 'pending',
	`emailError` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `private_list_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE INDEX `availability_stones_band_idx` ON `availability_stones` (`shape`,`carat`,`color`,`clarity`);--> statement-breakpoint
CREATE INDEX `buyer_accounts_status_idx` ON `buyer_accounts` (`status`);--> statement-breakpoint
CREATE INDEX `email_logs_buyer_account_idx` ON `email_logs` (`buyerAccountId`);--> statement-breakpoint
CREATE INDEX `email_logs_request_idx` ON `email_logs` (`requestId`);--> statement-breakpoint
CREATE INDEX `line_sheets_buyer_account_idx` ON `line_sheets` (`buyerAccountId`);--> statement-breakpoint
CREATE INDEX `private_requests_buyer_idx` ON `private_list_requests` (`buyerAccountId`);--> statement-breakpoint
CREATE INDEX `private_requests_status_idx` ON `private_list_requests` (`requestStatus`,`emailStatus`);