import cors from "cors";
import type { Request, Response } from "express";
import express from "express";
import morgan from "morgan";
import { jobController } from "./di/Jobs";
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
    title: "Job Application Frontend",
    message: "Welcome to the Job Application System",
  });
});
app.use("/api", createJobRoutes(jobController));
export default app;
