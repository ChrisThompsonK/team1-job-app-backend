import { Router } from "express";
import type { JobController } from "../controllers/JobController";

export const createJobRoutes = (jobController: JobController) => {
  const router = Router();

  // Get all jobs
  router.get("/jobs", (req, res) => {
    jobController.getAllJobs(req, res);
  });

  // Get job by ID
  router.get("/jobs/:id", (req, res) => {
    jobController.getJobById(req, res);
  });

  // Create new job
  router.post("/jobs", (req, res) => {
    jobController.createJob(req, res);
  });

  // Delete job by ID
  router.delete("/jobs/:id", (req, res) => {
    jobController.deleteJob(req, res);
  });

  return router;
};
