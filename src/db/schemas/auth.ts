import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Better Auth minimal schema for JWT-only email/password authentication

// User table - stores user information
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: integer("emailVerified", { mode: "boolean" }).default(false),
  isAdmin: integer("isAdmin", { mode: "boolean" }).default(false),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .default(sql`(cast(unixepoch() as integer))`)
    .notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" })
    .default(sql`(cast(unixepoch() as integer))`)
    .$onUpdate(() => new Date())
    .notNull(),
});

// Account table - stores authentication credentials
export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  password: text("password"), // For credential accounts
  createdAt: integer("createdAt", { mode: "timestamp" })
    .default(sql`(cast(unixepoch() as integer))`)
    .notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" })
    .default(sql`(cast(unixepoch() as integer))`)
    .$onUpdate(() => new Date())
    .notNull(),
});

// Session table - required by Better Auth even in JWT-only mode (won't be used)
export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .default(sql`(cast(unixepoch() as integer))`)
    .notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" })
    .default(sql`(cast(unixepoch() as integer))`)
    .$onUpdate(() => new Date())
    .notNull(),
});
