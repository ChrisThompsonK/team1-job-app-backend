import { Router } from "express";
import type { JobController } from "../controllers/JobController.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const createJobRoutes = (jobController: JobController) => {
  const router = Router();

  // Job routes - all wrapped with asyncHandler for error handling
  router.get(
    "/jobs",
    asyncHandler(jobController.getAllJobs.bind(jobController))
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
  router.get(
    "/jobs/search",
    asyncHandler(jobController.getFilteredJobs.bind(jobController))
  );

  return router;
};
