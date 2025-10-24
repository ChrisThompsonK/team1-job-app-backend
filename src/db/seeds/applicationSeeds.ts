import { createClient } from "@libsql/client";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { env } from "../../config/env.js";
import { applicantTable } from "../schemas/applications.js";
import { user } from "../schemas/auth.js";
import { jobsTable } from "../schemas/jobs.js";

const client = createClient({
  url: env.databaseUrl,
});

const db = drizzle(client);

export async function runApplicationSeeds(): Promise<void> {
  try {
    console.log("📝 Starting application seeding...");

    // Clear existing applications
    console.log("🗑️  Clearing existing applications...");
    await db.delete(applicantTable);

    // Get users and jobs for seeding
    const users = await db.select().from(user).limit(5);
    const jobs = await db
      .select()
      .from(jobsTable)
      .where(eq(jobsTable.status, "open"))
      .limit(10);

    if (users.length < 5 || jobs.length < 4) {
      console.log(
        `⚠️  Insufficient data: found ${users.length} users and ${jobs.length} jobs. Need at least 5 users and 4 jobs.`
      );
      console.log("Run auth and job seeds first.");
      return;
    }

    console.log(`Found ${users.length} users and ${jobs.length} jobs`);

    // Create sample applications - ensure we have valid data
    if (!users[0] || !users[1] || !users[2] || !users[3] || !users[4]) {
      throw new Error("Missing required users for seeding");
    }
    if (!jobs[0] || !jobs[1] || !jobs[2] || !jobs[3]) {
      throw new Error("Missing required jobs for seeding");
    }

    const sampleApplications = [
      {
        jobRoleID: jobs[0].id,
        applicantID: users[1].id, // john.doe@example.com
        cvPath: "uploads/cvs/cv-sample-1.pdf",
        applicationStatus: "pending",
        appliedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
      },
      {
        jobRoleID: jobs[1].id,
        applicantID: users[2].id, // jane.smith@example.com
        cvPath: "uploads/cvs/cv-sample-2.pdf",
        applicationStatus: "approved",
        appliedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
      },
      {
        jobRoleID: jobs[2].id,
        applicantID: users[3].id, // bob.johnson@example.com
        cvPath: "uploads/cvs/cv-sample-3.pdf",
        applicationStatus: "rejected",
        appliedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days ago
      },
      {
        jobRoleID: jobs[0].id,
        applicantID: users[4].id, // alice.brown@example.com
        cvPath: "uploads/cvs/cv-sample-4.pdf",
        applicationStatus: "pending",
        appliedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), // 1 day ago
      },
      {
        jobRoleID: jobs[3].id,
        applicantID: users[1].id, // john.doe@example.com (multiple applications)
        cvPath: "uploads/cvs/cv-sample-5.pdf",
        applicationStatus: "pending",
        appliedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
      },
    ];

    // Insert applications
    console.log("📝 Inserting sample applications...");
    await db.insert(applicantTable).values(sampleApplications);

    console.log(
      `✅ Successfully seeded ${sampleApplications.length} applications`
    );
    console.log("   - Mixed statuses: pending, approved, rejected");
    console.log("   - Different timestamps for testing");
    console.log("   - Multiple applications per user");
  } catch (error) {
    console.error("❌ Error seeding applications:", error);
    throw error;
  }
}

// Allow running this script directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runApplicationSeeds()
    .then(() => {
      console.log("🎉 Application seeding completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Application seeding failed:", error);
      process.exit(1);
    });
}
