import { toNodeHandler } from "better-auth/node";
import type { Request, Response } from "express";
import express from "express";
import {
  applicationController,
  authController,
  jobController,
} from "./di/container.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { configureMiddleware } from "./middleware/middlewareConfig.js";
import { createApplicationRoutes } from "./routes/CreateApplicationRoutes.js";
import { createAuthRoutes } from "./routes/CreateAuthRoutes.js";
import { createJobRoutes } from "./routes/CreateJobRoutes.js";
import schedulerRoutes from "./routes/schedulerRoutes.js";
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
      authentication: {
        signIn: "/api/auth/sign-in/email [POST]",
        signUp: "/api/auth/sign-up/email [POST]",
        signOut: "/api/auth/sign-out [POST]",
        getSession: "/api/auth/get-session [GET]",
        profile: "/api/profile [GET] (requires auth)",
      },
      jobs: {
        getAllJobs: "/api/jobs [GET]",
        getJobById: "/api/jobs/:id [GET]",
        searchJobs: "/api/jobs/search [GET]",
        createJob: "/api/jobs [POST] (requires auth & admin)",
        editJob: "/api/jobs/:id [PUT] (requires auth & admin)",
        deleteJob: "/api/jobs/:id [DELETE] (requires auth & admin)",
      },
      applications: {
        applyToJob: "/api/applications [POST] (requires auth)",
        getMyApplications: "/api/applications/me [GET] (requires auth)",
        getAllApplications: "/api/applications [GET] (requires auth & admin)",
        getApplicationById: "/api/applications/:id [GET] (requires auth)",
        getJobApplications:
          "/api/applications/job/:jobId [GET] (requires auth & admin)",
      },
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
app.use("/api", createApplicationRoutes(applicationController));
app.use("/api/scheduler", schedulerRoutes);

// Error handling middleware (must be after all routes)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
