import type { JobRepository } from "../repositories/JobRepository";

export class JobService {
  constructor(_jobRepository: JobRepository) {
    this.jobRepository = _jobRepository;
  }
}
