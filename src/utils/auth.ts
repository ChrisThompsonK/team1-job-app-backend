import { createClient } from "@libsql/client";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { jwt } from "better-auth/plugins";
import { drizzle } from "drizzle-orm/libsql";
import { env } from "../config/env.js";
import * as schema from "../db/schemas.js";

const client = createClient({
  url: env.databaseUrl,
});

const db = drizzle(client, { schema });

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite", // LibSQL is SQLite-compatible
    schema: {
      user: schema.user,
      account: schema.account,
      session: schema.session, // Required even in JWT-only mode
    },
  }),
  secret: env.betterAuthSecret,
  baseURL: env.betterAuthUrl,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // No email verification
  },
  plugins: [jwt()],
  session: {
    expiresIn: 60 * 60, // 1 hour in seconds
    updateAge: 60 * 60, // Don't refresh session - same as expiresIn for no refresh behavior
    storeSessionInCookie: false, // Use JWT only, no session storage
  },
});
