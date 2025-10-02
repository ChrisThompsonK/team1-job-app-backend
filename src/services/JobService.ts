import type { Job } from "../models/JobModel";
import type { JobRepository } from "../repositories/JobRepository";

export class JobService {
  private jobRepository: JobRepository;

  constructor(_jobRepository: JobRepository) {
    this.jobRepository = _jobRepository;
  }

  async getAllJobs(): Promise<Job[]> {
    return await this.jobRepository.findAll();
  }

  async getJobById(id: string): Promise<Job | null> {
    return await this.jobRepository.findById(id);
  }

  async createJob(jobData: Omit<Job, "id" | "createdAt">): Promise<Job> {
    return await this.jobRepository.create(jobData);
  }

  async deleteJob(id: string): Promise<{ success: boolean; message: string }> {
    const existingJob = await this.jobRepository.findById(id);

    if (!existingJob) {
      return {
        success: false,
        message: `Job with id ${id} not found`,
      };
    }

    const deleted = await this.jobRepository.delete(id);

    if (deleted) {
      return {
        success: true,
        message: `Job with id ${id} deleted successfully`,
      };
    } else {
      return {
        success: false,
        message: `Failed to delete job with id ${id}`,
      };
    }
  }
}
