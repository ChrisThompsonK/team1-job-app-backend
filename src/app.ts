import type { Request, Response } from "express";
import express from "express";
import { jobController } from "./di/container";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { configureMiddleware } from "./middleware/middlewareConfig";
import { createJobRoutes } from "./routes/CreateJobRoutes";

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
    },
  });
});

// API routes
app.use("/api", createJobRoutes(jobController));

// Error handling middleware (must be after all routes)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
