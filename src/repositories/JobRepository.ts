import { createClient } from "@libsql/client";
import type { SQL } from "drizzle-orm";
import {
  and,
  asc,
  desc,
  eq,
  type InferSelectModel,
  like,
  or,
  sql,
} from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { env } from "../config/env.js";
import { jobsTable } from "../db/schemas/jobs.js";
import type {
  Job,
  JobFilters,
  PaginatedJobResponse,
} from "../models/JobModel.js";
import { type Band, type Capability, JobStatus } from "../models/JobModel.js";

// Infer the database row type from the schema
type JobRow = InferSelectModel<typeof jobsTable>;

// Mapper function to convert database rows to Job model
function mapJobRowToJob(row: JobRow): Job {
  return {
    id: row.id.toString(),
    jobRoleName: row.jobRoleName,
    description: row.description,
    responsibilities: row.responsibilities
      .split(",")
      .map((item) => item.trim()),
    jobSpecLink: row.jobSpecLink,
    location: row.location,
    capability: row.capability as Capability,
    band: row.band as Band,
    closingDate: new Date(row.closingDate),
    status: row.status as JobStatus,
    numberOfOpenPositions: row.numberOfOpenPositions,
  };
}

class DatabaseJobStore {
  private client = createClient({
    url: env.databaseUrl,
  });
  private db = drizzle(this.client);

  private mapJobToDbValues(job: Job) {
    return {
      jobRoleName: job.jobRoleName ?? "",
      description: job.description ?? "",
      responsibilities: (job.responsibilities ?? []).join(", "),
      jobSpecLink: job.jobSpecLink ?? "",
      location: job.location ?? "",
      capability: job.capability ?? "",
      band: job.band ?? "",
      closingDate: job.closingDate?.toISOString() ?? new Date().toISOString(),
      status: job.status ?? JobStatus.OPEN,
      numberOfOpenPositions: job.numberOfOpenPositions ?? 0,
    };
  }

  async getAllJobs(): Promise<Job[]> {
    const rows = await this.db.select().from(jobsTable).all();
    return rows.map(mapJobRowToJob);
  }

  async getJobById(id: string): Promise<Job | null> {
    const row = await this.db
      .select()
      .from(jobsTable)
      .where(eq(jobsTable.id, Number.parseInt(id, 10)))
      .get();
    return row ? mapJobRowToJob(row) : null;
  }

  async getFilteredJobs(filters: JobFilters): Promise<PaginatedJobResponse> {
    const {
      capability,
      band,
      location,
      status,
      search,
      page = 1,
      limit = 10,
      sortBy = "closingDate",
      sortOrder = "asc",
    } = filters;

    // Build WHERE conditions
    const conditions: SQL[] = [];

    if (capability) {
      conditions.push(eq(jobsTable.capability, capability));
    }

    if (band) {
      conditions.push(eq(jobsTable.band, band));
    }

    if (location) {
      conditions.push(like(jobsTable.location, `%${location}%`));
    }

    if (status) {
      conditions.push(eq(jobsTable.status, status));
    }

    if (search) {
      const searchPattern = `%${search}%`;
      const searchCondition = or(
        like(jobsTable.jobRoleName, searchPattern),
        like(jobsTable.description, searchPattern),
        like(jobsTable.responsibilities, searchPattern)
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    // Count total items for pagination
    let countQuery = this.db
      .select({ count: sql<number>`count(*)` })
      .from(jobsTable);

    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions)) as typeof countQuery;
    }

    const countResult = await countQuery.get();
    const totalItems = countResult?.count ?? 0;

    // Calculate pagination
    const totalPages = Math.ceil(totalItems / limit);
    const offset = (page - 1) * limit;

    // Build main query with sorting
    let query = this.db.select().from(jobsTable);

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    // Apply sorting based on sortBy field
    if (sortBy === "jobRoleName") {
      if (sortOrder === "desc") {
        query = query.orderBy(desc(jobsTable.jobRoleName)) as typeof query;
      } else {
        query = query.orderBy(asc(jobsTable.jobRoleName)) as typeof query;
      }
    } else if (sortBy === "closingDate") {
      if (sortOrder === "desc") {
        query = query.orderBy(desc(jobsTable.closingDate)) as typeof query;
      } else {
        query = query.orderBy(asc(jobsTable.closingDate)) as typeof query;
      }
    } else if (sortBy === "band") {
      query = (
        sortOrder === "desc"
          ? query.orderBy(desc(jobsTable.band))
          : query.orderBy(asc(jobsTable.band))
      ) as typeof query;
    } else if (sortBy === "capability") {
      query = (
        sortOrder === "desc"
          ? query.orderBy(desc(jobsTable.capability))
          : query.orderBy(asc(jobsTable.capability))
      ) as typeof query;
    } else if (sortBy === "location") {
      query = (
        sortOrder === "desc"
          ? query.orderBy(desc(jobsTable.location))
          : query.orderBy(asc(jobsTable.location))
      ) as typeof query;
    }

    // Apply pagination
    query = query.limit(limit).offset(offset) as typeof query;

    const rows = await query.all();
    const jobs = rows.map(mapJobRowToJob);

    return {
      jobs,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      filters,
    };
  }

  async createJobRole(job: Job): Promise<Job> {
    const result = await this.db
      .insert(jobsTable)
      .values(this.mapJobToDbValues(job))
      .returning();
    const createdRow = result[0];
    if (!createdRow) {
      throw new Error("Failed to create job role");
    }
    return mapJobRowToJob(createdRow);
  }

  async editJobRole(job: Job): Promise<void> {
    if (!job.id) {
      throw new Error("Job ID is required for editing");
    }

    await this.db
      .update(jobsTable)
      .set(this.mapJobToDbValues(job))
      .where(eq(jobsTable.id, Number.parseInt(job.id, 10)))
      .run();
  }

  async deleteJobRole(id: string): Promise<void> {
    // First check if the job exists
    const existingJob = await this.db
      .select()
      .from(jobsTable)
      .where(eq(jobsTable.id, Number.parseInt(id, 10)))
      .get();

    if (!existingJob) {
      throw new Error(`Job with ID ${id} not found`);
    }

    await this.db
      .delete(jobsTable)
      .where(eq(jobsTable.id, Number.parseInt(id, 10)))
      .run();
  }

  async updateExpiredJobRoles(): Promise<{ updatedCount: number }> {
    const today = new Date().toISOString().split("T")[0]; // Get YYYY-MM-DD format

    // Update jobs where status is 'open' and either closing date has passed or no positions available
    const result = await this.db
      .update(jobsTable)
      .set({ status: JobStatus.CLOSED })
      .where(
        and(
          eq(jobsTable.status, JobStatus.OPEN),
          or(
            sql`date(${jobsTable.closingDate}) < date(${sql.placeholder("today")})`,
            eq(jobsTable.numberOfOpenPositions, 0)
          )
        )
      )
      .run({ today });

    return { updatedCount: result.rowsAffected };
  }
}

// Singleton instance for the database job store
const jobStore = new DatabaseJobStore();

export class JobRepository {
  async getAllJobs(): Promise<Job[]> {
    return jobStore.getAllJobs();
  }

  async getJobById(id: string): Promise<Job | null> {
    return jobStore.getJobById(id);
  }

  async getFilteredJobs(filters: JobFilters): Promise<PaginatedJobResponse> {
    return jobStore.getFilteredJobs(filters);
  }

  async createJobRole(job: Job): Promise<Job> {
    return await jobStore.createJobRole(job);
  }

  async editJobRole(job: Job): Promise<void> {
    await jobStore.editJobRole(job);
  }

  async deleteJobRole(id: string): Promise<void> {
    await jobStore.deleteJobRole(id);
  }

  async updateExpiredJobRoles(): Promise<{ updatedCount: number }> {
    return await jobStore.updateExpiredJobRoles();
  }
}
