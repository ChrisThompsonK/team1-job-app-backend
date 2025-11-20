import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { env } from "../../config/env.js";
import {
  comprehensiveJobSeeds,
  jobRolesTable,
  runApplicationSeeds,
  runAuthSeeds,
} from "./index.js";

const client = createClient({
  url: env.databaseUrl,
});

const db = drizzle(client);

export async function runSeeds(): Promise<void> {
  try {
    // Seed auth data
    await runAuthSeeds();
    console.log("✅ Authentication users seeded");

    // Seed job roles
    await db.delete(jobRolesTable);
    await db.insert(jobRolesTable).values(comprehensiveJobSeeds);
    console.log("✅ Job roles seeded");

    // Seed applications
    await runApplicationSeeds();
    console.log("✅ Applications seeded");
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
