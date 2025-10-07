import type { Request, Response } from "express";
import express from "express";
import { jobController } from "./di/container.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { configureMiddleware } from "./middleware/middlewareConfig.js";
import { createJobRoutes } from "./routes/CreateJobRoutes.js";

const app = express();

// Configure middleware
configureMiddleware(app);

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
      filteredJobs: "/api/jobs/search",
    },
    filtering: {
      endpoint: "/api/jobs/search",
      description: "Server-side filtering with query parameters",
      queryParameters: {
        capability: "Filter by capability (DATA, WORKDAY, ENGINEERING)",
        band: "Filter by band (E1, E2, E3, E4, E5)",
        location: "Filter by location (partial match)",
        status: "Filter by status (open, closed, draft)",
        search:
          "Text search across job title, description, and responsibilities",
        page: "Page number for pagination (default: 1)",
        limit: "Items per page (1-100, default: 10)",
        sortBy:
          "Sort field (jobRoleName, closingDate, band, capability, location)",
        sortOrder: "Sort direction (asc, desc, default: asc)",
      },
      examples: [
        "/api/jobs/search?capability=DATA&band=E3",
        "/api/jobs/search?search=engineer&sortBy=closingDate&sortOrder=desc",
        "/api/jobs/search?location=London&page=1&limit=5",
      ],
    },
  });
});

// API routes
app.use("/api", createJobRoutes(jobController));

// Error handling middleware (must be after all routes)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
