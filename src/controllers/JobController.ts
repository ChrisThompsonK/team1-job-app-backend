import type { JobService } from "../services/JobService";
export class JobController {
  private jobService: JobService;
  constructor(_jobService: JobService) {
    this.jobService = _jobService;
  }
  async createJob(title: string, description: string): Promise<void> {
    await this.jobService.createJob(title, description);
  }
}
