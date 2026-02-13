CREATE TABLE `posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`content` text NOT NULL,
	`author_id` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
