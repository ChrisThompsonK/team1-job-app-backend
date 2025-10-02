import type { Request, Response } from "express";
import express from "express";
import { jobController } from "./di/Jobs";
import { setupMiddleware } from "./middleware";
import { createJobRoutes } from "./routes/CreateJobRoutes";

const app = express();

setupMiddleware(app);
// Hello World endpoint
app.get("/", (_req: Request, res: Response) => {
  res.json({
    title: "Job Application Frontend",
    message: "Welcome to the Job Application System",
  });
});
app.use("/api", createJobRoutes(jobController));
export default app;
