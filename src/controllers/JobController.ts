import type { JobService } from "../services/JobService";
export class JobController {
  constructor(_jobService: JobService) {
    this.jobService = _jobService;
  }
}
