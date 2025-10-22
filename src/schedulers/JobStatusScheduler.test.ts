import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { JobService } from "../services/JobService.js";
import { JobStatusScheduler } from "./JobStatusScheduler.js";

// Mock node-cron module.
vi.mock("node-cron", () => ({
  schedule: vi.fn(),
}));

// Mock the environment configuration
vi.mock("../config/env.js", () => ({
  getJobSchedulerCronExpression: vi.fn(() => "0 3 * * *"),
}));

import * as cron from "node-cron";

describe("JobStatusScheduler", () => {
  let mockJobService: JobService;
  let scheduler: JobStatusScheduler;
  let mockScheduledTask: Partial<cron.ScheduledTask>;

  beforeEach(() => {
    // Mock the JobService.
    mockJobService = {
      updateExpiredJobRoles: vi.fn(),
    } as unknown as JobService;

    // Mock the scheduled task with only the methods we need
    mockScheduledTask = {
      stop: vi.fn(),
    };

    // Mock cron.schedule to return our mock task
    vi.mocked(cron.schedule).mockReturnValue(
      mockScheduledTask as cron.ScheduledTask
    );

    scheduler = new JobStatusScheduler(mockJobService);

    // Mock console methods to avoid test output noise
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    scheduler.stop();
    vi.restoreAllMocks();
  });

  describe("updateExpiredJobs", () => {
    it("should call jobService.updateExpiredJobRoles and return result", async () => {
      // Arrange
      const expectedResult = { updatedCount: 5 };
      vi.mocked(mockJobService.updateExpiredJobRoles).mockResolvedValue(
        expectedResult
      );

      // Act
      const result = await scheduler.updateExpiredJobs();

      // Assert
      expect(mockJobService.updateExpiredJobRoles).toHaveBeenCalledOnce();
      expect(result).toEqual(expectedResult);
      expect(console.log).toHaveBeenCalledWith(
        "Running scheduled job status update..."
      );
      expect(console.log).toHaveBeenCalledWith(
        "Job status update completed: 5 jobs updated to closed status"
      );
    });

    it("should handle errors from jobService", async () => {
      // Arrange
      const error = new Error("Database connection failed");
      vi.mocked(mockJobService.updateExpiredJobRoles).mockRejectedValue(error);

      // Act & Assert
      await expect(scheduler.updateExpiredJobs()).rejects.toThrow(
        "Database connection failed"
      );
      expect(console.error).toHaveBeenCalledWith(
        "Error during scheduled job status update:",
        error
      );
    });
  });

  describe("start", () => {
    it("should start the scheduler and run immediately", async () => {
      // Arrange
      const expectedResult = { updatedCount: 3 };
      vi.mocked(mockJobService.updateExpiredJobRoles).mockResolvedValue(
        expectedResult
      );

      // Act
      scheduler.start();

      // Wait for the immediate Promise to resolve
      await new Promise((resolve) => setImmediate(resolve));

      // Assert
      expect(scheduler.isRunning()).toBe(true);
      expect(mockJobService.updateExpiredJobRoles).toHaveBeenCalledOnce();
      expect(cron.schedule).toHaveBeenCalledWith(
        "0 3 * * *", // Default cron expression
        expect.any(Function),
        { timezone: "UTC" }
      );
      expect(console.log).toHaveBeenCalledWith(
        "Starting JobStatusScheduler with cron expression: 0 3 * * *"
      );
    });

    it("should schedule the cron job correctly", () => {
      // Arrange
      const expectedResult = { updatedCount: 2 };
      vi.mocked(mockJobService.updateExpiredJobRoles).mockResolvedValue(
        expectedResult
      );

      // Act - start without immediate execution to avoid test complexity
      scheduler.start(false);

      // Assert
      expect(scheduler.isRunning()).toBe(true);
      expect(cron.schedule).toHaveBeenCalledWith(
        "0 3 * * *", // Default cron expression: daily at 3 AM
        expect.any(Function),
        { timezone: "UTC" }
      );

      // No immediate call should have happened
      expect(mockJobService.updateExpiredJobRoles).not.toHaveBeenCalled();
    });

    it("should not start if already running", () => {
      // Arrange
      vi.mocked(mockJobService.updateExpiredJobRoles).mockResolvedValue({
        updatedCount: 1,
      });

      // Act
      scheduler.start(false); // Don't run immediately to avoid async complexity
      scheduler.start(false); // Try to start again

      // Assert
      expect(console.warn).toHaveBeenCalledWith(
        "JobStatusScheduler is already running"
      );
      expect(cron.schedule).toHaveBeenCalledTimes(1); // Should only be called once
    });
  });

  describe("stop", () => {
    it("should stop the scheduler", () => {
      // Arrange
      vi.mocked(mockJobService.updateExpiredJobRoles).mockResolvedValue({
        updatedCount: 1,
      });
      scheduler.start(false);
      expect(scheduler.isRunning()).toBe(true);

      // Act
      scheduler.stop();

      // Assert
      expect(scheduler.isRunning()).toBe(false);
      expect(mockScheduledTask.stop).toHaveBeenCalledOnce();
      expect(console.log).toHaveBeenCalledWith("JobStatusScheduler stopped");
    });

    it("should not throw error if stopping when not running", () => {
      // Act & Assert
      expect(() => scheduler.stop()).not.toThrow();
    });
  });

  describe("isRunning", () => {
    it("should return false initially", () => {
      expect(scheduler.isRunning()).toBe(false);
    });

    it("should return true when running", () => {
      vi.mocked(mockJobService.updateExpiredJobRoles).mockResolvedValue({
        updatedCount: 1,
      });
      scheduler.start(false);
      expect(scheduler.isRunning()).toBe(true);
    });

    it("should return false after stopping", () => {
      vi.mocked(mockJobService.updateExpiredJobRoles).mockResolvedValue({
        updatedCount: 1,
      });
      scheduler.start(false);
      scheduler.stop();
      expect(scheduler.isRunning()).toBe(false);
    });
  });
});
