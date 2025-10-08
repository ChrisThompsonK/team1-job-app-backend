import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { env } from "../../config/env.js";
import { jobRolesSeeds, jobRolesTable } from "./index";

const client = createClient({
  url: env.databaseUrl,
});

const db = drizzle(client);

export async function runSeeds(): Promise<void> {
  try {
    console.log("🌱 Starting database seeding...");

    // Clear existing data (optional - remove if you want to append)
    console.log("🗑️  Clearing existing job roles...");
    await db.delete(jobRolesTable);

    // Insert seed data
    console.log("📝 Inserting job roles seed data...");
    await db.insert(jobRolesTable).values(jobRolesSeeds);

    console.log(`✅ Successfully seeded ${jobRolesSeeds.length} job roles`);
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
