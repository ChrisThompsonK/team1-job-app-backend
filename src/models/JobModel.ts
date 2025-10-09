// Enums for structured data
export enum Band {
  JUNIOR = "Junior",
  MID = "Mid",
  SENIOR = "Senior",
  PRINCIPAL = "Principal",
}

export enum Capability {
  DATA = "Data",
  WORKDAY = "Workday",
  ENGINEERING = "Engineering",
  PRODUCT = "Product",
  DATA_ANALYTICS = "Data & Analytics",
  DESIGN = "Design",
  PLATFORM = "Platform",
  QUALITY = "Quality",
  ARCHITECTURE = "Architecture",
  BUSINESS_ANALYSIS = "Business Analysis",
  SECURITY = "Security",
}

export enum JobStatus {
  OPEN = "open",
  CLOSED = "closed",
  DRAFT = "draft",
}

// Job model representing a job posting with all required fields
export interface Job {
  id?: string; // Unique identifier for the job
  jobRoleName?: string; // The title/name of the job role
  description?: string; // Detailed job description
  responsibilities?: string[]; // Array of job responsibilities
  jobSpecLink?: string; // SharePoint link to the detailed job specification
  location?: string; // Where the job is located
  capability?: Capability; // The capability/department using enum
  band?: Band; // Job band/level using enum
  closingDate?: Date; // When applications close
  status?: JobStatus; // Current status of the job posting using enum
  numberOfOpenPositions?: number; // How many positions are available
}

// Sorting options for jobs
export enum SortBy {
  JOB_ROLE_NAME = "jobRoleName",
  CLOSING_DATE = "closingDate",
  BAND = "band",
  CAPABILITY = "capability",
  LOCATION = "location",
  CREATED_DATE = "createdDate",
}

export enum SortOrder {
  ASC = "asc",
  DESC = "desc",
}

// Enhanced interface for filtering and searching jobs
export interface JobFilters {
  // Basic filters
  capability?: Capability;
  band?: Band;
  location?: string;
  status?: JobStatus;

  // Text search (searches across jobRoleName, description, responsibilities)
  search?: string;

  // Pagination
  page?: number;
  limit?: number;

  // Sorting
  sortBy?: SortBy;
  sortOrder?: SortOrder;
}

// Response interface for paginated results
export interface PaginatedJobResponse {
  jobs: Job[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  filters: JobFilters;
}
