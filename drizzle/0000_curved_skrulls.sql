CREATE TABLE `job_roles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`jobRoleName` text NOT NULL,
	`description` text NOT NULL,
	`responsibilities` text NOT NULL,
	`jobSpecLink` text NOT NULL,
	`location` text NOT NULL,
	`capability` text NOT NULL,
	`band` text NOT NULL,
	`closingDate` text NOT NULL,
	`status` text NOT NULL,
	`numberOfOpenPositions` integer NOT NULL
);
