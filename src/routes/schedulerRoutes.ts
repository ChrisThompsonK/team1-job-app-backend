import { Router } from "express";
import { jobScheduler } from "../di/container.js";

const router = Router();

/**
 * GET /api/scheduler/status
 * Get the current status of the job scheduler
 */
router.get("/status", (_req, res) => {
  const isRunning = jobScheduler.isRunning();

  res.json({
    isRunning,
    message: isRunning ? "Scheduler is running" : "Scheduler is stopped",
  });
});

/**
 * POST /api/scheduler/run-now
 * Manually trigger a job check (for testing purposes)
 */
router.post("/run-now", async (_req, res) => {
  try {
    const result = await jobScheduler.updateExpiredJobs();
    res.json({
      success: true,
      message: "Job check completed successfully",
      updatedCount: result.updatedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error running manual job check:", error);
    res.status(500).json({
      success: false,
      message: "Error running job check",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
