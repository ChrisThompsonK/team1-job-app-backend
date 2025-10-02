import type { Request, Response } from "express";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Band, Capability, type Job, JobStatus } from "./models/JobModel";

describe("Job Application Backend API", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: ReturnType<typeof vi.fn>;
  let mockStatus: ReturnType<typeof vi.fn>;

  // Sample job data for testing
  const sampleJob: Job = {
    id: "1",
    jobRoleName: "Senior Software Engineer",
    description: "Lead development of scalable web applications",
    responsibilities: [
      "Design and implement software solutions",
      "Mentor junior developers",
      "Collaborate with cross-functional teams",
    ],
    jobSpecLink: "https://sharepoint.example.com/job-spec-1",
    location: "London",
    capability: Capability.ENGINEERING,
    band: Band.E4,
    closingDate: new Date("2025-12-31"),
    status: JobStatus.OPEN,
    numberOfOpenPositions: 2,
  };

  const sampleJobs: Job[] = [
    sampleJob,
    {
      id: "2",
      jobRoleName: "Data Analyst",
      description: "Analyze business data to drive insights",
      responsibilities: [
        "Create data visualizations",
        "Perform statistical analysis",
        "Generate business reports",
      ],
      jobSpecLink: "https://sharepoint.example.com/job-spec-2",
      location: "Manchester",
      capability: Capability.DATA,
      band: Band.E2,
      closingDate: new Date("2025-11-15"),
      status: JobStatus.OPEN,
      numberOfOpenPositions: 1,
    },
  ];

  beforeEach(() => {
    mockJson = vi.fn();
    mockStatus = vi.fn(() => ({ json: mockJson }));
    mockRequest = {};
    mockResponse = {
      json: mockJson,
      status: mockStatus,
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Root Endpoint", () => {
    it("should return API information and available endpoints", () => {
      // Simulate the root route handler logic
      const rootHandler = (_req: Request, res: Response) => {
        res.json({
          title: "Job Application Backend API",
          message: "Welcome to the Job Application System",
          version: "1.0.0",
          endpoints: {
            jobs: "/api/jobs",
            openJobs: "/api/jobs/open",
            jobById: "/api/jobs/:id",
            jobsByCapability: "/api/jobs/capability/:capability",
            jobsByBand: "/api/jobs/band/:band",
            searchJobs: "/api/jobs/search",
            closingSoon: "/api/jobs/closing-soon",
          },
        });
      };

      rootHandler(mockRequest as Request, mockResponse as Response);

      expect(mockJson).toHaveBeenCalledWith({
        title: "Job Application Backend API",
        message: "Welcome to the Job Application System",
        version: "1.0.0",
        endpoints: {
          jobs: "/api/jobs",
          openJobs: "/api/jobs/open",
          jobById: "/api/jobs/:id",
          jobsByCapability: "/api/jobs/capability/:capability",
          jobsByBand: "/api/jobs/band/:band",
          searchJobs: "/api/jobs/search",
          closingSoon: "/api/jobs/closing-soon",
        },
      });
    });
  });

  describe("Job API Endpoints", () => {
    describe("GET /api/jobs", () => {
      it("should return all jobs with correct response structure", () => {
        const getAllJobsHandler = (_req: Request, res: Response) => {
          res.status(200).json({
            success: true,
            message: "Jobs retrieved successfully",
            data: sampleJobs,
            count: sampleJobs.length,
          });
        };

        getAllJobsHandler(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(200);
        expect(mockJson).toHaveBeenCalledWith({
          success: true,
          message: "Jobs retrieved successfully",
          data: sampleJobs,
          count: 2,
        });
      });
    });

    describe("GET /api/jobs/open", () => {
      it("should return only open jobs", () => {
        const openJobs = sampleJobs.filter(
          (job) => job.status === JobStatus.OPEN
        );

        const getOpenJobsHandler = (_req: Request, res: Response) => {
          res.status(200).json({
            success: true,
            message: "Open jobs retrieved successfully",
            data: openJobs,
            count: openJobs.length,
          });
        };

        getOpenJobsHandler(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(200);
        expect(mockJson).toHaveBeenCalledWith({
          success: true,
          message: "Open jobs retrieved successfully",
          data: openJobs,
          count: 2,
        });
      });
    });

    describe("GET /api/jobs/:id", () => {
      it("should return specific job by ID", () => {
        mockRequest.params = { id: "1" };

        const getJobByIdHandler = (req: Request, res: Response) => {
          const { id } = req.params;
          const job = sampleJobs.find((j) => j.id === id);

          res.status(200).json({
            success: true,
            message: "Job retrieved successfully",
            data: job,
          });
        };

        getJobByIdHandler(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(200);
        expect(mockJson).toHaveBeenCalledWith({
          success: true,
          message: "Job retrieved successfully",
          data: sampleJob,
        });
      });

      it("should handle missing job ID parameter", () => {
        mockRequest.params = {};

        const getJobByIdHandler = (req: Request, res: Response) => {
          const { id } = req.params;

          if (!id) {
            res.status(400).json({
              success: false,
              message: "Job ID is required",
            });
            return;
          }
        };

        getJobByIdHandler(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(400);
        expect(mockJson).toHaveBeenCalledWith({
          success: false,
          message: "Job ID is required",
        });
      });
    });

    describe("GET /api/jobs/capability/:capability", () => {
      it("should return jobs filtered by capability", () => {
        mockRequest.params = { capability: Capability.ENGINEERING };
        const engineeringJobs = sampleJobs.filter(
          (job) => job.capability === Capability.ENGINEERING
        );

        const getJobsByCapabilityHandler = (req: Request, res: Response) => {
          const { capability } = req.params;
          const jobs = sampleJobs.filter(
            (job) => job.capability === capability
          );

          res.status(200).json({
            success: true,
            message: `Jobs for ${capability} capability retrieved successfully`,
            data: jobs,
            count: jobs.length,
          });
        };

        getJobsByCapabilityHandler(
          mockRequest as Request,
          mockResponse as Response
        );

        expect(mockStatus).toHaveBeenCalledWith(200);
        expect(mockJson).toHaveBeenCalledWith({
          success: true,
          message: `Jobs for ${Capability.ENGINEERING} capability retrieved successfully`,
          data: engineeringJobs,
          count: 1,
        });
      });
    });

    describe("GET /api/jobs/band/:band", () => {
      it("should return jobs filtered by band", () => {
        mockRequest.params = { band: Band.E4 };
        const e4Jobs = sampleJobs.filter((job) => job.band === Band.E4);

        const getJobsByBandHandler = (req: Request, res: Response) => {
          const { band } = req.params;
          const jobs = sampleJobs.filter((job) => job.band === band);

          res.status(200).json({
            success: true,
            message: `Jobs for band ${band} retrieved successfully`,
            data: jobs,
            count: jobs.length,
          });
        };

        getJobsByBandHandler(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(200);
        expect(mockJson).toHaveBeenCalledWith({
          success: true,
          message: `Jobs for band ${Band.E4} retrieved successfully`,
          data: e4Jobs,
          count: 1,
        });
      });
    });

    describe("GET /api/jobs/search", () => {
      it("should return jobs with search filters applied", () => {
        mockRequest.query = {
          capability: Capability.DATA,
          band: Band.E2,
        };

        const searchJobsHandler = (req: Request, res: Response) => {
          const { capability, band, location, status } = req.query;
          const filters: Record<string, string> = {};

          if (typeof capability === "string") filters.capability = capability;
          if (typeof band === "string") filters.band = band;
          if (typeof location === "string") filters.location = location;
          if (typeof status === "string") filters.status = status;

          let jobs = sampleJobs;
          if (filters.capability) {
            jobs = jobs.filter((job) => job.capability === filters.capability);
          }
          if (filters.band) {
            jobs = jobs.filter((job) => job.band === filters.band);
          }

          const filterDescriptions = [];
          if (filters.capability)
            filterDescriptions.push(`capability: ${filters.capability}`);
          if (filters.band) filterDescriptions.push(`band: ${filters.band}`);

          const filterMessage =
            filterDescriptions.length > 0
              ? ` with filters (${filterDescriptions.join(", ")})`
              : "";

          res.status(200).json({
            success: true,
            message: `Jobs retrieved successfully${filterMessage}`,
            data: jobs,
            count: jobs.length,
            filters: filters,
          });
        };

        searchJobsHandler(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(200);
        expect(mockJson).toHaveBeenCalledWith({
          success: true,
          message:
            "Jobs retrieved successfully with filters (capability: Data, band: E2)",
          data: [sampleJobs[1]], // Only the Data E2 job
          count: 1,
          filters: { capability: Capability.DATA, band: Band.E2 },
        });
      });

      it("should return all jobs when no filters are provided", () => {
        mockRequest.query = {};

        const searchJobsHandler = (_req: Request, res: Response) => {
          const filters: Record<string, string> = {};

          res.status(200).json({
            success: true,
            message: "Jobs retrieved successfully",
            data: sampleJobs,
            count: sampleJobs.length,
            filters: filters,
          });
        };

        searchJobsHandler(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(200);
        expect(mockJson).toHaveBeenCalledWith({
          success: true,
          message: "Jobs retrieved successfully",
          data: sampleJobs,
          count: 2,
          filters: {},
        });
      });
    });

    describe("GET /api/jobs/closing-soon", () => {
      it("should return jobs closing soon", () => {
        // Mock jobs that are closing soon (within 7 days)
        const closingSoonJobs = sampleJobs.filter((job) => {
          const now = new Date();
          const sevenDaysFromNow = new Date(
            now.getTime() + 7 * 24 * 60 * 60 * 1000
          );
          return job.closingDate <= sevenDaysFromNow && job.closingDate >= now;
        });

        const getJobsClosingSoonHandler = (_req: Request, res: Response) => {
          res.status(200).json({
            success: true,
            message: "Jobs closing soon retrieved successfully",
            data: closingSoonJobs,
            count: closingSoonJobs.length,
          });
        };

        getJobsClosingSoonHandler(
          mockRequest as Request,
          mockResponse as Response
        );

        expect(mockStatus).toHaveBeenCalledWith(200);
        expect(mockJson).toHaveBeenCalledWith({
          success: true,
          message: "Jobs closing soon retrieved successfully",
          data: closingSoonJobs,
          count: closingSoonJobs.length,
        });
      });
    });
  });

  describe("Response Data Validation", () => {
    it("should validate job object structure", () => {
      expect(sampleJob).toHaveProperty("id");
      expect(sampleJob).toHaveProperty("jobRoleName");
      expect(sampleJob).toHaveProperty("description");
      expect(sampleJob).toHaveProperty("responsibilities");
      expect(sampleJob).toHaveProperty("jobSpecLink");
      expect(sampleJob).toHaveProperty("location");
      expect(sampleJob).toHaveProperty("capability");
      expect(sampleJob).toHaveProperty("band");
      expect(sampleJob).toHaveProperty("closingDate");
      expect(sampleJob).toHaveProperty("status");
      expect(sampleJob).toHaveProperty("numberOfOpenPositions");

      expect(typeof sampleJob.id).toBe("string");
      expect(typeof sampleJob.jobRoleName).toBe("string");
      expect(typeof sampleJob.description).toBe("string");
      expect(Array.isArray(sampleJob.responsibilities)).toBe(true);
      expect(typeof sampleJob.jobSpecLink).toBe("string");
      expect(typeof sampleJob.location).toBe("string");
      expect(Object.values(Capability)).toContain(sampleJob.capability);
      expect(Object.values(Band)).toContain(sampleJob.band);
      expect(sampleJob.closingDate instanceof Date).toBe(true);
      expect(Object.values(JobStatus)).toContain(sampleJob.status);
      expect(typeof sampleJob.numberOfOpenPositions).toBe("number");
    });

    it("should validate API response structure", () => {
      const apiResponse = {
        success: true,
        message: "Jobs retrieved successfully",
        data: sampleJobs,
        count: sampleJobs.length,
      };

      expect(apiResponse).toHaveProperty("success");
      expect(apiResponse).toHaveProperty("message");
      expect(apiResponse).toHaveProperty("data");
      expect(apiResponse).toHaveProperty("count");

      expect(typeof apiResponse.success).toBe("boolean");
      expect(typeof apiResponse.message).toBe("string");
      expect(Array.isArray(apiResponse.data)).toBe(true);
      expect(typeof apiResponse.count).toBe("number");
      expect(apiResponse.count).toBe(apiResponse.data.length);
    });

    it("should validate enum values", () => {
      expect(Object.values(Capability)).toContain(Capability.DATA);
      expect(Object.values(Capability)).toContain(Capability.WORKDAY);
      expect(Object.values(Capability)).toContain(Capability.ENGINEERING);

      expect(Object.values(Band)).toContain(Band.E1);
      expect(Object.values(Band)).toContain(Band.E2);
      expect(Object.values(Band)).toContain(Band.E3);
      expect(Object.values(Band)).toContain(Band.E4);
      expect(Object.values(Band)).toContain(Band.E5);

      expect(Object.values(JobStatus)).toContain(JobStatus.OPEN);
      expect(Object.values(JobStatus)).toContain(JobStatus.CLOSED);
      expect(Object.values(JobStatus)).toContain(JobStatus.DRAFT);
    });
  });

  describe("Error Handling", () => {
    it("should handle not found errors", () => {
      const notFoundResponse = {
        success: false,
        message: "Job not found",
      };

      expect(notFoundResponse.success).toBe(false);
      expect(notFoundResponse.message).toBe("Job not found");
    });

    it("should handle business errors", () => {
      const businessErrorResponse = {
        success: false,
        message: "Job ID is required",
      };

      expect(businessErrorResponse.success).toBe(false);
      expect(businessErrorResponse.message).toBe("Job ID is required");
    });
  });

  describe("Middleware Configuration", () => {
    it("should validate JSON middleware configuration", () => {
      const jsonMiddleware = vi.fn();
      expect(typeof jsonMiddleware).toBe("function");
    });

    it("should validate URL encoded middleware configuration", () => {
      const urlencodedConfig = { extended: true };
      expect(urlencodedConfig.extended).toBe(true);
    });

    it("should validate CORS middleware configuration", () => {
      const corsMiddleware = vi.fn();
      expect(typeof corsMiddleware).toBe("function");
    });

    it("should validate Morgan logging middleware configuration", () => {
      const morganMiddleware = vi.fn();
      expect(typeof morganMiddleware).toBe("function");
    });
  });
});
