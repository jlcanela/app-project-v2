CREATE TABLE `posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`content` text NOT NULL,
	`author_id` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `rule_instances` (
	`ruleId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text DEFAULT '',
	`description` text NOT NULL,
	`content` text NOT NULL,
	`rule_type_id` integer,
	FOREIGN KEY (`rule_type_id`) REFERENCES `rule_types`(`ruleTypeId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `rule_types` (
	`ruleTypeId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text DEFAULT '',
	`description` text NOT NULL,
	`schema_in` text NOT NULL,
	`schema_out` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
