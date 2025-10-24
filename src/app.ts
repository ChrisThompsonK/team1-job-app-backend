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
import { createFileRoutes } from "./routes/CreateFileRoutes.js";
import { createJobRoutes } from "./routes/CreateJobRoutes.js";
import schedulerRoutes from "./routes/schedulerRoutes.js";
import { auth } from "./utils/auth.js";

const app = express();

// Configure middleware BEFORE Better Auth handler
configureMiddleware(app);

// Add debug logging for authentication requests
app.use("/api/auth", (req, _res, next) => {
  console.log("🔐 BETTER AUTH REQUEST:");
  console.log("📍 Request details:", {
    method: req.method,
    url: req.url,
    path: req.path,
    headers: {
      "content-type": req.headers["content-type"],
      "user-agent": req.headers["user-agent"],
      cookie: req.headers.cookie || "NO COOKIES",
      origin: req.headers.origin || "NO ORIGIN",
    },
    body: req.method === "POST" ? req.body : "GET request",
    timestamp: new Date().toISOString(),
  });
  next();
});

// Mount Better Auth handler - use the correct pattern
app.use("/api/auth", toNodeHandler(auth));

// Hello World endpoint
app.get("/", (_req: Request, res: Response) => {
  res.json({
    title: "Job Application Backend API",
    message: "Welcome to the Job Application System",
    version: "1.0.0",
    documentation:
      "See /docs/api-documentation.md for complete API documentation",
    endpoints: {
      authentication: {
        signIn: "/api/auth/sign-in/email [POST]",
        signUp: "/api/auth/sign-up/email [POST]",
        signOut: "/api/auth/sign-out [POST]",
        getSession: "/api/auth/get-session [GET]",
        profile: "/api/profile [GET] (requires auth)",
        updateProfile: "/api/profile [PUT] (requires auth)",
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
        getApplicationDetails:
          "/api/applications/:id/details [GET] (requires auth)",
        getJobApplications:
          "/api/applications/job/:jobId [GET] (requires auth & admin)",
      },
      scheduler: {
        manage: "/api/scheduler/* [Various] (requires auth & admin)",
      },
      files: {
        downloadCV: "/api/files/cv/:filename [GET] (requires auth)",
        getCVInfo: "/api/files/cv/:filename/info [GET] (requires auth)",
      },
      health: "/health [GET] - API health check",
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
app.use("/api", createFileRoutes());
app.use("/api/scheduler", schedulerRoutes);

// Error handling middleware (must be after all routes)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
