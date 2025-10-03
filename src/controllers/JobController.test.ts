import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { JobController } from "../controllers/JobController";
import { BusinessError } from "../middleware/errorHandler";
import { Band, Capability, JobStatus } from "../models/JobModel";
import type { JobService } from "../services/JobService";
import type { JobValidator } from "../validators/JobValidator";

// Mock dependencies with proper types
const mockJobService = {
  getAllJobs: vi.fn(),
  getJobById: vi.fn(),
  createJobRole: vi.fn(),
  editJobRole: vi.fn(),
  getFilteredJobs: vi.fn(),
} as const;

const mockJobValidator = {
  validateBand: vi.fn(),
  validateCapability: vi.fn(),
  validateBandAndCapability: vi.fn(),
  createValidatedJob: vi.fn(),
} as const;

describe("JobController", () => {
  let jobController: JobController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: ReturnType<typeof vi.fn>;
  let mockStatus: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Create fresh controller instance
    jobController = new JobController(
      mockJobService as unknown as JobService,
      mockJobValidator as unknown as JobValidator
    );

    // Setup response mocks
    mockJson = vi.fn();
    mockStatus = vi.fn().mockReturnValue({ json: mockJson });

    mockResponse = {
      status: mockStatus,
      json: mockJson,
    };
  });

  describe("createJob", () => {
    const validJobData = {
      jobRoleName: "Senior Software Engineer",
      description: "Lead development of scalable web applications",
      responsibilities: [
        "Design and implement software solutions",
        "Mentor junior developers",
      ],
      jobSpecLink: "https://sharepoint.example.com/job-spec-1",
      location: "London",
      capability: "Engineering",
      band: "E4",
      closingDate: "2025-12-31",
      numberOfOpenPositions: 2,
    };

    const validatedJob = {
      jobRoleName: "Senior Software Engineer",
      description: "Lead development of scalable web applications",
      responsibilities: [
        "Design and implement software solutions",
        "Mentor junior developers",
      ],
      jobSpecLink: "https://sharepoint.example.com/job-spec-1",
      location: "London",
      capability: Capability.ENGINEERING,
      band: Band.E4,
      closingDate: new Date("2025-12-31"),
      numberOfOpenPositions: 2,
    };

    beforeEach(() => {
      mockRequest = {
        body: validJobData,
      };
    });

    it("should create job successfully with valid data", async () => {
      mockJobValidator.createValidatedJob.mockReturnValue(validatedJob);
      mockJobService.createJobRole.mockResolvedValue(undefined);

      await jobController.createJob(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockJobValidator.createValidatedJob).toHaveBeenCalledWith(
        validJobData
      );
      expect(mockJobService.createJobRole).toHaveBeenCalledWith(validatedJob);
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: "Job Senior Software Engineer created successfully",
      });
    });

    it("should throw BusinessError when validation fails", async () => {
      const validationError = new Error(
        "Job role name is required and must be a string"
      );
      mockJobValidator.createValidatedJob.mockImplementation(() => {
        throw validationError;
      });

      await expect(
        jobController.createJob(
          mockRequest as Request,
          mockResponse as Response
        )
      ).rejects.toThrow(BusinessError);

      expect(mockJobValidator.createValidatedJob).toHaveBeenCalledWith(
        validJobData
      );
      expect(mockJobService.createJobRole).not.toHaveBeenCalled();
    });

    it("should throw BusinessError when service fails", async () => {
      mockJobValidator.createValidatedJob.mockReturnValue(validatedJob);
      mockJobService.createJobRole.mockRejectedValue(
        new Error("Database error")
      );

      await expect(
        jobController.createJob(
          mockRequest as Request,
          mockResponse as Response
        )
      ).rejects.toThrow();

      expect(mockJobValidator.createValidatedJob).toHaveBeenCalledWith(
        validJobData
      );
      expect(mockJobService.createJobRole).toHaveBeenCalledWith(validatedJob);
    });

    it("should handle generic validation errors", async () => {
      mockJobValidator.createValidatedJob.mockImplementation(() => {
        throw new Error("Some validation error");
      });

      await expect(
        jobController.createJob(
          mockRequest as Request,
          mockResponse as Response
        )
      ).rejects.toThrow(new BusinessError("Some validation error", 400));
    });

    it("should handle non-Error validation failures", async () => {
      mockJobValidator.createValidatedJob.mockImplementation(() => {
        throw "String error";
      });

      await expect(
        jobController.createJob(
          mockRequest as Request,
          mockResponse as Response
        )
      ).rejects.toThrow(new BusinessError("Invalid job data", 400));
    });
  });

  describe("editJob", () => {
    const jobId = "test-job-id";
    const validJobData = {
      jobRoleName: "Updated Senior Software Engineer",
      description: "Updated lead development of scalable web applications",
      responsibilities: [
        "Updated design and implement software solutions",
        "Updated mentor junior developers",
      ],
      jobSpecLink: "https://sharepoint.example.com/updated-job-spec-1",
      location: "Updated London",
      capability: "Engineering",
      band: "E5",
      closingDate: "2025-12-31",
      numberOfOpenPositions: 3,
      status: "open",
    };

    const validatedJob = {
      id: jobId,
      jobRoleName: "Updated Senior Software Engineer",
      description: "Updated lead development of scalable web applications",
      responsibilities: [
        "Updated design and implement software solutions",
        "Updated mentor junior developers",
      ],
      jobSpecLink: "https://sharepoint.example.com/updated-job-spec-1",
      location: "Updated London",
      capability: Capability.ENGINEERING,
      band: Band.E5,
      closingDate: new Date("2025-12-31"),
      numberOfOpenPositions: 3,
      status: JobStatus.OPEN,
    };

    beforeEach(() => {
      mockRequest = {
        params: { id: jobId },
        body: validJobData,
      };
    });

    it("should edit job successfully with valid data", async () => {
      mockJobValidator.createValidatedJob.mockReturnValue(validatedJob);
      mockJobService.editJobRole.mockResolvedValue(undefined);

      await jobController.editJob(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockJobValidator.createValidatedJob).toHaveBeenCalledWith(
        validJobData,
        jobId
      );
      expect(mockJobService.editJobRole).toHaveBeenCalledWith(validatedJob);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: "Job Updated Senior Software Engineer edited successfully",
      });
    });

    it("should throw BusinessError when job ID is missing", async () => {
      mockRequest.params = {};

      await expect(
        jobController.editJob(mockRequest as Request, mockResponse as Response)
      ).rejects.toThrow(new BusinessError("Job ID is required", 400));

      expect(mockJobValidator.createValidatedJob).not.toHaveBeenCalled();
      expect(mockJobService.editJobRole).not.toHaveBeenCalled();
    });

    it("should throw BusinessError when job ID is empty", async () => {
      mockRequest.params = { id: "" };

      await expect(
        jobController.editJob(mockRequest as Request, mockResponse as Response)
      ).rejects.toThrow(new BusinessError("Job ID is required", 400));

      expect(mockJobValidator.createValidatedJob).not.toHaveBeenCalled();
      expect(mockJobService.editJobRole).not.toHaveBeenCalled();
    });

    it("should throw BusinessError when validation fails", async () => {
      const validationError = new Error(
        "Invalid status. Must be one of: open, closed, draft"
      );
      mockJobValidator.createValidatedJob.mockImplementation(() => {
        throw validationError;
      });

      await expect(
        jobController.editJob(mockRequest as Request, mockResponse as Response)
      ).rejects.toThrow(BusinessError);

      expect(mockJobValidator.createValidatedJob).toHaveBeenCalledWith(
        validJobData,
        jobId
      );
      expect(mockJobService.editJobRole).not.toHaveBeenCalled();
    });

    it("should throw BusinessError when service fails", async () => {
      mockJobValidator.createValidatedJob.mockReturnValue(validatedJob);
      mockJobService.editJobRole.mockRejectedValue(new Error("Database error"));

      await expect(
        jobController.editJob(mockRequest as Request, mockResponse as Response)
      ).rejects.toThrow();

      expect(mockJobValidator.createValidatedJob).toHaveBeenCalledWith(
        validJobData,
        jobId
      );
      expect(mockJobService.editJobRole).toHaveBeenCalledWith(validatedJob);
    });

    it("should handle generic validation errors", async () => {
      mockJobValidator.createValidatedJob.mockImplementation(() => {
        throw new Error("Some validation error");
      });

      await expect(
        jobController.editJob(mockRequest as Request, mockResponse as Response)
      ).rejects.toThrow(new BusinessError("Some validation error", 400));
    });

    it("should handle non-Error validation failures", async () => {
      mockJobValidator.createValidatedJob.mockImplementation(() => {
        throw "String error";
      });

      await expect(
        jobController.editJob(mockRequest as Request, mockResponse as Response)
      ).rejects.toThrow(new BusinessError("Invalid job data", 400));
    });
  });

  describe("getFilteredJobs", () => {
    beforeEach(() => {
      mockRequest = {
        query: {},
      };
    });

    it("should return filtered jobs successfully", async () => {
      const queryParams = {
        capability: "DATA",
        band: "E3",
        page: "1",
        limit: "10",
      };

      const mockResult = {
        jobs: [
          {
            id: "1",
            jobRoleName: "Senior Data Engineer",
            capability: Capability.DATA,
            band: Band.E3,
          },
        ],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 1,
          itemsPerPage: 10,
          hasNextPage: false,
          hasPreviousPage: false,
        },
        filters: {
          capability: Capability.DATA,
          band: Band.E3,
          page: 1,
          limit: 10,
        },
      };

      mockRequest.query = queryParams;
      mockJobService.getFilteredJobs.mockResolvedValue(mockResult);

      await jobController.getFilteredJobs(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockJobService.getFilteredJobs).toHaveBeenCalledWith({
        capability: Capability.DATA,
        band: Band.E3,
        page: 1,
        limit: 10,
        sortOrder: "asc",
      });

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: "Filtered jobs retrieved successfully",
        data: mockResult.jobs,
        pagination: mockResult.pagination,
        filters: mockResult.filters,
        filtersDescription: expect.stringContaining("capability: Data"),
      });
    });

    it("should handle empty query parameters", async () => {
      const mockResult = {
        jobs: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: 10,
          hasNextPage: false,
          hasPreviousPage: false,
        },
        filters: {
          page: 1,
          limit: 10,
          sortOrder: "asc",
        },
      };

      mockJobService.getFilteredJobs.mockResolvedValue(mockResult);

      await jobController.getFilteredJobs(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockJobService.getFilteredJobs).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        sortOrder: "asc",
      });

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: "Filtered jobs retrieved successfully",
        data: [],
        pagination: mockResult.pagination,
        filters: mockResult.filters,
        filtersDescription: "No filters applied",
      });
    });

    it("should handle complex filtering parameters", async () => {
      const queryParams = {
        capability: "ENGINEERING",
        location: "London",
        search: "senior engineer",
        closingDateFrom: "2024-10-01",
        closingDateTo: "2024-12-31",
        minPositions: "2",
        sortBy: "closingDate",
        sortOrder: "desc",
        page: "2",
        limit: "5",
      };

      const mockResult = {
        jobs: [],
        pagination: {
          currentPage: 2,
          totalPages: 3,
          totalItems: 15,
          itemsPerPage: 5,
          hasNextPage: true,
          hasPreviousPage: true,
        },
        filters: {
          capability: Capability.ENGINEERING,
          location: "London",
          search: "senior engineer",
          closingDateFrom: new Date("2024-10-01"),
          closingDateTo: new Date("2024-12-31"),
          minPositions: 2,
          sortBy: "closingDate",
          sortOrder: "desc",
          page: 2,
          limit: 5,
        },
      };

      mockRequest.query = queryParams;
      mockJobService.getFilteredJobs.mockResolvedValue(mockResult);

      await jobController.getFilteredJobs(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockJobService.getFilteredJobs).toHaveBeenCalledWith(
        expect.objectContaining({
          capability: Capability.ENGINEERING,
          location: "London",
          search: "senior engineer",
          minPositions: 2,
          page: 2,
          limit: 5,
        })
      );

      expect(mockStatus).toHaveBeenCalledWith(200);
    });

    it("should throw BusinessError when service throws validation error", async () => {
      mockJobService.getFilteredJobs.mockRejectedValue(
        new Error("Closing date 'from' cannot be after 'to' date")
      );

      await expect(
        jobController.getFilteredJobs(
          mockRequest as Request,
          mockResponse as Response
        )
      ).rejects.toThrow(
        new BusinessError("Closing date 'from' cannot be after 'to' date", 400)
      );
    });

    it("should throw BusinessError with generic message for unknown errors", async () => {
      mockJobService.getFilteredJobs.mockRejectedValue(
        new Error("Database connection failed")
      );

      await expect(
        jobController.getFilteredJobs(
          mockRequest as Request,
          mockResponse as Response
        )
      ).rejects.toThrow(new BusinessError("Database connection failed", 400));
    });

    it("should handle non-Error exceptions", async () => {
      mockJobService.getFilteredJobs.mockRejectedValue("String error");

      await expect(
        jobController.getFilteredJobs(
          mockRequest as Request,
          mockResponse as Response
        )
      ).rejects.toThrow(new BusinessError("Invalid filter parameters", 400));
    });
  });
});
