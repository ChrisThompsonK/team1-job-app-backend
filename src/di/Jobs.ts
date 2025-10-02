import { JobRepository } from "../repositories/JobRepository";
import { JobService } from "../services/JobService";
import { JobController } from "../controllers/JobController";

const jobRepository:JobRepository=new JobRepository();
const jobService:JobService=new JobService(jobRepository);
const jobController:JobController=new JobController(jobService);

export {jobController};