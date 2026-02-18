CREATE TABLE `posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`content` text NOT NULL,
	`author_id` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `rule_instances` (
	`ruleId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text DEFAULT '',
	`description` text NOT NULL
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
