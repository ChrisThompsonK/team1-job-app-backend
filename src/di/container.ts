import { ApplicationController } from "../controllers/ApplicationController.js";
import { AuthController } from "../controllers/AuthController.js";
import { JobController } from "../controllers/JobController.js";
import { ApplicationRepository } from "../repositories/ApplicationRepository.js";
import { JobRepository } from "../repositories/JobRepository.js";
import { JobStatusScheduler } from "../schedulers/JobStatusScheduler.js";
import { ApplicationService } from "../services/ApplicationService.js";
import { JobService } from "../services/JobService.js";
import { JobValidator } from "../validators/JobValidator.js";

// Dependency injection container

// Job dependencies
const jobRepository = new JobRepository();
const jobValidator = new JobValidator();
const jobService = new JobService(jobRepository, jobValidator);
const jobController = new JobController(jobService, jobValidator);

// Application dependencies
const applicationRepository = new ApplicationRepository();
const applicationService = new ApplicationService(
  applicationRepository,
  jobRepository
);
const applicationController = new ApplicationController(applicationService);

// Auth controller
const authController = new AuthController();

export { applicationController, authController, jobController };
// Schedulers
const jobScheduler = new JobStatusScheduler(jobService);

export { authController, jobController, jobScheduler };
