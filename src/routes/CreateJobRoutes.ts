import { Router } from "express";
import type { JobController } from "../controllers/JobController.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { 
  requireAuth, 
  requireAdmin, 
  optionalAuth 
} from "../middleware/authMiddleware.js";

export const createJobRoutes = (jobController: JobController) => {
  const router = Router();

  // Public job routes - no authentication required
  // Note: /jobs/search MUST come before /jobs/:id to avoid "search" being treated as an ID
  router.get(
    "/jobs",
    optionalAuth, // Optional auth to potentially show user-specific data
    asyncHandler(jobController.getAllJobs.bind(jobController))
  );
  router.get(
    "/jobs/search",
    optionalAuth, // Optional auth for search
    asyncHandler(jobController.getFilteredJobs.bind(jobController))
  );
  router.get(
    "/jobs/:id",
    optionalAuth, // Optional auth for job details
    asyncHandler(jobController.getJobById.bind(jobController))
  );

  // Protected job routes - require authentication and admin privileges
  router.post(
    "/jobs",
    requireAuth, // Require authentication to create jobs
    requireAdmin, // Require admin privileges to create jobs
    asyncHandler(jobController.createJob.bind(jobController))
  );
  router.put(
    "/jobs/:id",
    requireAuth, // Require authentication to edit jobs
    requireAdmin, // Require admin privileges to edit jobs
    asyncHandler(jobController.editJob.bind(jobController))
  );
  
  // Admin-only routes
  router.delete(
    "/jobs/:id",
    requireAuth, // First require authentication
    requireAdmin, // Then require admin privileges
    asyncHandler(jobController.deleteJob.bind(jobController))
  );

  return router;
};
