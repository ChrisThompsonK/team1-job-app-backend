import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const usersTable = sqliteTable("users", {
  id: int().primaryKey({ autoIncrement: true }),
  username: text().notNull().unique(),
  passwordHash: text().notNull(),
  role: text().notNull().check(sql`role IN ('admin', 'user')`),
  firstName: text().notNull(),
  lastName: text().notNull(),
});
