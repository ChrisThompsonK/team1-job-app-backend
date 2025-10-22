PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_Applicants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`jobRoleID` integer NOT NULL,
	`applicantID` text NOT NULL,
	`cvPath` text NOT NULL,
	`applicationStatus` text DEFAULT 'pending',
	`appliedAt` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`jobRoleID`) REFERENCES `Job_Roles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`applicantID`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_Applicants`("id", "jobRoleID", "applicantID", "cvPath", "applicationStatus", "appliedAt") SELECT "id", "jobRoleID", "applicantID", '', "applicationStatus", "appliedAt" FROM `Applicants`;--> statement-breakpoint
DROP TABLE `Applicants`;--> statement-breakpoint
ALTER TABLE `__new_Applicants` RENAME TO `Applicants`;--> statement-breakpoint
PRAGMA foreign_keys=ON;