import { beforeEach, describe, expect, it, vi } from "vitest";
import { Band, Capability, JobStatus } from "../models/JobModel";
import type { JobRepository } from "../repositories/JobRepository";
import { JobService } from "../services/JobService";
import type { JobValidator } from "../validators/JobValidator";

// Mock dependencies
const mockJobRepository = {
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
  validateJobId: vi.fn((id: string) => {
    if (!id || typeof id !== "string" || id.trim() === "") {
      throw new Error("Valid job ID is required");
    }
    return id.trim();
  }),
} as const;

describe("JobService", () => {
  let jobService: JobService;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Create fresh service instance
    jobService = new JobService(
      mockJobRepository as unknown as JobRepository,
      mockJobValidator as unknown as JobValidator
    );
  });

  describe("getAllJobs", () => {
    it("should return all jobs from repository", async () => {
      const expectedJobs = [
        {
          id: "1",
          jobRoleName: "Senior Software Engineer",
          capability: Capability.ENGINEERING,
          band: Band.SENIOR,
        },
        {
          id: "2",
          jobRoleName: "Data Analyst",
          capability: Capability.DATA,
          band: Band.JUNIOR,
        },
      ];

      mockJobRepository.getAllJobs.mockResolvedValue(expectedJobs);

      const result = await jobService.getAllJobs();

      expect(result).toEqual(expectedJobs);
      expect(mockJobRepository.getAllJobs).toHaveBeenCalledTimes(1);
    });

    it("should handle repository errors", async () => {
      const repositoryError = new Error("Database connection failed");
      mockJobRepository.getAllJobs.mockRejectedValue(repositoryError);

      await expect(jobService.getAllJobs()).rejects.toThrow(
        "Database connection failed"
      );
      expect(mockJobRepository.getAllJobs).toHaveBeenCalledTimes(1);
    });
  });

  describe("getJobById", () => {
    it("should return job for valid ID", async () => {
      const jobId = "valid-job-id";
      const expectedJob = {
        id: jobId,
        jobRoleName: "Senior Software Engineer",
        capability: Capability.ENGINEERING,
        band: Band.SENIOR,
      };

      mockJobRepository.getJobById.mockResolvedValue(expectedJob);

      const result = await jobService.getJobById(jobId);

      expect(result).toEqual(expectedJob);
      expect(mockJobRepository.getJobById).toHaveBeenCalledWith(jobId);
    });

    it("should return null for non-existent job", async () => {
      const jobId = "non-existent-id";
      mockJobRepository.getJobById.mockResolvedValue(null);

      const result = await jobService.getJobById(jobId);

      expect(result).toBeNull();
      expect(mockJobRepository.getJobById).toHaveBeenCalledWith(jobId);
    });

    it("should throw error for invalid ID (empty string)", async () => {
      await expect(jobService.getJobById("")).rejects.toThrow(
        "Valid job ID is required"
      );
      expect(mockJobRepository.getJobById).not.toHaveBeenCalled();
    });

    it("should throw error for invalid ID (whitespace only)", async () => {
      await expect(jobService.getJobById("   ")).rejects.toThrow(
        "Valid job ID is required"
      );
      expect(mockJobRepository.getJobById).not.toHaveBeenCalled();
    });

    it("should throw error for null ID", async () => {
      await expect(
        jobService.getJobById(null as unknown as string)
      ).rejects.toThrow("Valid job ID is required");
      expect(mockJobRepository.getJobById).not.toHaveBeenCalled();
    });

    it("should throw error for undefined ID", async () => {
      await expect(
        jobService.getJobById(undefined as unknown as string)
      ).rejects.toThrow("Valid job ID is required");
      expect(mockJobRepository.getJobById).not.toHaveBeenCalled();
    });

    it("should throw error for non-string ID", async () => {
      await expect(
        jobService.getJobById(123 as unknown as string)
      ).rejects.toThrow("Valid job ID is required");
      expect(mockJobRepository.getJobById).not.toHaveBeenCalled();
    });

    it("should trim whitespace from valid ID", async () => {
      const jobId = "  valid-job-id  ";
      const trimmedId = "valid-job-id";
      const expectedJob = {
        id: trimmedId,
        jobRoleName: "Senior Software Engineer",
        capability: Capability.ENGINEERING,
        band: Band.SENIOR,
      };

      mockJobRepository.getJobById.mockResolvedValue(expectedJob);

      const result = await jobService.getJobById(jobId);

      expect(result).toEqual(expectedJob);
      expect(mockJobRepository.getJobById).toHaveBeenCalledWith(trimmedId);
    });
  });

  describe("createJobRole", () => {
    const validJob = {
      jobRoleName: "Senior Software Engineer",
      description: "Lead development of scalable web applications",
      responsibilities: [
        "Design and implement software solutions",
        "Mentor junior developers",
      ],
      jobSpecLink: "https://sharepoint.example.com/job-spec-1",
      location: "London",
      capability: Capability.ENGINEERING,
      band: Band.SENIOR,
      closingDate: new Date("2025-12-31"),
      numberOfOpenPositions: 2,
    };

    it("should create job successfully with valid data", async () => {
      mockJobValidator.validateBandAndCapability.mockImplementation(() => {});
      mockJobRepository.createJobRole.mockResolvedValue(undefined);

      await jobService.createJobRole(validJob);

      expect(mockJobValidator.validateBandAndCapability).toHaveBeenCalledWith(
        validJob
      );
      expect(mockJobRepository.createJobRole).toHaveBeenCalledWith(validJob);
    });

    it("should throw error when validation fails", async () => {
      const validationError = new Error(
        "Invalid band. Must be one of: Junior, Mid, Senior, Principal"
      );
      mockJobValidator.validateBandAndCapability.mockImplementation(() => {
        throw validationError;
      });

      await expect(jobService.createJobRole(validJob)).rejects.toThrow(
        validationError
      );

      expect(mockJobValidator.validateBandAndCapability).toHaveBeenCalledWith(
        validJob
      );
      expect(mockJobRepository.createJobRole).not.toHaveBeenCalled();
    });

    it("should throw error when repository fails", async () => {
      mockJobValidator.validateBandAndCapability.mockImplementation(() => {});
      const repositoryError = new Error("Database error");
      mockJobRepository.createJobRole.mockRejectedValue(repositoryError);

      await expect(jobService.createJobRole(validJob)).rejects.toThrow(
        repositoryError
      );

      expect(mockJobValidator.validateBandAndCapability).toHaveBeenCalledWith(
        validJob
      );
      expect(mockJobRepository.createJobRole).toHaveBeenCalledWith(validJob);
    });
  });

  describe("editJobRole", () => {
    const validJob = {
      id: "job-id-123",
      jobRoleName: "Updated Senior Software Engineer",
      description: "Updated lead development of scalable web applications",
      responsibilities: [
        "Updated design and implement software solutions",
        "Updated mentor junior developers",
      ],
      jobSpecLink: "https://sharepoint.example.com/updated-job-spec-1",
      location: "Updated London",
      capability: Capability.ENGINEERING,
      band: Band.PRINCIPAL,
      closingDate: new Date("2025-12-31"),
      numberOfOpenPositions: 3,
      status: JobStatus.OPEN,
    };

    it("should edit job successfully with valid data", async () => {
      mockJobValidator.validateBandAndCapability.mockImplementation(() => {});
      mockJobRepository.editJobRole.mockResolvedValue(undefined);

      await jobService.editJobRole(validJob);

      expect(mockJobValidator.validateBandAndCapability).toHaveBeenCalledWith(
        validJob
      );
      expect(mockJobRepository.editJobRole).toHaveBeenCalledWith(validJob);
    });

    it("should throw error when validation fails", async () => {
      const validationError = new Error(
        "Invalid capability. Must be one of: Data, Workday, Engineering"
      );
      mockJobValidator.validateBandAndCapability.mockImplementation(() => {
        throw validationError;
      });

      await expect(jobService.editJobRole(validJob)).rejects.toThrow(
        validationError
      );

      expect(mockJobValidator.validateBandAndCapability).toHaveBeenCalledWith(
        validJob
      );
      expect(mockJobRepository.editJobRole).not.toHaveBeenCalled();
    });

    it("should throw error when repository fails", async () => {
      mockJobValidator.validateBandAndCapability.mockImplementation(() => {});
      const repositoryError = new Error("Job not found");
      mockJobRepository.editJobRole.mockRejectedValue(repositoryError);

      await expect(jobService.editJobRole(validJob)).rejects.toThrow(
        repositoryError
      );

      expect(mockJobValidator.validateBandAndCapability).toHaveBeenCalledWith(
        validJob
      );
      expect(mockJobRepository.editJobRole).toHaveBeenCalledWith(validJob);
    });

    it("should handle validation errors for invalid enum values", async () => {
      const invalidJob = {
        ...validJob,
        band: "InvalidBand" as unknown as Band,
        capability: "InvalidCapability" as unknown as Capability,
      };

      const validationError = new Error(
        "Invalid band. Must be one of: Junior, Mid, Senior, Principal"
      );
      mockJobValidator.validateBandAndCapability.mockImplementation(() => {
        throw validationError;
      });

      await expect(jobService.editJobRole(invalidJob)).rejects.toThrow(
        validationError
      );

      expect(mockJobValidator.validateBandAndCapability).toHaveBeenCalledWith(
        invalidJob
      );
      expect(mockJobRepository.editJobRole).not.toHaveBeenCalled();
    });
  });

  describe("getFilteredJobs", () => {
    it("should return filtered jobs from repository", async () => {
      const filters = {
        capability: Capability.DATA,
        band: Band.MID,
        page: 1,
        limit: 10,
      };

      const expectedResponse = {
        jobs: [
          {
            id: "1",
            jobRoleName: "Senior Data Engineer",
            capability: Capability.DATA,
            band: Band.MID,
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
        filters,
      };

      mockJobRepository.getFilteredJobs.mockResolvedValue(expectedResponse);

      const result = await jobService.getFilteredJobs(filters);

      expect(result).toEqual(expectedResponse);
      expect(mockJobRepository.getFilteredJobs).toHaveBeenCalledWith(filters);
    });

    it("should validate page number and throw error if less than 1", async () => {
      const filters = {
        page: -1, // Use negative number since QueryParameterParser would set 0 to 1
      };

      await expect(jobService.getFilteredJobs(filters)).rejects.toThrow(
        "Page number must be 1 or greater"
      );

      expect(mockJobRepository.getFilteredJobs).not.toHaveBeenCalled();
    });

    it("should validate limit and throw error if outside valid range", async () => {
      const filters1 = { limit: -1 }; // Use negative numbers
      const filters2 = { limit: 200 }; // Use number over 100

      await expect(jobService.getFilteredJobs(filters1)).rejects.toThrow(
        "Limit must be between 1 and 100"
      );

      await expect(jobService.getFilteredJobs(filters2)).rejects.toThrow(
        "Limit must be between 1 and 100"
      );

      expect(mockJobRepository.getFilteredJobs).not.toHaveBeenCalled();
    });
  });
});
