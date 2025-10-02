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

  // GET /jobs/open - Get only open jobs
  async getOpenJobs(_req: Request, res: Response): Promise<void> {
    const jobs = await this.jobService.getOpenJobs();

    res.status(200).json({
      success: true,
      message: "Open jobs retrieved successfully",
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

  // GET /jobs/search?capability=X&band=Y&location=Z&status=W - Advanced search
  async searchJobs(req: Request, res: Response): Promise<void> {
    const { capability, band, location, status } = req.query;

    // Convert query parameters to strings and filter out undefined values
    const filters: Record<string, string> = {};
    if (typeof capability === "string") filters.capability = capability;
    if (typeof band === "string") filters.band = band;
    if (typeof location === "string") filters.location = location;
    if (typeof status === "string") filters.status = status;

    const jobs = await this.jobService.searchJobs(filters);

    // Build a descriptive message based on filters used
    const filterDescriptions = [];
    if (filters.capability)
      filterDescriptions.push(`capability: ${filters.capability}`);
    if (filters.band) filterDescriptions.push(`band: ${filters.band}`);
    if (filters.location)
      filterDescriptions.push(`location: ${filters.location}`);
    if (filters.status) filterDescriptions.push(`status: ${filters.status}`);

    const filterMessage =
      filterDescriptions.length > 0
        ? ` with filters (${filterDescriptions.join(", ")})`
        : "";

    res.status(200).json({
      success: true,
      message: `Jobs retrieved successfully${filterMessage}`,
      data: jobs,
      count: jobs.length,
      filters: filters,
    });
  }

  // GET /jobs/closing-soon - Get jobs closing in next 7 days
  async getJobsClosingSoon(_req: Request, res: Response): Promise<void> {
    const jobs = await this.jobService.getJobsClosingSoon();

    res.status(200).json({
      success: true,
      message: "Jobs closing soon retrieved successfully",
      data: jobs,
      count: jobs.length,
    });
  }
}
