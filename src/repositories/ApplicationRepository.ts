import { createClient } from "@libsql/client";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { env } from "../config/env.js";
import { applicantTable } from "../db/schemas/applications.js";
import { user } from "../db/schemas/auth.js";
import { jobsTable } from "../db/schemas/jobs.js";
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

export interface ApplicationWithDetails {
  id: number;
  jobRoleID: number;
  applicantID: string;
  cvPath: string;
  applicationStatus: string | null;
  appliedAt: string | null;
  jobRoleName: string;
  jobDescription: string;
  jobBand: string;
  jobCapability: string;
  jobClosingDate: string;
  jobLocation: string;
  jobStatus: string;
  applicantName: string | null;
  applicantEmail: string;
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

  /**
   * Get all applications with job and user details (admin only)
   */
  async getAllApplicationsWithDetails(): Promise<ApplicationWithDetails[]> {
    return await db
      .select({
        id: applicantTable.id,
        jobRoleID: applicantTable.jobRoleID,
        applicantID: applicantTable.applicantID,
        cvPath: applicantTable.cvPath,
        applicationStatus: applicantTable.applicationStatus,
        appliedAt: applicantTable.appliedAt,
        jobRoleName: jobsTable.jobRoleName,
        jobDescription: jobsTable.description,
        jobBand: jobsTable.band,
        jobCapability: jobsTable.capability,
        jobClosingDate: jobsTable.closingDate,
        jobLocation: jobsTable.location,
        jobStatus: jobsTable.status,
        applicantName: user.name,
        applicantEmail: user.email,
      })
      .from(applicantTable)
      .innerJoin(jobsTable, eq(applicantTable.jobRoleID, jobsTable.id))
      .innerJoin(user, eq(applicantTable.applicantID, user.id))
      .orderBy(applicantTable.appliedAt);
  }

  /**
   * Get a specific application with job and user details by application ID
   */
  async getApplicationWithDetailsById(
    id: number
  ): Promise<ApplicationWithDetails | null> {
    const [application] = await db
      .select({
        id: applicantTable.id,
        jobRoleID: applicantTable.jobRoleID,
        applicantID: applicantTable.applicantID,
        cvPath: applicantTable.cvPath,
        applicationStatus: applicantTable.applicationStatus,
        appliedAt: applicantTable.appliedAt,
        jobRoleName: jobsTable.jobRoleName,
        jobDescription: jobsTable.description,
        jobBand: jobsTable.band,
        jobCapability: jobsTable.capability,
        jobClosingDate: jobsTable.closingDate,
        jobLocation: jobsTable.location,
        jobStatus: jobsTable.status,
        applicantName: user.name,
        applicantEmail: user.email,
      })
      .from(applicantTable)
      .innerJoin(jobsTable, eq(applicantTable.jobRoleID, jobsTable.id))
      .innerJoin(user, eq(applicantTable.applicantID, user.id))
      .where(eq(applicantTable.id, id))
      .limit(1);

    return application || null;
  }
}
