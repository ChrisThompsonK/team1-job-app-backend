import type { Request, Response } from "express";
import { BusinessError, NotFoundError } from "../middleware/errorHandler";
import type { JobService } from "../services/JobService";
import { Job } from "../models/JobModel";

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

  //Create a new job
  async createJob(req: Request, res: Response): Promise<void> {
    const { jobRoleName, description, jobSpecLink, responsibilities, 
      numberOfOpenPositions, location, closingDate, band, capability} = req.body

      if(!jobRoleName || !description || !jobSpecLink || !responsibilities || !numberOfOpenPositions
        || !location || !closingDate || !band || !capability){
        throw new BusinessError("All fields are required to create a job", 400);
      }
      
      const newJobRole: Job = {jobRoleName, description, responsibilities,
        jobSpecLink, location, capability, band, closingDate,numberOfOpenPositions}

      await this.jobService.createJobRole(newJobRole);

      res.status(201).json({
        success: true,
        message: `Job ${jobRoleName} created successfully`,
      })
  }

  async editJob(req: Request, res: Response): Promise<void>{
    const { id, jobRoleName, description, jobSpecLink, responsibilities, 
      numberOfOpenPositions, location, closingDate, band, capability, status} = req.body

      if(!id || !jobRoleName || !description || !jobSpecLink || !responsibilities || !numberOfOpenPositions
        || !location || !closingDate || !band || !capability || !status){
        throw new BusinessError("All fields are required to create a job", 400);
      }
      const updatedJobRole: Job = {id, jobRoleName, description, responsibilities,
        jobSpecLink, location, capability, band, closingDate,numberOfOpenPositions, status}

      await this.jobService.editJobRole(updatedJobRole);

      res.status(200).json({
        success: true,
        message: `Job ${jobRoleName} edited successfully`,
      })
  }
}
