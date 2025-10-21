import app from "./app.js";
import { env } from "./config/env.js";
import { jobStatusScheduler } from "./di/container.js";

app.listen(env.port, () => {
  console.log(`Server is running on http://localhost:${env.port}`);
  console.log(`Environment: ${env.nodeEnv}`);

  // Start the job status scheduler
  jobStatusScheduler.start();
  console.log(
    `Job status scheduler started - using cron expression: ${env.jobSchedulerCronExpression}`
  );
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  jobStatusScheduler.stop();
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  jobStatusScheduler.stop();
  process.exit(0);
});
