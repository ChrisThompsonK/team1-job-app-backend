import * as cron from "node-cron";
import type { JobService } from "./JobService.js";

export class JobSchedulerService {
  private jobService: JobService;
  private task: cron.ScheduledTask | null = null;

  constructor(jobService: JobService) {
    this.jobService = jobService;
  }

  /**
   * Start the job scheduler to run every day at 3:00 AM UTC
   * This will check for expired jobs and update their status
   */
  start(): void {
    if (this.task) {
      console.log("Job scheduler is already running");
      return;
    }

    console.log("Starting job scheduler - will run daily at 3:00 AM UTC");

    // Schedule task to run at 3:00 AM UTC every day
    // Cron format: minute hour day month weekday
    // '0 3 * * *' = At 3:00 AM every day
    this.task = cron.schedule(
      "0 3 * * *",
      async () => {
        console.log("Running daily job check at 3:00 AM UTC...");
        await this.checkExpiredJobs();
      },
      {
        timezone: "UTC",
      }
    );

    console.log("Job scheduler started successfully");

    // Optional: Run immediately on startup for testing
    // Comment out this line in production if you don't want immediate execution
    this.checkExpiredJobs();
  }

  /**
   * Stop the job scheduler
   */
  stop(): void {
    if (this.task) {
      this.task.stop();
      this.task = null;
      console.log("Job scheduler stopped");
    }
  }

  /**
   * Manually trigger the job check (useful for testing)
   */
  async runNow(): Promise<void> {
    console.log("Manually triggering job check...");
    await this.checkExpiredJobs();
  }

  /**
   * Check for expired jobs and update their status
   */
  private async checkExpiredJobs(): Promise<void> {
    try {
      console.log("Checking for expired jobs...");

      // Get current timestamp
      const now = new Date();
      console.log(`Current time: ${now.toISOString()}`);

      // Use the existing JobService method to update expired jobs
      const result = await this.jobService.updateExpiredJobRoles();

      if (result && typeof result.updatedCount === "number") {
        console.log(
          `✅ Job check completed: ${result.updatedCount} jobs updated to closed status`
        );
      } else {
        console.log("✅ Job check completed: 0 jobs updated");
      }
    } catch (error) {
      console.error("❌ Error during job check:", error);
    }
  }

  /**
   * Get the status of the scheduler
   */
  isRunning(): boolean {
    return this.task !== null;
  }

  /**
   * Get the next scheduled run time
   */
  getNextRun(): Date | null {
    if (this.task) {
      // Calculate next 3 AM UTC
      const now = new Date();
      const next = new Date(now);
      next.setUTCHours(3, 0, 0, 0);

      // If 3 AM today has passed, set to 3 AM tomorrow
      if (next <= now) {
        next.setUTCDate(next.getUTCDate() + 1);
      }

      return next;
    }
    return null;
  }
}
