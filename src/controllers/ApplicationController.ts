import type { Request, Response } from "express";
import { BusinessError, NotFoundError } from "../middleware/errorHandler.js";
import type { ApplicationService } from "../services/ApplicationService.js";

/**
 * Controller for handling application-related HTTP requests
 * Uses req.user from auth middleware for user identification
 */
export class ApplicationController {
  private applicationService: ApplicationService;

  constructor(applicationService: ApplicationService) {
    this.applicationService = applicationService;
  }

  /**
   * POST /applications - Apply to a job with CV upload
   * Requires authentication (uses req.user from auth middleware)
   * Expects multipart/form-data with:
   * - jobId: number (form field)
   * - cv: file (PDF, DOC, DOCX - max 5MB)
   */
  async applyToJob(req: Request, res: Response): Promise<void> {
    // Validate user is authenticated (should be guaranteed by middleware)
    if (!req.user) {
      throw new BusinessError("Authentication required", 401);
    }

    // Validate file was uploaded
    if (!req.file) {
      throw new BusinessError("CV file is required", 400);
    }

    // Validate jobId
    const jobId = Number.parseInt(req.body.jobId, 10);
    if (Number.isNaN(jobId)) {
      throw new BusinessError("Valid job ID is required", 400);
    }

    try {
      // Create application with user ID from auth middleware
      const application = await this.applicationService.applyToJob(
        req.user.id,
        jobId,
        req.file.path
      );

      res.status(201).json({
        success: true,
        message: "Application submitted successfully",
        data: {
          id: application.id,
          jobRoleID: application.jobRoleID,
          applicantID: application.applicantID,
          cvPath: application.cvPath,
          applicationStatus: application.applicationStatus,
          appliedAt: application.appliedAt,
        },
      });
    } catch (error) {
      throw new BusinessError(
        error instanceof Error ? error.message : "Failed to submit application",
        400
      );
    }
  }

  /**
   * GET /applications/me - Get current user's applications
   * Requires authentication
   */
  async getMyApplications(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new BusinessError("Authentication required", 401);
    }

    const applications = await this.applicationService.getUserApplications(
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: "Applications retrieved successfully",
      data: applications,
      count: applications.length,
    });
  }

  /**
   * GET /applications/job/:jobId - Get all applications for a job
   * Requires admin authentication
   */
  async getJobApplications(req: Request, res: Response): Promise<void> {
    const jobIdParam = req.params.jobId;
    if (!jobIdParam) {
      throw new BusinessError("Job ID is required", 400);
    }

    const jobId = Number.parseInt(jobIdParam, 10);
    if (Number.isNaN(jobId)) {
      throw new BusinessError("Valid job ID is required", 400);
    }

    try {
      const applications =
        await this.applicationService.getJobApplications(jobId);

      res.status(200).json({
        success: true,
        message: "Job applications retrieved successfully",
        data: applications,
        count: applications.length,
      });
    } catch (error) {
      throw new BusinessError(
        error instanceof Error
          ? error.message
          : "Failed to retrieve job applications",
        500
      );
    }
  }

  /**
   * GET /applications/:id - Get a specific application by ID
   * Requires authentication (users can only see their own, admins can see all)
   */
  async getApplicationById(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new BusinessError("Authentication required", 401);
    }

    const applicationIdParam = req.params.id;
    if (!applicationIdParam) {
      throw new BusinessError("Application ID is required", 400);
    }

    const applicationId = Number.parseInt(applicationIdParam, 10);
    if (Number.isNaN(applicationId)) {
      throw new BusinessError("Valid application ID is required", 400);
    }

    const application =
      await this.applicationService.getApplicationById(applicationId);

    if (!application) {
      throw new NotFoundError("Application not found");
    }

    // Check if user owns this application or is admin
    if (application.applicantID !== req.user.id && !req.user.isAdmin) {
      throw new BusinessError(
        "You do not have permission to view this application",
        403
      );
    }

    res.status(200).json({
      success: true,
      message: "Application retrieved successfully",
      data: application,
    });
  }

  /**
   * GET /applications/:id/details - Get a specific application with full details
   * Requires authentication (users can only see their own, admins can see all)
   */
  async getApplicationDetails(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new BusinessError("Authentication required", 401);
    }

    const applicationIdParam = req.params.id;
    if (!applicationIdParam) {
      throw new BusinessError("Application ID is required", 400);
    }

    const applicationId = Number.parseInt(applicationIdParam, 10);
    if (Number.isNaN(applicationId)) {
      throw new BusinessError("Valid application ID is required", 400);
    }

    const application =
      await this.applicationService.getApplicationWithDetailsById(
        applicationId
      );

    if (!application) {
      throw new NotFoundError("Application not found");
    }

    // Check if user owns this application or is admin
    if (application.applicantID !== req.user.id && !req.user.isAdmin) {
      throw new BusinessError(
        "You do not have permission to view this application",
        403
      );
    }

    res.status(200).json({
      success: true,
      message: "Application details retrieved successfully",
      data: application,
    });
  }

  /**
   * GET /applications - Get all applications with details (admin only)
   * Requires admin authentication
   */
  async getAllApplications(_req: Request, res: Response): Promise<void> {
    try {
      const applications =
        await this.applicationService.getAllApplicationsWithDetails();

      res.status(200).json({
        success: true,
        message: "All applications retrieved successfully",
        data: applications,
        count: applications.length,
      });
    } catch (error) {
      throw new BusinessError(
        error instanceof Error
          ? error.message
          : "Failed to retrieve applications",
        500
      );
    }
  }

  /**
   * PATCH /applications/:id/status - Update application status (admin only)
   * Requires admin authentication
   */
  async updateApplicationStatus(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new BusinessError("Authentication required", 401);
    }

    const applicationIdParam = req.params.id;
    if (!applicationIdParam) {
      throw new BusinessError("Application ID is required", 400);
    }

    const applicationId = Number.parseInt(applicationIdParam, 10);
    if (Number.isNaN(applicationId)) {
      throw new BusinessError("Valid application ID is required", 400);
    }

    const { status } = req.body;
    if (!status || !["pending", "approved", "rejected"].includes(status)) {
      throw new BusinessError(
        "Valid status is required (pending, approved, rejected)",
        400
      );
    }

    try {
      const updatedApplication =
        await this.applicationService.updateApplicationStatus(
          applicationId,
          status
        );

      if (!updatedApplication) {
        throw new NotFoundError("Application not found");
      }

      res.status(200).json({
        success: true,
        message: `Application ${status === "approved" ? "accepted" : status === "rejected" ? "rejected" : "updated"} successfully`,
        data: updatedApplication,
      });
    } catch (error) {
      throw new BusinessError(
        error instanceof Error ? error.message : "Failed to update application",
        error instanceof Error && error.message.includes("not found")
          ? 404
          : 500
      );
    }
  }
}
