import { AuthController } from "../controllers/AuthController.js";
import { JobController } from "../controllers/JobController.js";
import { JobRepository } from "../repositories/JobRepository.js";
import { JobStatusScheduler } from "../schedulers/JobStatusScheduler.js";
import { JobService } from "../services/JobService.js";
import { JobValidator } from "../validators/JobValidator.js";

// Dependency injection container
const jobRepository = new JobRepository();
const jobValidator = new JobValidator();
const jobService = new JobService(jobRepository, jobValidator);
const jobController = new JobController(jobService, jobValidator);

// Auth controller
const authController = new AuthController();

// Schedulers
const jobScheduler = new JobStatusScheduler(jobService);

export { authController, jobController, jobScheduler };
