import { JobController } from "../controllers/JobController";
import { JobRepository } from "../repositories/JobRepository";
import { JobService } from "../services/JobService";

const jobRepository: JobRepository = new JobRepository();
const jobService: JobService = new JobService(jobRepository);
const jobController: JobController = new JobController(jobService);

export { jobController };
