import { JobService } from "../services/JobService";
export class JobController{
    private jobService:JobService;
    constructor(_jobService:JobService){
        this.jobService=_jobService;
    }
}