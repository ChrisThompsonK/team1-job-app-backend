import type { Request, Response } from "express";
import type { JobService } from "../services/JobService";

export class JobController {
  private jobService: JobService;

  constructor(_jobService: JobService) {
    this.jobService = _jobService;
  }

  async getAllJobs(req: Request, res: Response): Promise<void> {
    try {
      const jobs = await this.jobService.getAllJobs();
      res.status(200).json(jobs);
    } catch (error) {
      res.status(500).json({
        error: "Failed to retrieve jobs",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getJobById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ error: "Job ID is required" });
        return;
      }

      const job = await this.jobService.getJobById(id);

      if (!job) {
        res.status(404).json({ error: "Job not found" });
        return;
      }

      res.status(200).json(job);
    } catch (error) {
      res.status(500).json({
        error: "Failed to retrieve job",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async createJob(req: Request, res: Response): Promise<void> {
    try {
      const jobData = req.body;
      const newJob = await this.jobService.createJob(jobData);
      res.status(201).json(newJob);
    } catch (error) {
      res.status(500).json({
        error: "Failed to create job",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async deleteJob(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ error: "Job ID is required" });
        return;
      }

      const result = await this.jobService.deleteJob(id);

      if (result.success) {
        res.status(200).json({
          message: result.message,
          deletedJobId: id,
        });
      } else {
        res.status(404).json({
          error: result.message,
        });
      }
    } catch (error) {
      res.status(500).json({
        error: "Failed to delete job",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
