import { createClient } from "@libsql/client";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { jwt } from "better-auth/plugins";
import { drizzle } from "drizzle-orm/libsql";
import { env } from "../config/env.js";

const client = createClient({
  url: env.databaseUrl,
});

const db = drizzle(client);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite", // LibSQL is SQLite-compatible
  }),
  secret: env.betterAuthSecret,
  baseURL: env.betterAuthUrl,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // We're not doing email verification
  },
  plugins: [jwt()],
  session: {
    // JWT session configuration - no refresh tokens
    expiresIn: 60 * 60, // 1 hour
    updateAge: 60 * 60, // Don't refresh - set to same as expiresIn
  },
});
