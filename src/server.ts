import app from "./app.js";
import { env } from "./config/env.js";
import { runMigrationsWithRetry } from "./db/runMigrations.js";
import { jobScheduler } from "./di/container.js";

// Run migrations on startup in production (non-blocking)
// In development, migrations should be run manually via `npm run db:migrate`
if (env.nodeEnv === "production") {
  runMigrationsWithRetry();
}

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
