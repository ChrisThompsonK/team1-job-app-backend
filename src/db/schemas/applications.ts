import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "./auth";
import { jobsTable } from "./jobs";

export const applicantTable = sqliteTable("Applicants", {
  id: int().primaryKey({ autoIncrement: true }),
  jobRoleID: int()
    .notNull()
    .references(() => jobsTable.id, { onDelete: "cascade" }),
  applicantID: text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  applicationStatus: text().default("pending"),
  appliedAt: text().default("sqlCURRENT_TIMESTAMP"),
});
