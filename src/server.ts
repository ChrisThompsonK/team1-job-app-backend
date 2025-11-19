import app from "./app.js";
import { env } from "./config/env.js";
import { runMigrationsWithRetry } from "./db/runMigrations.js";
import { jobScheduler } from "./di/container.js";

let migrationsReady = env.nodeEnv !== "production";

// Run migrations on startup in production (non-blocking)
// In development, migrations should be run manually via `npm run db:migrate`
if (env.nodeEnv === "production") {
  runMigrationsWithRetry()
    .then(() => {
      migrationsReady = true;
      console.log("✅ Server is ready to accept requests");
    })
    .catch((error) => {
      console.error("⚠️  Migrations failed to complete:", error);
      migrationsReady = false;
    });
}

// Health/readiness endpoint
app.get("/health", (_req, res) => {
  if (migrationsReady) {
    res.status(200).json({ status: "ready", timestamp: new Date() });
  } else {
    res.status(503).json({ status: "initializing", timestamp: new Date() });
  }
});

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
