CREATE TABLE `indicators` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`symbol` varchar(20) NOT NULL,
	`timeframe` varchar(10) NOT NULL DEFAULT '1m',
	`timestamp` timestamp NOT NULL,
	`indicatorType` varchar(50) NOT NULL,
	`parameters` varchar(255),
	`value` decimal(20,8) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `indicators_id` PRIMARY KEY(`id`),
	CONSTRAINT `indicator_lookup_idx` UNIQUE(`symbol`,`timestamp`,`timeframe`,`indicatorType`,`parameters`)
);
--> statement-breakpoint
CREATE TABLE `market_candles` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`symbol` varchar(20) NOT NULL,
	`timeframe` varchar(10) NOT NULL DEFAULT '1m',
	`timestamp` timestamp NOT NULL,
	`open` decimal(20,8) NOT NULL,
	`high` decimal(20,8) NOT NULL,
	`low` decimal(20,8) NOT NULL,
	`close` decimal(20,8) NOT NULL,
	`volume` decimal(20,8) NOT NULL,
	`quoteVolume` decimal(20,8),
	`numberOfTrades` int,
	`takerBuyBaseVolume` decimal(20,8),
	`takerBuyQuoteVolume` decimal(20,8),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `market_candles_id` PRIMARY KEY(`id`),
	CONSTRAINT `symbol_time_idx` UNIQUE(`symbol`,`timestamp`,`timeframe`)
);
--> statement-breakpoint
CREATE TABLE `trading_signals` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`symbol` varchar(20) NOT NULL,
	`timeframe` varchar(10) NOT NULL,
	`timestamp` timestamp NOT NULL,
	`signalType` enum('BUY','SELL','NEUTRAL') NOT NULL,
	`strategy` varchar(100) NOT NULL,
	`confidence` decimal(5,2) NOT NULL,
	`entryPrice` decimal(20,8),
	`stopLoss` decimal(20,8),
	`takeProfit` decimal(20,8),
	`metadata` text,
	`status` enum('PENDING','EXECUTED','CANCELLED','EXPIRED') NOT NULL DEFAULT 'PENDING',
	`executedAt` timestamp,
	`executedPrice` decimal(20,8),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trading_signals_id` PRIMARY KEY(`id`)
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
CREATE INDEX `indicator_timestamp_idx` ON `indicators` (`timestamp`);--> statement-breakpoint
CREATE INDEX `timestamp_idx` ON `market_candles` (`timestamp`);--> statement-breakpoint
CREATE INDEX `signal_symbol_time_idx` ON `trading_signals` (`symbol`,`timestamp`);--> statement-breakpoint
CREATE INDEX `signal_status_idx` ON `trading_signals` (`status`);