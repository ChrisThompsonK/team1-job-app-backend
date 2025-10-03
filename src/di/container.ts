import { JobController } from "../controllers/JobController";
import { JobRepository } from "../repositories/JobRepository";
import { JobService } from "../services/JobService";
import { JobValidator } from "../validators/JobValidator";

// Dependency injection container
const jobRepository = new JobRepository();
const jobValidator = new JobValidator();
const jobService = new JobService(jobRepository, jobValidator);
const jobController = new JobController(jobService, jobValidator);

export { jobController };
