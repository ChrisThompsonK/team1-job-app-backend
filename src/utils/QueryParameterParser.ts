import type { Request } from "express";
import {
  Band,
  Capability,
  type JobFilters,
  JobStatus,
  SortBy,
  SortOrder,
} from "../models/JobModel.js";

/**
 * Parse capability enum from string
 */
function parseCapability(value: string): Capability | null {
  const upperValue = value.toUpperCase();
  return (
    Object.values(Capability).find((cap) => cap.toUpperCase() === upperValue) ||
    null
  );
}

/**
 * Parse band enum from string
 */
function parseBand(value: string): Band | null {
  const upperValue = value.toUpperCase();
  return (
    Object.values(Band).find((band) => band.toUpperCase() === upperValue) ||
    null
  );
}

/**
 * Parse job status enum from string
 */
function parseJobStatus(value: string): JobStatus | null {
  const lowerValue = value.toLowerCase();
  return (
    Object.values(JobStatus).find(
      (status) => status.toLowerCase() === lowerValue
    ) || null
  );
}

/**
 * Parse sort by enum from string
 */
function parseSortBy(value: string): SortBy | null {
  const lowerValue = value.toLowerCase();
  return (
    Object.values(SortBy).find(
      (sortBy) => sortBy.toLowerCase() === lowerValue
    ) || null
  );
}

/**
 * Parse sort order enum from string
 */
function parseSortOrder(value: string): SortOrder | null {
  const lowerValue = value.toLowerCase();
  return (
    Object.values(SortOrder).find(
      (order) => order.toLowerCase() === lowerValue
    ) || null
  );
}

/**
 * Parse date from string (supports YYYY-MM-DD format)
 */
function _parseDate(value: string): Date | null {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Parse positive integer from string
 */
function parsePositiveInteger(value: string): number | null {
  const num = parseInt(value, 10);
  return Number.isNaN(num) || num < 0 ? null : num;
}

/**
 * Parse and validate query parameters from Express request
 * @param req Express request object
 * @returns Validated JobFilters object with defaults applied
 */
export function parseJobFilters(req: Request): JobFilters {
  const query = req.query;
  const filters: JobFilters = {};

  // Parse basic enum filters
  if (query.capability && typeof query.capability === "string") {
    const capability = parseCapability(query.capability);
    if (capability) filters.capability = capability;
  }

  if (query.band && typeof query.band === "string") {
    const band = parseBand(query.band);
    if (band) filters.band = band;
  }

  if (query.status && typeof query.status === "string") {
    const status = parseJobStatus(query.status);
    if (status) filters.status = status;
  }

  // Parse string filters
  if (query.location && typeof query.location === "string") {
    filters.location = query.location.trim();
  }

  if (query.search && typeof query.search === "string") {
    filters.search = query.search.trim();
  }

  // Parse pagination
  if (query.page && typeof query.page === "string") {
    const page = parsePositiveInteger(query.page);
    filters.page = page && page > 0 ? page : 1;
  } else {
    filters.page = 1;
  }

  if (query.limit && typeof query.limit === "string") {
    const limit = parsePositiveInteger(query.limit);
    filters.limit = limit && limit > 0 && limit <= 100 ? limit : 10;
  } else {
    filters.limit = 10;
  }

  // Parse sorting
  if (query.sortBy && typeof query.sortBy === "string") {
    const sortBy = parseSortBy(query.sortBy);
    if (sortBy) filters.sortBy = sortBy;
  }

  if (query.sortOrder && typeof query.sortOrder === "string") {
    const sortOrder = parseSortOrder(query.sortOrder);
    filters.sortOrder = sortOrder || SortOrder.ASC;
  } else {
    filters.sortOrder = SortOrder.ASC;
  }

  return filters;
}

/**
 * Generate a human-readable description of active filters
 * @param filters JobFilters object
 * @returns Human-readable description string
 */
export function describeFilters(filters: JobFilters): string {
  const descriptions: string[] = [];

  if (filters.capability) {
    descriptions.push(`capability: ${filters.capability}`);
  }
  if (filters.band) {
    descriptions.push(`band: ${filters.band}`);
  }
  if (filters.status) {
    descriptions.push(`status: ${filters.status}`);
  }
  if (filters.location) {
    descriptions.push(`location: "${filters.location}"`);
  }
  if (filters.search) {
    descriptions.push(`search: "${filters.search}"`);
  }

  return descriptions.length > 0
    ? `Active filters: ${descriptions.join(", ")}`
    : "No filters applied";
}
