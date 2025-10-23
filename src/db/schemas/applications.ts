import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "./auth.js";
import { jobsTable } from "./jobs.js";

export const applicantTable = sqliteTable("Applicants", {
  id: int().primaryKey({ autoIncrement: true }),
  jobRoleID: int()
    .notNull()
    .references(() => jobsTable.id, { onDelete: "cascade" }),
  applicantID: text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  cvPath: text().notNull(),
  applicationStatus: text().default("pending"),
  appliedAt: text().default("CURRENT_TIMESTAMP"),
});
