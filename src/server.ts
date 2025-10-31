import app from "./app.js";
import { env, getJobSchedulerCronExpression } from "./config/env.js";
import { jobScheduler } from "./di/container.js";

app.listen(env.port, () => {
  console.log(`Server is running on http://localhost:${env.port}`);

  // Start the job scheduler
  jobScheduler.start();
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  jobScheduler.stop();
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  jobScheduler.stop();
  process.exit(0);
});
