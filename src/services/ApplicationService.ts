import type {
  Application,
  ApplicationRepository,
  ApplicationWithDetails,
  CreateApplicationData,
} from "../repositories/ApplicationRepository.js";
import type { JobRepository } from "../repositories/JobRepository.js";

/**
 * Service layer for application business logic
 * Handles validation and coordination between repositories
 */
export class ApplicationService {
  private applicationRepository: ApplicationRepository;
  private jobRepository: JobRepository;

  constructor(
    applicationRepository: ApplicationRepository,
    jobRepository: JobRepository
  ) {
    this.applicationRepository = applicationRepository;
    this.jobRepository = jobRepository;
  }

  /**
   * Apply to a job with CV upload
   * Validates job exists and user hasn't already applied
   */
  async applyToJob(
    userId: string,
    jobId: number,
    cvPath: string
  ): Promise<Application> {
    // Validate job exists
    const job = await this.jobRepository.getJobById(jobId.toString());
    if (!job) {
      throw new Error(`Job with ID ${jobId} not found`);
    }

    // Check if user has already applied
    const hasApplied = await this.applicationRepository.hasUserApplied(
      userId,
      jobId
    );
    if (hasApplied) {
      throw new Error("You have already applied to this job");
    }

    // Create the application
    const applicationData: CreateApplicationData = {
      jobRoleID: jobId,
      applicantID: userId,
      cvPath,
    };

    return await this.applicationRepository.createApplication(applicationData);
  }

  /**
   * Get all applications for a specific user
   */
  async getUserApplications(userId: string): Promise<Application[]> {
    return await this.applicationRepository.getApplicationsByUserId(userId);
  }

  /**
   * Get all applications for a specific job (admin only)
   */
  async getJobApplications(jobId: number): Promise<Application[]> {
    // Validate job exists
    const job = await this.jobRepository.getJobById(jobId.toString());
    if (!job) {
      throw new Error(`Job with ID ${jobId} not found`);
    }

    return await this.applicationRepository.getApplicationsByJobId(jobId);
  }

  /**
   * Get a specific application by ID
   */
  async getApplicationById(id: number): Promise<Application | null> {
    return await this.applicationRepository.getApplicationById(id);
  }

  /**
   * Get all applications with job and user details (admin only)
   */
  async getAllApplicationsWithDetails(): Promise<ApplicationWithDetails[]> {
    return await this.applicationRepository.getAllApplicationsWithDetails();
  }

  /**
   * Get a specific application with job and user details by ID
   */
  async getApplicationWithDetailsById(
    id: number
  ): Promise<ApplicationWithDetails | null> {
    return await this.applicationRepository.getApplicationWithDetailsById(id);
  }
}
