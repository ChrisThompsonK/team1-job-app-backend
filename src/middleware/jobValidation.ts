import type { Job } from "../models/JobModel";
import { Band, Capability } from "../models/JobModel";

/**
 * Validates that a job has valid band and capability enum values
 * @param job - The job object to validate
 * @throws Error if band or capability is invalid
 */
export const validateBandAndCapability = (job: Job): void => {
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
};

/**
 * Validates that a capability string is a valid enum value
 * @param capability - The capability string to validate
 * @returns The validated capability enum value
 * @throws Error if capability is invalid
 */
export const validateCapability = (capability: string): Capability => {
  const validCapabilities = Object.values(Capability);
  const capabilityEnum = validCapabilities.find((cap) => cap === capability);

  if (!capabilityEnum) {
    throw new Error(
      `Invalid capability. Must be one of: ${validCapabilities.join(", ")}`
    );
  }

  return capabilityEnum;
};

/**
 * Validates that a band string is a valid enum value
 * @param band - The band string to validate
 * @returns The validated band enum value
 * @throws Error if band is invalid
 */
export const validateBand = (band: string): Band => {
  const validBands = Object.values(Band);
  const bandEnum = validBands.find((b) => b === band);

  if (!bandEnum) {
    throw new Error(`Invalid band. Must be one of: ${validBands.join(", ")}`);
  }

  return bandEnum;
};
