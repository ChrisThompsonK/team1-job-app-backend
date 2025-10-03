import { Router } from "express";
import type { JobController } from "../controllers/JobController";
import { asyncHandler } from "../middleware/errorHandler";

export const createJobRoutes = (jobController: JobController) => {
  const router = Router();

  // Job routes - all wrapped with asyncHandler for error handling
  router.get(
    "/jobs",
    asyncHandler(jobController.getAllJobs.bind(jobController))
  );
  router.get(
    "/jobs/capability/:capability",
    asyncHandler(jobController.getJobsByCapability.bind(jobController))
  );
  router.get(
    "/jobs/band/:band",
    asyncHandler(jobController.getJobsByBand.bind(jobController))
  );
  router.get(
    "/jobs/:id",
    asyncHandler(jobController.getJobById.bind(jobController))
  );
  router.post(
    "/jobs",
    asyncHandler(jobController.createJob.bind(jobController))
  );
  router.put(
    "/jobs/:id",
    asyncHandler(jobController.editJob.bind(jobController))
  );

  return router;
};
