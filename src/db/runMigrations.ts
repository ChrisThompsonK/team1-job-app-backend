import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { env } from "../config/env.js";

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 2000;

export async function runMigrationsWithRetry(): Promise<void> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(
        `🔄 Attempt ${attempt}/${MAX_RETRIES}: Running database migrations...`
      );

      const client = createClient({
        url: env.databaseUrl,
      });

      const db = drizzle(client);

      await migrate(db, { migrationsFolder: "./drizzle" });

      console.log("✅ Migrations completed successfully!");
      return;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(
        `⚠️  Migration attempt ${attempt} failed: ${lastError.message}`
      );

      if (attempt < MAX_RETRIES) {
        console.log(
          `⏳ Retrying in ${RETRY_DELAY_MS}ms... (attempt ${attempt + 1}/${MAX_RETRIES})`
        );
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      }
    }
  }

  console.warn(
    "⚠️  Migrations could not be completed after maximum retries. Continuing with server startup..."
  );
  console.warn(
    "📝 Note: If this is the first deployment, you may need to ensure your database is accessible."
  );

  if (lastError) {
    console.warn(`Last error: ${lastError.message}`);
  }
}

// Run migrations but don't exit the process
