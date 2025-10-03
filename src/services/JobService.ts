import type { Job } from "../models/JobModel";
import type { JobRepository } from "../repositories/JobRepository";
import type { JobValidator } from "../validators/JobValidator";

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
}
