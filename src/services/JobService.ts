import type { Job, JobFilters } from "../models/JobModel";
import { Band, Capability, JobStatus } from "../models/JobModel";
import type { JobRepository } from "../repositories/JobRepository";

export class JobService {
  private jobRepository: JobRepository;

  constructor(jobRepository: JobRepository) {
    this.jobRepository = jobRepository;
  }

  // Get all jobs
  async getAllJobs(): Promise<Job[]> {
    return await this.jobRepository.getAllJobs();
  }

  // Get job by ID with validation
  async getJobById(id: string): Promise<Job | null> {
    if (!id || typeof id !== "string" || id.trim() === "") {
      throw new Error("Valid job ID is required");
    }

    return await this.jobRepository.getJobById(id.trim());
  }

  // Get only open jobs (most common use case)
  async getOpenJobs(): Promise<Job[]> {
    return await this.jobRepository.getOpenJobs();
  }

  // Get jobs by capability with validation
  async getJobsByCapability(capability: string): Promise<Job[]> {
    // Validate that the capability is one of our enum values
    const validCapabilities = Object.values(Capability);
    const capabilityEnum = validCapabilities.find((cap) => cap === capability);

    if (!capabilityEnum) {
      throw new Error(
        `Invalid capability. Must be one of: ${validCapabilities.join(", ")}`
      );
    }

    return await this.jobRepository.getJobsByCapability(capabilityEnum);
  }

  // Get jobs by band with validation
  async getJobsByBand(band: string): Promise<Job[]> {
    // Validate that the band is one of our enum values
    const validBands = Object.values(Band);
    const bandEnum = validBands.find((b) => b === band);

    if (!bandEnum) {
      throw new Error(`Invalid band. Must be one of: ${validBands.join(", ")}`);
    }

    const filters: JobFilters = { band: bandEnum };
    return await this.jobRepository.getJobsWithFilters(filters);
  }

  // Advanced search with multiple filters
  async searchJobs(filters: {
    capability?: string;
    band?: string;
    location?: string;
    status?: string;
  }): Promise<Job[]> {
    const validatedFilters: JobFilters = {};

    // Validate capability if provided
    if (filters.capability) {
      const validCapabilities = Object.values(Capability);
      const capabilityEnum = validCapabilities.find(
        (cap) => cap === filters.capability
      );
      if (!capabilityEnum) {
        throw new Error(
          `Invalid capability. Must be one of: ${validCapabilities.join(", ")}`
        );
      }
      validatedFilters.capability = capabilityEnum;
    }

    // Validate band if provided
    if (filters.band) {
      const validBands = Object.values(Band);
      const bandEnum = validBands.find((b) => b === filters.band);
      if (!bandEnum) {
        throw new Error(
          `Invalid band. Must be one of: ${validBands.join(", ")}`
        );
      }
      validatedFilters.band = bandEnum;
    }

    // Validate status if provided
    if (filters.status) {
      const validStatuses = Object.values(JobStatus);
      const statusEnum = validStatuses.find((s) => s === filters.status);
      if (!statusEnum) {
        throw new Error(
          `Invalid status. Must be one of: ${validStatuses.join(", ")}`
        );
      }
      validatedFilters.status = statusEnum;
    }

    // Location doesn't need enum validation - it's a free text search
    if (filters.location) {
      validatedFilters.location = filters.location;
    }

    return await this.jobRepository.getJobsWithFilters(validatedFilters);
  }

  // Get jobs that are closing soon (within next 7 days)
  async getJobsClosingSoon(): Promise<Job[]> {
    const allJobs = await this.jobRepository.getAllJobs();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    return allJobs.filter(
      (job) =>
        job.status === JobStatus.OPEN && job.closingDate <= sevenDaysFromNow
    );
  }
}
