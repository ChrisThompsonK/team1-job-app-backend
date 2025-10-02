import cors from "cors";
import type { Request, Response } from "express";
import express from "express";
import morgan from "morgan";
import { jobController } from "./di/Jobs";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { createJobRoutes } from "./routes/CreateJobRoutes";

const app = express();

// Middleware to parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cors());

// Hello World endpoint
app.get("/", (_req: Request, res: Response) => {
  res.json({
    title: "Job Application Backend API",
    message: "Welcome to the Job Application System",
    version: "1.0.0",
    endpoints: {
      jobs: "/api/jobs",
      jobById: "/api/jobs/:id",
      jobsByCapability: "/api/jobs/capability/:capability",
      jobsByBand: "/api/jobs/band/:band",
    },
  });
});

// API routes
app.use("/api", createJobRoutes(jobController));

// Error handling middleware (must be after all routes)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
