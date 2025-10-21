CREATE TABLE `Applicants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`jobRoleID` integer NOT NULL,
	`applicantID` text NOT NULL,
	`applicationStatus` text DEFAULT 'pending',
	`appliedAt` text DEFAULT '2025-10-21T14:42:46.663Z',
	FOREIGN KEY (`jobRoleID`) REFERENCES `Job_Roles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`applicantID`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
