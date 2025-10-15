import { toNodeHandler } from "better-auth/node";
import type { Request, Response } from "express";
import express from "express";
import { authController, jobController } from "./di/container.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { configureMiddleware } from "./middleware/middlewareConfig.js";
import { createAuthRoutes } from "./routes/CreateAuthRoutes.js";
import { createJobRoutes } from "./routes/CreateJobRoutes.js";
import { auth } from "./utils/auth.js";

const app = express();

// Configure middleware BEFORE Better Auth handler
configureMiddleware(app);

// Mount Better Auth handler - use the correct pattern
app.use("/api/auth", toNodeHandler(auth));

// Hello World endpoint
app.get("/", (_req: Request, res: Response) => {
  res.json({
    title: "Job Application Backend API",
    message: "Welcome to the Job Application System",
    version: "1.0.0",
    endpoints: {
      jobs: "/api/jobs",
      jobById: "/api/jobs/:id",
      createJob: "/api/jobs [POST]",
      editJob: "/api/jobs/:id [PUT]",
      deleteJob: "/api/jobs/:id [DELETE]",
      filteredJobs: "/api/jobs/search",
      login: "/api/auth/sign-in/email [POST]",
      currentUser: "/api/profile [GET]",
    },
    filtering: {
      endpoint: "/api/jobs/search",
      description: "Server-side filtering with query parameters",
      queryParameters: {
        capability:
          "Filter by capability (DATA, WORKDAY, ENGINEERING, PRODUCT, DESIGN, PLATFORM, QUALITY, ARCHITECTURE, BUSINESS_ANALYSIS, SECURITY)",
        band: "Filter by band (Junior, Mid, Senior, Principal)",
        location: "Filter by location (partial match)",
        status: "Filter by status (open, closed)",
        search:
          "Text search across job title, description, and responsibilities",
        page: "Page number for pagination (default: 1)",
        limit: "Items per page (1-100, default: 10)",
        sortBy:
          "Sort field (jobRoleName, closingDate, band, capability, location)",
        sortOrder: "Sort direction (asc, desc, default: asc)",
      },
      examples: [
        "/api/jobs/search?capability=DATA&band=Senior",
        "/api/jobs/search?search=engineer&sortBy=closingDate&sortOrder=desc",
        "/api/jobs/search?location=London&page=1&limit=5",
      ],
    },
  });
});

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use("/api", createJobRoutes(jobController));
app.use("/api", createAuthRoutes(authController));

// Error handling middleware (must be after all routes)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
