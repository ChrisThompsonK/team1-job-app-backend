import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
export const usersTable = sqliteTable("Job_Roles", {
  id: int().primaryKey({ autoIncrement: true }),
  jobRoleName: text().notNull(),
  description: text().notNull(),
  responsibilities: text().notNull(),
  jobSpecLink: text().notNull(),
  location: text().notNull(),
  Capability: text().notNull(),
  band: text().notNull(),
  closingDate: text().notNull(),
  status: text().notNull(),
  numberOfOpenPositions: int().notNull(),
});
