import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

const client = createClient({
  url: "file:jobApp.db",
});

const db = drizzle(client);

export async function runMigrations(): Promise<void> {
  try {
    console.log("🔄 Running database migrations...");

    await migrate(db, { migrationsFolder: "./drizzle" });

    console.log("✅ Migrations completed successfully!");
  } catch (error) {
    console.error("❌ Error running migrations:", error);
    throw error;
  }
}

// Run migrations
runMigrations()
  .then(() => {
    console.log("🎉 Migration process completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Migration failed:", error);
    process.exit(1);
  });
