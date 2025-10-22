import path from "node:path";
import { Router } from "express";
import multer from "multer";
import type { ApplicationController } from "../controllers/ApplicationController.js";
import { requireAdmin, requireAuth } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../middleware/errorHandler.js";

// Configure multer for CV file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    // Store uploaded CVs in the 'uploads/cvs' directory
    cb(null, "uploads/cvs");
  },
  filename: (_req, file, cb) => {
    // Generate unique filename with timestamp and original extension
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `cv-${uniqueSuffix}${ext}`);
  },
});

// File filter to allow only PDF, DOC, and DOCX files
const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only PDF, DOC, and DOCX files are allowed.")
    );
  }
};

// Configure multer middleware
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});

/**
 * Create application routes
 * @param applicationController - Application controller instance
 */
export const createApplicationRoutes = (
  applicationController: ApplicationController
) => {
  const router = Router();

  /**
   * POST /applications - Apply to a job with CV upload
   * Requires authentication
   * Expects multipart/form-data:
   * - jobId: number (form field)
   * - cv: file (PDF, DOC, DOCX - max 5MB)
   */
  router.post(
    "/applications",
    requireAuth, // Authenticate user and attach req.user
    upload.single("cv"), // Handle file upload (field name: "cv")
    asyncHandler(applicationController.applyToJob.bind(applicationController))
  );

  /**
   * GET /applications/me - Get current user's applications
   * Requires authentication
   */
  router.get(
    "/applications/me",
    requireAuth,
    asyncHandler(
      applicationController.getMyApplications.bind(applicationController)
    )
  );

  /**
   * GET /applications/job/:jobId - Get all applications for a specific job
   * Requires admin privileges
   */
  router.get(
    "/applications/job/:jobId",
    requireAuth,
    requireAdmin,
    asyncHandler(
      applicationController.getJobApplications.bind(applicationController)
    )
  );

  /**
   * GET /applications/:id - Get a specific application by ID
   * Requires authentication
   * Users can only view their own applications, admins can view all
   */
  router.get(
    "/applications/:id",
    requireAuth,
    asyncHandler(
      applicationController.getApplicationById.bind(applicationController)
    )
  );

  return router;
};
