import { beforeEach, describe, expect, it } from "vitest";
import { Band, Capability, JobStatus } from "../models/JobModel";
import { JobValidator } from "../validators/JobValidator";

describe("JobValidator", () => {
  let jobValidator: JobValidator;

  beforeEach(() => {
    jobValidator = new JobValidator();
  });

  describe("validateJobId", () => {
    it("should return trimmed ID for valid ID", () => {
      const result = jobValidator.validateJobId("  123  ");
      expect(result).toBe("123");
    });

    it("should throw error for empty string", () => {
      expect(() => jobValidator.validateJobId("")).toThrow(
        "Valid job ID is required"
      );
    });

    it("should throw error for whitespace only", () => {
      expect(() => jobValidator.validateJobId("   ")).toThrow(
        "Valid job ID is required"
      );
    });

    it("should throw error for null", () => {
      expect(() =>
        jobValidator.validateJobId(null as unknown as string)
      ).toThrow("Valid job ID is required");
    });

    it("should throw error for undefined", () => {
      expect(() =>
        jobValidator.validateJobId(undefined as unknown as string)
      ).toThrow("Valid job ID is required");
    });

    it("should throw error for non-string", () => {
      expect(() =>
        jobValidator.validateJobId(123 as unknown as string)
      ).toThrow("Valid job ID is required");
    });
  });

  describe("validateBand", () => {
    it("should return valid band enum for valid band string", () => {
      const result = jobValidator.validateBand("Junior");
      expect(result).toBe(Band.JUNIOR);
    });

    it("should throw error for invalid band", () => {
      expect(() => jobValidator.validateBand("InvalidBand")).toThrow(
        "Invalid band. Must be one of: Junior, Mid, Senior, Principal"
      );
    });

    it("should handle all valid band values", () => {
      expect(jobValidator.validateBand("Junior")).toBe(Band.JUNIOR);
      expect(jobValidator.validateBand("Mid")).toBe(Band.MID);
      expect(jobValidator.validateBand("Senior")).toBe(Band.SENIOR);
      expect(jobValidator.validateBand("Principal")).toBe(Band.PRINCIPAL);
    });
  });

  describe("validateCapability", () => {
    it("should return valid capability enum for valid capability string", () => {
      const result = jobValidator.validateCapability("Engineering");
      expect(result).toBe(Capability.ENGINEERING);
    });

    it("should throw error for invalid capability", () => {
      expect(() =>
        jobValidator.validateCapability("InvalidCapability")
      ).toThrow(
        "Invalid capability. Must be one of: Data, Workday, Engineering"
      );
    });

    it("should handle all valid capability values", () => {
      expect(jobValidator.validateCapability("Data")).toBe(Capability.DATA);
      expect(jobValidator.validateCapability("Workday")).toBe(
        Capability.WORKDAY
      );
      expect(jobValidator.validateCapability("Engineering")).toBe(
        Capability.ENGINEERING
      );
    });
  });

  describe("validateBandAndCapability", () => {
    it("should pass validation for job with valid band and capability", () => {
      const job = {
        band: Band.MID,
        capability: Capability.ENGINEERING,
        jobRoleName: "Test Role",
      };

      expect(() => jobValidator.validateBandAndCapability(job)).not.toThrow();
    });

    it("should throw error for job with invalid band", () => {
      const job = {
        band: "InvalidBand" as unknown as Band,
        capability: Capability.ENGINEERING,
        jobRoleName: "Test Role",
      };

      expect(() => jobValidator.validateBandAndCapability(job)).toThrow(
        "Invalid band. Must be one of: Junior, Mid, Senior, Principal"
      );
    });

    it("should throw error for job with invalid capability", () => {
      const job = {
        band: Band.MID,
        capability: "InvalidCapability" as unknown as Capability,
        jobRoleName: "Test Role",
      };

      expect(() => jobValidator.validateBandAndCapability(job)).toThrow(
        "Invalid capability. Must be one of: Data, Workday, Engineering"
      );
    });
  });

  describe("createValidatedJob", () => {
    const validJobData = {
      jobRoleName: "Senior Software Engineer",
      description: "Lead development of scalable web applications",
      responsibilities: [
        "Design and implement software solutions",
        "Mentor junior developers",
      ],
      jobSpecLink: "https://sharepoint.example.com/job-spec-1",
      location: "London",
      capability: "Engineering",
      band: "Senior",
      closingDate: "2025-12-31",
      numberOfOpenPositions: 2,
    };

    describe("successful validation", () => {
      it("should create valid job object from valid data", () => {
        const result = jobValidator.createValidatedJob(validJobData);

        expect(result).toMatchObject({
          jobRoleName: "Senior Software Engineer",
          description: "Lead development of scalable web applications",
          responsibilities: [
            "Design and implement software solutions",
            "Mentor junior developers",
          ],
          jobSpecLink: "https://sharepoint.example.com/job-spec-1",
          location: "London",
          capability: Capability.ENGINEERING,
          band: Band.SENIOR,
          numberOfOpenPositions: 2,
        });
        expect(result.closingDate).toBeInstanceOf(Date);
      });

      it("should include ID when provided", () => {
        const result = jobValidator.createValidatedJob(validJobData, "test-id");
        expect(result.id).toBe("test-id");
      });

      it("should include status when provided", () => {
        const dataWithStatus = { ...validJobData, status: "open" };
        const result = jobValidator.createValidatedJob(dataWithStatus);
        expect(result.status).toBe(JobStatus.OPEN);
      });

      it("should handle all valid status values", () => {
        const openData = { ...validJobData, status: "open" };
        const closedData = { ...validJobData, status: "closed" };
        const draftData = { ...validJobData, status: "draft" };

        expect(jobValidator.createValidatedJob(openData).status).toBe(
          JobStatus.OPEN
        );
        expect(jobValidator.createValidatedJob(closedData).status).toBe(
          JobStatus.CLOSED
        );
        expect(jobValidator.createValidatedJob(draftData).status).toBe(
          JobStatus.DRAFT
        );
      });
    });

    describe("field validation errors", () => {
      it("should throw error for missing jobRoleName", () => {
        const invalidData = { ...validJobData, jobRoleName: undefined };
        expect(() => jobValidator.createValidatedJob(invalidData)).toThrow(
          "Job role name is required and must be a string"
        );
      });

      it("should throw error for invalid jobRoleName type", () => {
        const invalidData = {
          ...validJobData,
          jobRoleName: 123 as unknown as string,
        };
        expect(() => jobValidator.createValidatedJob(invalidData)).toThrow(
          "Job role name is required and must be a string"
        );
      });

      it("should throw error for missing description", () => {
        const invalidData = { ...validJobData, description: undefined };
        expect(() => jobValidator.createValidatedJob(invalidData)).toThrow(
          "Description is required and must be a string"
        );
      });

      it("should not throw error for missing jobSpecLink (now optional)", () => {
        const validDataWithoutJobSpecLink = {
          ...validJobData,
          jobSpecLink: undefined,
        };
        expect(() =>
          jobValidator.createValidatedJob(validDataWithoutJobSpecLink)
        ).not.toThrow();
      });

      it("should throw error for invalid jobSpecLink type", () => {
        const invalidData = { ...validJobData, jobSpecLink: 123 as any };
        expect(() => jobValidator.createValidatedJob(invalidData)).toThrow(
          "Job spec link must be a string if provided"
        );
      });

      it("should throw error for missing responsibilities", () => {
        const invalidData = { ...validJobData, responsibilities: undefined };
        expect(() => jobValidator.createValidatedJob(invalidData)).toThrow(
          "Responsibilities are required and must be an array"
        );
      });

      it("should throw error for invalid responsibilities type", () => {
        const invalidData = {
          ...validJobData,
          responsibilities: "not an array" as unknown as string[],
        };
        expect(() => jobValidator.createValidatedJob(invalidData)).toThrow(
          "Responsibilities are required and must be an array"
        );
      });

      it("should throw error for missing numberOfOpenPositions", () => {
        const invalidData = {
          ...validJobData,
          numberOfOpenPositions: undefined,
        };
        expect(() => jobValidator.createValidatedJob(invalidData)).toThrow(
          "Number of open positions is required and must be a number"
        );
      });

      it("should throw error for invalid numberOfOpenPositions type", () => {
        const invalidData = {
          ...validJobData,
          numberOfOpenPositions: "not a number" as unknown as number,
        };
        expect(() => jobValidator.createValidatedJob(invalidData)).toThrow(
          "Number of open positions is required and must be a number"
        );
      });

      it("should throw error for missing location", () => {
        const invalidData = { ...validJobData, location: undefined };
        expect(() => jobValidator.createValidatedJob(invalidData)).toThrow(
          "Location is required and must be a string"
        );
      });

      it("should throw error for missing closingDate", () => {
        const invalidData = { ...validJobData, closingDate: undefined };
        expect(() => jobValidator.createValidatedJob(invalidData)).toThrow(
          "Closing date is required"
        );
      });

      it("should throw error for missing band", () => {
        const invalidData = { ...validJobData, band: undefined };
        expect(() => jobValidator.createValidatedJob(invalidData)).toThrow(
          "Band is required and must be a string"
        );
      });

      it("should throw error for missing capability", () => {
        const invalidData = { ...validJobData, capability: undefined };
        expect(() => jobValidator.createValidatedJob(invalidData)).toThrow(
          "Capability is required and must be a string"
        );
      });
    });

    describe("enum validation errors", () => {
      it("should throw error for invalid band", () => {
        const invalidData = { ...validJobData, band: "InvalidBand" };
        expect(() => jobValidator.createValidatedJob(invalidData)).toThrow(
          "Invalid band. Must be one of: Junior, Mid, Senior, Principal"
        );
      });

      it("should throw error for invalid capability", () => {
        const invalidData = {
          ...validJobData,
          capability: "InvalidCapability",
        };
        expect(() => jobValidator.createValidatedJob(invalidData)).toThrow(
          "Invalid capability. Must be one of: Data, Workday, Engineering"
        );
      });

      it("should throw error for invalid status", () => {
        const invalidData = { ...validJobData, status: "invalid" };
        expect(() => jobValidator.createValidatedJob(invalidData)).toThrow(
          "Invalid status. Must be one of: open, closed, draft"
        );
      });
    });
  });
});
