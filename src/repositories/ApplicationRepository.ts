import { createClient } from "@libsql/client";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { env } from "../config/env.js";
import { applicantTable } from "../db/schemas/applications.js";
import * as schema from "../db/schemas.js";

const client = createClient({
  url: env.databaseUrl,
});

const db = drizzle(client, { schema });

export interface CreateApplicationData {
  jobRoleID: number;
  applicantID: string;
  cvPath: string;
}

export interface Application {
  id: number;
  jobRoleID: number;
  applicantID: string;
  cvPath: string;
  applicationStatus: string | null;
  appliedAt: string | null;
}

/**
 * Repository for handling application data operations
 */
export class ApplicationRepository {
  /**
   * Create a new job application
   */
  async createApplication(data: CreateApplicationData): Promise<Application> {
    const [application] = await db
      .insert(applicantTable)
      .values({
        jobRoleID: data.jobRoleID,
        applicantID: data.applicantID,
        cvPath: data.cvPath,
      })
      .returning();

    if (!application) {
      throw new Error("Failed to create application");
    }

    return application;
  }

  /**
   * Check if a user has already applied to a specific job
   */
  async hasUserApplied(userId: string, jobId: number): Promise<boolean> {
    const [existingApplication] = await db
      .select()
      .from(applicantTable)
      .where(
        and(
          eq(applicantTable.applicantID, userId),
          eq(applicantTable.jobRoleID, jobId)
        )
      )
      .limit(1);

    return !!existingApplication;
  }

  /**
   * Get all applications for a specific user
   */
  async getApplicationsByUserId(userId: string): Promise<Application[]> {
    return await db
      .select()
      .from(applicantTable)
      .where(eq(applicantTable.applicantID, userId));
  }

  /**
   * Get all applications for a specific job
   */
  async getApplicationsByJobId(jobId: number): Promise<Application[]> {
    return await db
      .select()
      .from(applicantTable)
      .where(eq(applicantTable.jobRoleID, jobId));
  }

  /**
   * Get a specific application by ID
   */
  async getApplicationById(id: number): Promise<Application | null> {
    const [application] = await db
      .select()
      .from(applicantTable)
      .where(eq(applicantTable.id, id))
      .limit(1);

    return application || null;
  }
}
