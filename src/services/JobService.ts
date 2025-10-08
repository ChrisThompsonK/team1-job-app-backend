import type {
  Job,
  JobFilters,
  PaginatedJobResponse,
} from "../models/JobModel.js";
import type { JobRepository } from "../repositories/JobRepository.js";
import type { JobValidator } from "../validators/JobValidator.js";

export class JobService {
  private jobRepository: JobRepository;
  private jobValidator: JobValidator;

  constructor(jobRepository: JobRepository, jobValidator: JobValidator) {
    this.jobRepository = jobRepository;
    this.jobValidator = jobValidator;
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

  // Get filtered jobs with validation
  async getFilteredJobs(filters: JobFilters): Promise<PaginatedJobResponse> {
    // Validate pagination parameters
    if (filters.page && filters.page < 1) {
      throw new Error("Page number must be 1 or greater");
    }

    if (filters.limit && (filters.limit < 1 || filters.limit > 100)) {
      throw new Error("Limit must be between 1 and 100");
    }

    return await this.jobRepository.getFilteredJobs(filters);
  }

  //Create new job-role
  async createJobRole(job: Job): Promise<void> {
    this.jobValidator.validateBandAndCapability(job);
    await this.jobRepository.createJobRole(job);
  }

  //Edit job-role
  async editJobRole(job: Job): Promise<void> {
    this.jobValidator.validateBandAndCapability(job);
    await this.jobRepository.editJobRole(job);
  }

  //Delete job-role
  async deleteJobRole(id: string): Promise<void> {
    await this.jobRepository.deleteJobRole(id);
  } 
}
