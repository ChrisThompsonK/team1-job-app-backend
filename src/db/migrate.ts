import { runMigrationsWithRetry } from "./runMigrations.js";

// Run migrations (with exit for CLI usage)
runMigrationsWithRetry()
  .then(() => {
    console.log("🎉 Migration process completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Migration failed:", error);
    process.exit(1);
  });
