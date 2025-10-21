import app from "./app.js";
import { env } from "./config/env.js";
import { jobScheduler } from "./di/container.js";

app.listen(env.port, () => {
  console.log(`Server is running on http://localhost:${env.port}`);
  console.log(`Environment: ${env.nodeEnv}`);

  // Start the job scheduler
  jobScheduler.start();
  console.log("Job scheduler initialized - will run daily at 3:00 AM UTC");
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
