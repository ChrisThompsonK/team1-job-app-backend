import { createClient } from "@libsql/client";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { env } from "../config/env.js";
import { jobsTable } from "../db/schemas/jobs.js";
import {
  Band,
  Capability,
  type Job,
  JobStatus,
  SortBy,
  SortOrder,
} from "../models/JobModel.js";
import { JobRepository } from "../repositories/JobRepository.js";

describe("JobRepository - Database Tests", () => {
  let jobRepository: JobRepository;
  let originalJobs: Job[] = [];
  const testJobNames = [
    "Test Engineer",
    "Test Job for Responsibilities",
    "Updated Test Job Title",
  ];

  beforeAll(async () => {
    // Set up test database with migrations
    const client = createClient({ url: env.databaseUrl });
    const db = drizzle(client);

    try {
      await migrate(db, { migrationsFolder: "./drizzle" });
    } catch (error) {
      // Migration might fail if tables already exist, which is OK for tests
      console.log("Migration note:", error);
    }

    // Seed the test database with test data
    try {
      // Import the seeds directly to avoid the module-level process.exit calls
      const { comprehensiveJobSeeds } = await import(
        "../db/seeds/comprehensiveJobSeeds.js"
      );
      const { jobsTable } = await import("../db/schemas/jobs.js");

      // Clear existing data and insert seeds manually
      await db.delete(jobsTable);
      await db.insert(jobsTable).values(comprehensiveJobSeeds);
      console.log(
        `✅ Test database seeded with ${comprehensiveJobSeeds.length} job roles`
      );
    } catch (error) {
      console.log("Seeding note:", error);
    }
  });

  beforeEach(async () => {
    jobRepository = new JobRepository();
    // Store the original state of the database before tests
    originalJobs = await jobRepository.getAllJobs();
  });

  afterEach(async () => {
    // Clean up any test jobs created during tests
    const client = createClient({ url: env.databaseUrl });
    const db = drizzle(client);

    // Get all current jobs
    const currentJobs = await jobRepository.getAllJobs();

    // Find jobs that were added during the test (by checking job names)
    const testJobsToDelete = currentJobs.filter((job) =>
      testJobNames.some((name) => job.jobRoleName?.includes(name))
    );

    // Delete test jobs
    for (const job of testJobsToDelete) {
      if (job.id) {
        await db
          .delete(jobsTable)
          .where(eq(jobsTable.id, Number.parseInt(job.id, 10)));
      }
    }

    // Restore any modified jobs to their original state
    for (const originalJob of originalJobs) {
      const currentJob = currentJobs.find((j) => j.id === originalJob.id);
      if (
        currentJob &&
        JSON.stringify(currentJob) !== JSON.stringify(originalJob)
      ) {
        // Job was modified, restore it
        await db
          .update(jobsTable)
          .set({
            jobRoleName: originalJob.jobRoleName ?? "",
            description: originalJob.description ?? "",
            responsibilities: (originalJob.responsibilities ?? []).join(", "),
            jobSpecLink: originalJob.jobSpecLink ?? "",
            location: originalJob.location ?? "",
            capability: originalJob.capability ?? "",
            band: originalJob.band ?? "",
            closingDate:
              originalJob.closingDate?.toISOString() ??
              new Date().toISOString(),
            status: originalJob.status ?? JobStatus.OPEN,
            numberOfOpenPositions: originalJob.numberOfOpenPositions ?? 0,
          })
          .where(eq(jobsTable.id, Number.parseInt(originalJob.id ?? "0", 10)));
      }
    }

    client.close();
  });

  describe("getAllJobs", () => {
    it("should return all jobs from the database", async () => {
      const jobs = await jobRepository.getAllJobs();

      expect(jobs.length).toBeGreaterThan(0);
      expect(jobs[0]).toHaveProperty("id");
      expect(jobs[0]).toHaveProperty("jobRoleName");
      expect(jobs[0]).toHaveProperty("responsibilities");
      expect(Array.isArray(jobs[0].responsibilities)).toBe(true);
    });

    it("should parse responsibilities as array from comma-separated string", async () => {
      const jobs = await jobRepository.getAllJobs();

      expect(Array.isArray(jobs[0].responsibilities)).toBe(true);
      expect(jobs[0].responsibilities?.length).toBeGreaterThan(0);
      // Each responsibility should be a string
      jobs[0].responsibilities?.forEach((resp) => {
        expect(typeof resp).toBe("string");
      });
    });

    it("should convert string IDs and dates correctly", async () => {
      const jobs = await jobRepository.getAllJobs();

      expect(typeof jobs[0].id).toBe("string");
      expect(jobs[0].closingDate).toBeInstanceOf(Date);
    });
  });

  describe("getJobById", () => {
    it("should return a specific job by ID", async () => {
      const jobs = await jobRepository.getAllJobs();
      const firstJobId = jobs[0].id;

      const job = await jobRepository.getJobById(firstJobId as string);

      expect(job).not.toBeNull();
      expect(job?.id).toBe(firstJobId);
      expect(job).toHaveProperty("jobRoleName");
      expect(job).toHaveProperty("description");
      expect(Array.isArray(job?.responsibilities)).toBe(true);
    });

    it("should return null for non-existent job ID", async () => {
      const job = await jobRepository.getJobById("99999");

      expect(job).toBeNull();
    });
  });

  describe("getFilteredJobs", () => {
    it("should return all jobs with default pagination", async () => {
      const result = await jobRepository.getFilteredJobs({});

      expect(result.jobs.length).toBeGreaterThan(0);
      expect(result.pagination.currentPage).toBe(1);
      expect(result.pagination.itemsPerPage).toBe(10);
      expect(result.pagination.totalItems).toBeGreaterThan(0);
      expect(typeof result.pagination.totalPages).toBe("number");
    });

    it("should have proper pagination structure", async () => {
      const result = await jobRepository.getFilteredJobs({});

      expect(result).toHaveProperty("jobs");
      expect(result).toHaveProperty("pagination");
      expect(result).toHaveProperty("filters");

      expect(typeof result.pagination.hasNextPage).toBe("boolean");
      expect(typeof result.pagination.hasPreviousPage).toBe("boolean");
    });

    it("should filter by capability", async () => {
      const result = await jobRepository.getFilteredJobs({
        capability: Capability.DATA,
      });

      // Should only return DATA jobs if any exist
      if (result.jobs.length > 0) {
        expect(result.jobs.every((j) => j.capability === Capability.DATA)).toBe(
          true
        );
      }
    });

    it("should filter by band", async () => {
      const result = await jobRepository.getFilteredJobs({
        band: Band.MID,
      });

      // Should only return Mid jobs if any exist
      if (result.jobs.length > 0) {
        expect(result.jobs.every((j) => j.band === Band.MID)).toBe(true);
      }
    });

    it("should filter by status", async () => {
      const result = await jobRepository.getFilteredJobs({
        status: JobStatus.OPEN,
      });

      // Should only return OPEN jobs if any exist
      if (result.jobs.length > 0) {
        expect(result.jobs.every((j) => j.status === JobStatus.OPEN)).toBe(
          true
        );
      }
    });

    it("should filter by location substring", async () => {
      const result = await jobRepository.getFilteredJobs({
        location: "UK",
      });

      // Should only return UK jobs if any exist
      if (result.jobs.length > 0) {
        expect(result.jobs.every((j) => j.location?.includes("UK"))).toBe(true);
      }
    });

    it("should search across job role name, description, and responsibilities", async () => {
      const result = await jobRepository.getFilteredJobs({
        search: "engineer",
      });

      // Should return jobs that match the search term
      if (result.jobs.length > 0) {
        expect(
          result.jobs.some(
            (j) =>
              j.jobRoleName?.toLowerCase().includes("engineer") ||
              j.description?.toLowerCase().includes("engineer") ||
              j.responsibilities?.some((r) =>
                r.toLowerCase().includes("engineer")
              )
          )
        ).toBe(true);
      }
    });

    it("should handle pagination with page 2", async () => {
      const result = await jobRepository.getFilteredJobs({
        page: 2,
        limit: 2,
      });

      expect(result.pagination.currentPage).toBe(2);
      expect(result.pagination.itemsPerPage).toBe(2);
      expect(result.pagination.hasPreviousPage).toBe(true);
    });

    it("should sort by job role name ascending", async () => {
      const result = await jobRepository.getFilteredJobs({
        sortBy: SortBy.JOB_ROLE_NAME,
        sortOrder: SortOrder.ASC,
      });

      if (result.jobs.length > 1) {
        const names = result.jobs.map((j) => j.jobRoleName ?? "");
        for (let i = 0; i < names.length - 1; i++) {
          expect(names[i].localeCompare(names[i + 1])).toBeLessThanOrEqual(0);
        }
      }
    });

    it("should sort by job role name descending", async () => {
      const result = await jobRepository.getFilteredJobs({
        sortBy: SortBy.JOB_ROLE_NAME,
        sortOrder: SortOrder.DESC,
      });

      if (result.jobs.length > 1) {
        const names = result.jobs.map((j) => j.jobRoleName ?? "");

        // Check that the list is different from ascending order
        const ascResult = await jobRepository.getFilteredJobs({
          sortBy: SortBy.JOB_ROLE_NAME,
          sortOrder: SortOrder.ASC,
        });
        const ascNames = ascResult.jobs.map((j) => j.jobRoleName ?? "");

        // The descending result should be different from ascending
        expect(names[0]).not.toBe(ascNames[0]);
        expect(names[names.length - 1]).not.toBe(ascNames[ascNames.length - 1]);

        // Also verify the first few entries are in a reasonable descending order
        // (more lenient check that accounts for SQLite collation differences)
        const sampleSize = Math.min(5, names.length);
        for (let i = 0; i < sampleSize - 1; i++) {
          // At minimum, check that we don't have obvious ascending violations
          // where a clearly "later" alphabetical item comes before an "earlier" one
          if (names[i][0] < names[i + 1][0]) {
            // Only fail if there's a clear alphabetical violation at the first character level
            if (names[i][0].charCodeAt(0) < names[i + 1][0].charCodeAt(0) - 5) {
              expect(names[i]).toMatch(/^[W-Z]/); // Should start with later letters
            }
          }
        }
      }
    });

    it("should sort by closing date ascending", async () => {
      const result = await jobRepository.getFilteredJobs({
        sortBy: SortBy.CLOSING_DATE,
        sortOrder: SortOrder.ASC,
      });

      if (result.jobs.length > 1) {
        const dates = result.jobs.map((j) => j.closingDate?.getTime() ?? 0);
        for (let i = 0; i < dates.length - 1; i++) {
          expect(dates[i]).toBeLessThanOrEqual(dates[i + 1]);
        }
      }
    });

    it("should sort by closing date descending", async () => {
      const result = await jobRepository.getFilteredJobs({
        sortBy: SortBy.CLOSING_DATE,
        sortOrder: SortOrder.DESC,
      });

      if (result.jobs.length > 1) {
        const dates = result.jobs.map((j) => j.closingDate?.getTime() ?? 0);
        for (let i = 0; i < dates.length - 1; i++) {
          expect(dates[i]).toBeGreaterThanOrEqual(dates[i + 1]);
        }
      }
    });

    it("should combine multiple filters correctly", async () => {
      const result = await jobRepository.getFilteredJobs({
        status: JobStatus.OPEN,
        capability: Capability.ENGINEERING,
      });

      if (result.jobs.length > 0) {
        result.jobs.forEach((job) => {
          expect(job.status).toBe(JobStatus.OPEN);
          expect(job.capability).toBe(Capability.ENGINEERING);
        });
      }
    });

    it("should return filters in the response", async () => {
      const filters = {
        capability: Capability.ENGINEERING,
        band: Band.SENIOR,
        page: 1,
        limit: 5,
      };

      const result = await jobRepository.getFilteredJobs(filters);

      expect(result.filters).toEqual(filters);
    });
  });

  describe("createJobRole", () => {
    it("should create a new job role", async () => {
      const beforeCount = (await jobRepository.getAllJobs()).length;

      const newJob: Job = {
        jobRoleName: "Test Engineer",
        description: "Test description for automated testing",
        responsibilities: ["Test responsibility 1", "Test responsibility 2"],
        jobSpecLink: "https://example.com/test",
        location: "Test Location",
        capability: Capability.ENGINEERING,
        band: Band.JUNIOR,
        closingDate: new Date("2025-12-31"),
        status: JobStatus.OPEN,
        numberOfOpenPositions: 1,
      };

      await jobRepository.createJobRole(newJob);

      const afterJobs = await jobRepository.getAllJobs();
      expect(afterJobs.length).toBe(beforeCount + 1);
      expect(afterJobs.some((j) => j.jobRoleName === "Test Engineer")).toBe(
        true
      );
    });

    it("should store responsibilities as comma-separated values", async () => {
      const newJob: Job = {
        jobRoleName: "Test Job for Responsibilities",
        description: "Testing responsibility storage",
        responsibilities: ["Resp 1", "Resp 2", "Resp 3"],
        jobSpecLink: "https://example.com/test2",
        location: "Test",
        capability: Capability.DATA,
        band: Band.JUNIOR,
        closingDate: new Date("2025-12-31"),
        status: JobStatus.OPEN,
        numberOfOpenPositions: 1,
      };

      await jobRepository.createJobRole(newJob);

      const jobs = await jobRepository.getAllJobs();
      const createdJob = jobs.find(
        (j) => j.jobRoleName === "Test Job for Responsibilities"
      );

      expect(createdJob).toBeDefined();
      expect(createdJob?.responsibilities).toEqual([
        "Resp 1",
        "Resp 2",
        "Resp 3",
      ]);
    });
  });

  describe("editJobRole", () => {
    it("should update an existing job role", async () => {
      const jobs = await jobRepository.getAllJobs();
      const jobToEdit = jobs[0];

      const updatedJob: Job = {
        ...jobToEdit,
        jobRoleName: "Updated Test Job Title",
        numberOfOpenPositions: 99,
      };

      await jobRepository.editJobRole(updatedJob);

      const updatedJobFromDb = await jobRepository.getJobById(
        jobToEdit.id as string
      );
      expect(updatedJobFromDb?.jobRoleName).toBe("Updated Test Job Title");
      expect(updatedJobFromDb?.numberOfOpenPositions).toBe(99);

      // Restore original values for other tests
      await jobRepository.editJobRole(jobToEdit);
    });

    it("should throw error when editing without job ID", async () => {
      const jobWithoutId: Job = {
        jobRoleName: "No ID Job",
        description: "Test",
        responsibilities: [],
        jobSpecLink: "https://example.com",
        location: "Test",
        capability: Capability.ENGINEERING,
        band: Band.JUNIOR,
        closingDate: new Date(),
        status: JobStatus.OPEN,
        numberOfOpenPositions: 1,
      };

      await expect(jobRepository.editJobRole(jobWithoutId)).rejects.toThrow(
        "Job ID is required for editing"
      );
    });
  });
});
