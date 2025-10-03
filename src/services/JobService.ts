import {
  validateBand,
  validateBandAndCapability,
  validateCapability,
} from "../middleware/jobValidation";
import type { Job, JobFilters } from "../models/JobModel";
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
    const capabilityEnum = validateCapability(capability);
    const filters: JobFilters = { capability: capabilityEnum };
    return await this.jobRepository.getJobsWithFilters(filters);
  }

  // Get jobs by band with validation
  async getJobsByBand(band: string): Promise<Job[]> {
    const bandEnum = validateBand(band);
    const filters: JobFilters = { band: bandEnum };
    return await this.jobRepository.getJobsWithFilters(filters);
  }

  //Create new job-role
  async createJobRole(job: Job): Promise<void> {
    validateBandAndCapability(job);
    await this.jobRepository.createJobRole(job);
  }

  //Edit job-role
  async editJobRole(job: Job): Promise<void> {
    validateBandAndCapability(job);
    await this.jobRepository.editJobRole(job);
  }
}
