import type { JobRepository } from "../repositories/JobRepository";

export class JobService {
  private jobRepository: JobRepository;
  constructor(_jobRepository: JobRepository) {
    this.jobRepository = _jobRepository;
  }
  async createJob(title: string, description: string): Promise<void> {
    await this.jobRepository.createJob(title, description);
  }
}
