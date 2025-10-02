import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { JobRepository } from "../repositories/JobRepository";
import { JobService } from "../services/JobService";
import { JobController } from "./JobController";

describe("JobController", () => {
  let jobController: JobController;
  let jobService: JobService;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: ReturnType<typeof vi.fn>;
  let mockStatus: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    const jobRepository = new JobRepository();
    jobService = new JobService(jobRepository);
    jobController = new JobController(jobService);

    mockJson = vi.fn();
    mockStatus = vi.fn(() => ({ json: mockJson }));
    mockRequest = {};
    mockResponse = {
      json: mockJson,
      status: mockStatus,
    };
  });

  describe("deleteJob", () => {
    it("should delete an existing job successfully", async () => {
      mockRequest.params = { id: "1" };

      await jobController.deleteJob(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        message: "Job with id 1 deleted successfully",
        deletedJobId: "1",
      });
    });

    it("should return 404 when trying to delete non-existent job", async () => {
      mockRequest.params = { id: "999" };

      await jobController.deleteJob(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        error: "Job with id 999 not found",
      });
    });

    it("should return 400 when job ID is missing", async () => {
      mockRequest.params = {};

      await jobController.deleteJob(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: "Job ID is required",
      });
    });
  });

  describe("getAllJobs", () => {
    it("should return all jobs successfully", async () => {
      await jobController.getAllJobs(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            title: expect.any(String),
            company: expect.any(String),
            description: expect.any(String),
          }),
        ])
      );
    });
  });

  describe("getJobById", () => {
    it("should return a job when it exists", async () => {
      mockRequest.params = { id: "2" };

      await jobController.getJobById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "2",
          title: "Product Manager",
          company: "StartupXYZ",
        })
      );
    });

    it("should return 404 when job does not exist", async () => {
      mockRequest.params = { id: "999" };

      await jobController.getJobById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        error: "Job not found",
      });
    });
  });
});
