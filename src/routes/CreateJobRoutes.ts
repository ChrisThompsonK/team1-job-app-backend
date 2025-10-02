import { JobController } from "../controllers/JobController";
import { Router,Request,Response } from "express";

export const createJobRoutes=(jobController: JobController)=>{
    const router=Router();
    
    router.post("/jobs", (req:Request,res:Response)=>{
        //jobController.createJob(req,res);
        res.status(201).send("Job created");
    });

    return router;
}
