import type { Request, Response } from "express";
import { BusinessError, NotFoundError } from "../middleware/errorHandler.js";
import type { JobService } from "../services/JobService.js";
import {
  describeFilters,
  parseJobFilters,
} from "../utils/QueryParameterParser.js";
import type { JobValidator } from "../validators/JobValidator.js";

export class JobController {
  private jobService: JobService;
  private jobValidator: JobValidator;

  constructor(jobService: JobService, jobValidator: JobValidator) {
    this.jobService = jobService;
    this.jobValidator = jobValidator;
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

  // GET /jobs/search - Get filtered jobs with query parameters
  async getFilteredJobs(req: Request, res: Response): Promise<void> {
    try {
      const filters = parseJobFilters(req);
      const result = await this.jobService.getFilteredJobs(filters);

      res.status(200).json({
        success: true,
        message: "Filtered jobs retrieved successfully",
        data: result.jobs,
        pagination: result.pagination,
        filters: result.filters,
        filtersDescription: describeFilters(filters),
      });
    } catch (error) {
      throw new BusinessError(
        error instanceof Error ? error.message : "Invalid filter parameters",
        400
      );
    }
  }

  //Create a new job
  async createJob(req: Request, res: Response): Promise<void> {
    try {
      const newJobRole = this.jobValidator.createValidatedJob(req.body);
      await this.jobService.createJobRole(newJobRole);

      res.status(201).json({
        success: true,
        message: `Job ${newJobRole.jobRoleName} created successfully`,
      });
    } catch (error) {
      throw new BusinessError(
        error instanceof Error ? error.message : "Invalid job data",
        400
      );
    }
  }

  async editJob(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id) {
      throw new BusinessError("Job ID is required", 400);
    }

    try {
      const updatedJobRole = this.jobValidator.createValidatedJob(req.body, id);
      await this.jobService.editJobRole(updatedJobRole);

      res.status(200).json({
        success: true,
        message: `Job ${updatedJobRole.jobRoleName} edited successfully`,
      });
    } catch (error) {
      throw new BusinessError(
        error instanceof Error ? error.message : "Invalid job data",
        400
      );
    }
  }
}
