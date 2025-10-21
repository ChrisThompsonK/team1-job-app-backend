import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "./auth";
import { jobsTable } from "./jobs";

export const applicantTable = sqliteTable("Applicants", {
  id: int().primaryKey({ autoIncrement: true }),
  jobRoleID: int()
    .notNull()
    .references(() => jobsTable.id),
  applicantID: text()
    .notNull()
    .references(() => user.id),
  applicationStatus: text().default("pending"),
  appliedAt: text().default(new Date().toISOString()),
});
