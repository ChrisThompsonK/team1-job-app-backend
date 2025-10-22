import * as cron from "node-cron";
import { getJobSchedulerCronExpression } from "../config/env.js";
import type { JobService } from "../services/JobService.js";

export class JobStatusScheduler {
  private jobService: JobService;
  private scheduledTask: cron.ScheduledTask | null = null;
  private readonly CRON_EXPRESSION = getJobSchedulerCronExpression();

  constructor(jobService: JobService) {
    this.jobService = jobService;
  }

  /**
   * Start the scheduler to automatically update expired job roles
   * Runs at times configured by JOB_SCHEDULER_CRON_EXPRESSION environment variable (default: daily at 1:00 AM)
   * @param runImmediately - Whether to run the update immediately on start (default: true)
   */
  start(runImmediately: boolean = true): void {
    if (this.scheduledTask) {
      console.warn("JobStatusScheduler is already running");
      return;
    }

    console.log(
      `Starting JobStatusScheduler with cron expression: ${this.CRON_EXPRESSION}`
    );

    // Run immediately on start if requested
    if (runImmediately) {
      // Don't await this to avoid blocking the start method
      this.updateExpiredJobs().catch((error) => {
        console.error("Error in immediate job status update:", error);
      });
    }

    // Schedule the task using cron
    this.scheduledTask = cron.schedule(
      this.CRON_EXPRESSION,
      () => {
        this.updateExpiredJobs().catch((error) => {
          console.error("Error in scheduled job status update:", error);
        });
      },
      {
        timezone: "UTC",
      }
    );
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    if (this.scheduledTask) {
      this.scheduledTask.stop();
      this.scheduledTask = null;
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
    return this.scheduledTask !== null;
  }
}
