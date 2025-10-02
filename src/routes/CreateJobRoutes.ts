import { type Request, type Response, Router } from "express";
import type { JobController } from "../controllers/JobController";

export const createJobRoutes = (_jobController: JobController) => {
  const router = Router();

  router.post("/jobs", (_req: Request, res: Response) => {
    //jobController.createJob(req,res);
    res.status(201).send("Job created");
  });

  return router;
};
