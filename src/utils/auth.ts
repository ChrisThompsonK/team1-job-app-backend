import { createClient } from "@libsql/client";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/libsql";
import { env } from "../config/env.js";
import * as schema from "../db/schemas.js";

const client = createClient({
  url: env.databaseUrl,
});

const db = drizzle(client, { schema });

const getTrustedOrigins = (): string[] => {
  if (env.corsOrigin === "*") {
    // Allow all origins when CORS is set to "*" (development mode)
    return ["http://localhost:3000", "http://localhost:3001"];
  }
  return env.corsOrigin.split(",").map((origin) => origin.trim());
};

if (process.env.NODE_ENV === "development") {
  console.log("🔐 BETTER AUTH CONFIGURATION:");
  console.log("📍 Configuration details:", {
    baseURL: env.betterAuthUrl,
    trustedOrigins: getTrustedOrigins(),
    databaseUrl: env.databaseUrl ? "CONFIGURED" : "MISSING",
    secret: env.betterAuthSecret ? "CONFIGURED" : "MISSING",
    timestamp: new Date().toISOString(),
  });
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite", // LibSQL is SQLite-compatible
    schema: {
      user: schema.user,
      account: schema.account,
      session: schema.session,
    },
  }),
  secret: env.betterAuthSecret,
  baseURL: env.betterAuthUrl,
  trustedOrigins: getTrustedOrigins(),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // No email verification for now
  },
  session: {
    expiresIn: 60 * 60 * 24, // 24 hours
    updateAge: 60 * 60, // Update session every hour
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // Cache for 5 minutes
    },
  },
  advanced: {
    crossSubDomainCookies: {
      enabled: false, // Set to true if frontend is on different subdomain
    },
  },
  logger: {
    level: "debug", // Enable debug logging
    disabled: false,
  },
});
