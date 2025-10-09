import type { Job } from "../models/JobModel.js";
import { Band, Capability, JobStatus } from "../models/JobModel.js";

/**
 * Interface for incoming job request data
 */
interface JobRequestData {
  jobRoleName?: string;
  description?: string;
  jobSpecLink?: string;
  responsibilities?: string[];
  numberOfOpenPositions?: number;
  location?: string;
  closingDate?: string | Date;
  band?: string;
  capability?: string;
  status?: string;
}

/**
 * JobValidator class provides comprehensive validation for job-related data
 */
export class JobValidator {
  /**
   * Validates that a job ID is valid (non-empty string)
   * @param id - The job ID to validate
   * @returns The trimmed job ID
   * @throws Error if ID is invalid
   */
  validateJobId(id: string): string {
    if (!id || typeof id !== "string" || id.trim() === "") {
      throw new Error("Valid job ID is required");
    }
    return id.trim();
  }

  /**
   * Validates that a job has valid band and capability enum values
   * @param job - The job object to validate
   * @throws Error if band or capability is invalid
   */
  validateBandAndCapability(job: Job): void {
    const validBands = Object.values(Band);
    const validCapabilities = Object.values(Capability);

    const bandEnum = validBands.find((b) => b === job.band);
    const capabilityEnum = validCapabilities.find(
      (cap) => cap === job.capability
    );

    if (!bandEnum) {
      throw new Error(`Invalid band. Must be one of: ${validBands.join(", ")}`);
    }

    if (!capabilityEnum) {
      throw new Error(
        `Invalid capability. Must be one of: ${validCapabilities.join(", ")}`
      );
    }
  }

  /**
   * Validates that a capability string is a valid enum value
   * @param capability - The capability string to validate
   * @returns The validated capability enum value
   * @throws Error if capability is invalid
   */
  validateCapability(capability: string): Capability {
    const validCapabilities = Object.values(Capability);
    const capabilityEnum = validCapabilities.find((cap) => cap === capability);

    if (!capabilityEnum) {
      throw new Error(
        `Invalid capability. Must be one of: ${validCapabilities.join(", ")}`
      );
    }

    return capabilityEnum;
  }

  /**
   * Validates that a band string is a valid enum value
   * @param band - The band string to validate
   * @returns The validated band enum value
   * @throws Error if band is invalid
   */
  validateBand(band: string): Band {
    const validBands = Object.values(Band);
    const bandEnum = validBands.find((b) => b === band);

    if (!bandEnum) {
      throw new Error(`Invalid band. Must be one of: ${validBands.join(", ")}`);
    }

    return bandEnum;
  }

  /**
   * Creates and validates a Job object from request data
   * @param data - The request data to deserialize
   * @param id - Optional ID for editing existing jobs
   * @returns A validated Job object
   * @throws Error if validation fails
   */
  createValidatedJob(data: JobRequestData, id?: string): Job {
    const {
      jobRoleName,
      description,
      jobSpecLink,
      responsibilities,
      numberOfOpenPositions,
      location,
      closingDate,
      band,
      capability,
      status,
    } = data;

    // Validate required fields
    if (!jobRoleName || typeof jobRoleName !== "string") {
      throw new Error("Job role name is required and must be a string");
    }
    if (!description || typeof description !== "string") {
      throw new Error("Description is required and must be a string");
    }
    // Job spec link is now optional
    if (jobSpecLink && typeof jobSpecLink !== "string") {
      throw new Error("Job spec link must be a string if provided");
    }
    if (!responsibilities || !Array.isArray(responsibilities)) {
      throw new Error("Responsibilities are required and must be an array");
    }
    if (!numberOfOpenPositions || typeof numberOfOpenPositions !== "number") {
      throw new Error(
        "Number of open positions is required and must be a number"
      );
    }
    if (numberOfOpenPositions < 1) {
      throw new Error("Number of open positions must be at least 1");
    }
    if (!location || typeof location !== "string") {
      throw new Error("Location is required and must be a string");
    }
    if (!closingDate) {
      throw new Error("Closing date is required");
    }
    if (!band || typeof band !== "string") {
      throw new Error("Band is required and must be a string");
    }
    if (!capability || typeof capability !== "string") {
      throw new Error("Capability is required and must be a string");
    }

    // Validate and convert enums
    const validatedBand = this.validateBand(band);
    const validatedCapability = this.validateCapability(capability);

    // Validate status if provided (required for edits)
    let validatedStatus: JobStatus | undefined;
    if (status !== undefined) {
      if (!Object.values(JobStatus).includes(status as JobStatus)) {
        throw new Error(
          `Invalid status. Must be one of: ${Object.values(JobStatus).join(", ")}`
        );
      }
      validatedStatus = status as JobStatus;
    }

    // Create the validated job object
    const job: Job = {
      jobRoleName,
      description,
      responsibilities,
      location,
      capability: validatedCapability,
      band: validatedBand,
      closingDate: new Date(closingDate),
      numberOfOpenPositions,
    };

    // Add jobSpecLink only if provided
    if (jobSpecLink) {
      job.jobSpecLink = jobSpecLink;
    }

    // Add optional fields if provided
    if (id) {
      job.id = id;
    }
    if (validatedStatus) {
      job.status = validatedStatus;
    }

    return job;
  }
}
