CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`accountId` text NOT NULL,
	`providerId` text NOT NULL,
	`userId` text NOT NULL,
	`password` text,
	`createdAt` integer DEFAULT (cast(unixepoch() as integer)) NOT NULL,
	`updatedAt` integer DEFAULT (cast(unixepoch() as integer)) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`email` text NOT NULL,
	`emailVerified` integer DEFAULT false,
	`isAdmin` integer DEFAULT false,
	`createdAt` integer DEFAULT (cast(unixepoch() as integer)) NOT NULL,
	`updatedAt` integer DEFAULT (cast(unixepoch() as integer)) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_user`("id", "name", "email", "emailVerified", "isAdmin", "createdAt", "updatedAt") SELECT "id", "name", "email", false, false, "created_at", "updated_at" FROM `user`;--> statement-breakpoint
DROP TABLE `user`;--> statement-breakpoint
ALTER TABLE `__new_user` RENAME TO `user`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);