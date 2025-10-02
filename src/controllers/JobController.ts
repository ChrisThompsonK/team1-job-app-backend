import type { Request, Response } from "express";
import { BusinessError, NotFoundError } from "../middleware/errorHandler";
import type { JobService } from "../services/JobService";

export class JobController {
  private jobService: JobService;

  constructor(jobService: JobService) {
    this.jobService = jobService;
  }

  // GET /jobs - Get all jobs
  async getAllJobs(_req: Request, res: Response): Promise<void> {
    const jobs = await this.jobService.getAllJobs();

    res.status(200).json({
      success: true,
      message: "Jobs retrieved successfully",
      data: jobs,
      count: jobs.length,
    });
  }

  // GET /jobs/:id - Get specific job by ID
  async getJobById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id) {
      throw new BusinessError("Job ID is required", 400);
    }

    const job = await this.jobService.getJobById(id);

    if (!job) {
      throw new NotFoundError("Job not found");
    }

    res.status(200).json({
      success: true,
      message: "Job retrieved successfully",
      data: job,
    });
  }

  // GET /jobs/capability/:capability - Get jobs by capability
  async getJobsByCapability(req: Request, res: Response): Promise<void> {
    const { capability } = req.params;

    if (!capability) {
      throw new BusinessError("Capability is required", 400);
    }

    const jobs = await this.jobService.getJobsByCapability(capability);

    res.status(200).json({
      success: true,
      message: `Jobs for ${capability} capability retrieved successfully`,
      data: jobs,
      count: jobs.length,
    });
  }

  // GET /jobs/band/:band - Get jobs by band
  async getJobsByBand(req: Request, res: Response): Promise<void> {
    const { band } = req.params;

    if (!band) {
      throw new BusinessError("Band is required", 400);
    }

    const jobs = await this.jobService.getJobsByBand(band);

    res.status(200).json({
      success: true,
      message: `Jobs for band ${band} retrieved successfully`,
      data: jobs,
      count: jobs.length,
    });
  }
}
