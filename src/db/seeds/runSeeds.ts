import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { env } from "../../config/env.js";
import { comprehensiveJobSeeds, jobRolesTable, runAuthSeeds } from "./index";

const client = createClient({
  url: env.databaseUrl,
});

const db = drizzle(client);

export async function runSeeds(): Promise<void> {
  try {
    console.log("🌱 Starting database seeding...");

    // Seed auth data first (users and accounts)
    await runAuthSeeds();

    // Clear existing data (optional - remove if you want to append)
    console.log("🗑️  Clearing existing job roles...");
    await db.delete(jobRolesTable);

    // Insert comprehensive seed data (includes all edge cases)
    console.log("📝 Inserting comprehensive job roles seed data...");
    await db.insert(jobRolesTable).values(comprehensiveJobSeeds);

    console.log(
      `✅ Successfully seeded ${comprehensiveJobSeeds.length} job roles`
    );
    console.log("   - All bands covered: Junior, Mid, Senior, Principal");
    console.log("   - All capabilities covered: Engineering, Data, Workday");
    console.log("   - All statuses covered: Open, Closed, Draft");
    console.log(
      "   - Edge cases included: urgent deadlines, remote positions,"
    );
    console.log(
      "     special characters, various locations, 0 positions, etc."
    );
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run seeds
runSeeds()
  .then(() => {
    console.log("🎉 Seeding completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Seeding failed:", error);
    process.exit(1);
  });
