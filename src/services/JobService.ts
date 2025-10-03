import type { Job, JobFilters } from "../models/JobModel";
import { Band, Capability } from "../models/JobModel";
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

    const filters: JobFilters = { capability: capabilityEnum };
    return await this.jobRepository.getJobsWithFilters(filters);
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

  //Create new job-role
  async createJobRole(job: Job): Promise<void> {
    this.validateBandAndCapability(job);
    await this.jobRepository.createJobRole(job);
  }

  //Edit job-role
  async editJobRole(job: Job): Promise<void> {
    this.validateBandAndCapability(job);
    await this.jobRepository.editJobRole(job);
  }

  // Private helper to validate band and capability
  private validateBandAndCapability(job: Job): void {
    const validBands = Object.values(Band);
    const validCapabilities = Object.values(Capability);
    const bandEnum = validBands.find((b) => b === job.band);
    const capabilityEnum = validCapabilities.find((cap) => cap === job.capability);
    if (!bandEnum) {
      throw new Error(`Invalid band. Must be one of: ${validBands.join(", ")}`);
    }
    if (!capabilityEnum) {
      throw new Error(`Invalid capability. Must be one of: ${validCapabilities.join(", ")}`);
    }
  }
}
