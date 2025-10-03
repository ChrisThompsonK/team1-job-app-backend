import type { Request } from "express";
import { describe, expect, it } from "vitest";
import {
  Band,
  Capability,
  JobStatus,
  SortBy,
  SortOrder,
} from "../models/JobModel";
import {
  describeFilters,
  parseJobFilters,
} from "../utils/QueryParameterParser";

describe("QueryParameterParser Functions", () => {
  describe("parseJobFilters", () => {
    it("should parse all valid query parameters correctly", () => {
      const mockRequest = {
        query: {
          capability: "DATA",
          band: "E3",
          status: "open",
          location: "London",
          search: "engineer",
          closingDateFrom: "2024-10-01",
          closingDateTo: "2024-12-31",
          minPositions: "2",
          maxPositions: "10",
          page: "2",
          limit: "5",
          sortBy: "jobRoleName",
          sortOrder: "desc",
        },
      } as Partial<Request>;

      const result = parseJobFilters(mockRequest as Request);

      expect(result).toEqual({
        capability: Capability.DATA,
        band: Band.E3,
        status: JobStatus.OPEN,
        location: "London",
        search: "engineer",
        closingDateFrom: new Date("2024-10-01"),
        closingDateTo: new Date("2024-12-31"),
        minPositions: 2,
        maxPositions: 10,
        page: 2,
        limit: 5,
        sortBy: SortBy.JOB_ROLE_NAME,
        sortOrder: SortOrder.DESC,
      });
    });

    it("should apply default values for pagination", () => {
      const mockRequest = { query: {} } as Partial<Request>;

      const result = parseJobFilters(mockRequest as Request);

      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.sortOrder).toBe(SortOrder.ASC);
    });

    it("should handle invalid enum values gracefully", () => {
      const mockRequest = {
        query: {
          capability: "INVALID_CAPABILITY",
          band: "INVALID_BAND",
          status: "invalid_status",
          sortBy: "invalid_sort",
          sortOrder: "invalid_order",
        },
      } as Partial<Request>;

      const result = parseJobFilters(mockRequest as Request);

      expect(result.capability).toBeUndefined();
      expect(result.band).toBeUndefined();
      expect(result.status).toBeUndefined();
      expect(result.sortBy).toBeUndefined();
      expect(result.sortOrder).toBe(SortOrder.ASC); // Falls back to default
    });

    it("should handle invalid date formats", () => {
      const mockRequest = {
        query: {
          closingDateFrom: "invalid-date",
          closingDateTo: "not-a-date",
        },
      } as Partial<Request>;

      const result = parseJobFilters(mockRequest as Request);

      expect(result.closingDateFrom).toBeUndefined();
      expect(result.closingDateTo).toBeUndefined();
    });

    it("should handle invalid number formats", () => {
      const mockRequest = {
        query: {
          minPositions: "not-a-number",
          maxPositions: "-5",
          page: "0",
          limit: "150",
        },
      } as Partial<Request>;

      const result = parseJobFilters(mockRequest as Request);

      expect(result.minPositions).toBeUndefined();
      expect(result.maxPositions).toBeUndefined();
      expect(result.page).toBe(1); // Invalid page defaults to 1
      expect(result.limit).toBe(10); // Invalid limit defaults to 10
    });

    it("should trim whitespace from string values", () => {
      const mockRequest = {
        query: {
          location: "  London  ",
          search: "  software engineer  ",
        },
      } as Partial<Request>;

      const result = parseJobFilters(mockRequest as Request);

      expect(result.location).toBe("London");
      expect(result.search).toBe("software engineer");
    });

    it("should handle case-insensitive enum parsing", () => {
      const mockRequest = {
        query: {
          capability: "data",
          band: "e3",
          status: "OPEN",
          sortBy: "JOBROLE_NAME",
          sortOrder: "DESC",
        },
      } as Partial<Request>;

      const result = parseJobFilters(mockRequest as Request);

      expect(result.capability).toBe(Capability.DATA);
      expect(result.band).toBe(Band.E3);
      expect(result.status).toBe(JobStatus.OPEN);
      expect(result.sortOrder).toBe(SortOrder.DESC);
    });

    it("should validate limit boundaries", () => {
      const mockRequest1 = { query: { limit: "0" } } as Partial<Request>;
      const mockRequest2 = { query: { limit: "200" } } as Partial<Request>;

      const result1 = parseJobFilters(mockRequest1 as Request);
      const result2 = parseJobFilters(mockRequest2 as Request);

      expect(result1.limit).toBe(10); // Invalid, falls back to default
      expect(result2.limit).toBe(10); // Over limit, falls back to default
    });
  });

  describe("describeFilters", () => {
    it("should describe active filters correctly", () => {
      const filters = {
        capability: Capability.DATA,
        band: Band.E3,
        location: "London",
        search: "engineer",
        minPositions: 2,
      };

      const result = describeFilters(filters);

      expect(result).toContain("capability: Data");
      expect(result).toContain("band: E3");
      expect(result).toContain('location: "London"');
      expect(result).toContain('search: "engineer"');
      expect(result).toContain("min positions: 2");
    });

    it("should handle date filters in description", () => {
      const filters = {
        closingDateFrom: new Date("2024-10-01"),
        closingDateTo: new Date("2024-12-31"),
      };

      const result = describeFilters(filters);

      expect(result).toContain("closing after: 2024-10-01");
      expect(result).toContain("closing before: 2024-12-31");
    });

    it("should return no filters message when no filters are active", () => {
      const filters = {
        page: 1,
        limit: 10,
        sortOrder: SortOrder.ASC,
      };

      const result = describeFilters(filters);

      expect(result).toBe("No filters applied");
    });
  });
});
