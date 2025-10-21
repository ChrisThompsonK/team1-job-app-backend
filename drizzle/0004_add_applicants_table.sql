CREATE TABLE `Applicants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`jobRoleID` integer NOT NULL,
	`applicantID` text NOT NULL,
	`applicationStatus` text DEFAULT 'pending',
	`appliedAt` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`jobRoleID`) REFERENCES `Job_Roles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`applicantID`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
