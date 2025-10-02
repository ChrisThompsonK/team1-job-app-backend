import { JobController } from "../controllers/JobController";
import { JobRepository } from "../repositories/JobRepository";
import { JobService } from "../services/JobService";

// Dependency injection container
const jobRepository = new JobRepository();
const jobService = new JobService(jobRepository);
const jobController = new JobController(jobService);

export { jobController };
