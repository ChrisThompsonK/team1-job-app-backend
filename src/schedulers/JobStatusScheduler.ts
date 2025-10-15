import { env } from "../config/env.js";
import type { JobService } from "../services/JobService.js";

export class JobStatusScheduler {
  private jobService: JobService;
  private intervalId: NodeJS.Timeout | null = null;
  private readonly INTERVAL_MS = env.jobSchedulerIntervalMs;

  constructor(jobService: JobService) {
    this.jobService = jobService;
  }

  /**
   * Start the scheduler to automatically update expired job roles
   * Runs at intervals configured by JOB_SCHEDULER_INTERVAL_MS environment variable (default: 24 hours)
   * @param runImmediately - Whether to run the update immediately on start (default: true)
   */
  start(runImmediately: boolean = true): void {
    if (this.intervalId) {
      console.warn("JobStatusScheduler is already running");
      return;
    }

    console.log(
      `Starting JobStatusScheduler - will run every ${this.INTERVAL_MS / 1000} seconds`
    );

    // Run immediately on start if requested
    if (runImmediately) {
      // Don't await this to avoid blocking the start method
      this.updateExpiredJobs().catch((error) => {
        console.error("Error in immediate job status update:", error);
      });
    }

    // Then run at configured intervals
    this.intervalId = setInterval(() => {
      this.updateExpiredJobs().catch((error) => {
        console.error("Error in scheduled job status update:", error);
      });
    }, this.INTERVAL_MS);
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log("JobStatusScheduler stopped");
    }
  }

  /**
   * Manually trigger an update of expired job roles
   * This can be called directly for testing or manual triggers
   */
  async updateExpiredJobs(): Promise<{ updatedCount: number }> {
    try {
      console.log("Running scheduled job status update...");
      const result = await this.jobService.updateExpiredJobRoles();

      // Add null check for result
      if (!result || typeof result.updatedCount !== "number") {
        console.warn(
          "Invalid result from updateExpiredJobRoles, defaulting to 0 updates"
        );
        return { updatedCount: 0 };
      }

      console.log(
        `Job status update completed: ${result.updatedCount} jobs updated to closed status`
      );
      return result;
    } catch (error) {
      console.error("Error during scheduled job status update:", error);
      throw error;
    }
  }

  /**
   * Check if the scheduler is currently running
   */
  isRunning(): boolean {
    return this.intervalId !== null;
  }
}
