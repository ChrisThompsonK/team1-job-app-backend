// Enums for structured data
export enum Band {
  E1 = "E1",
  E2 = "E2",
  E3 = "E3",
  E4 = "E4",
  E5 = "E5",
}

export enum Capability {
  DATA = "Data",
  WORKDAY = "Workday",
  ENGINEERING = "Engineering",
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

// This interface can be used for filtering jobs
export interface JobFilters {
  capability?: Capability;
  band?: Band;
  location?: string;
  status?: JobStatus;
}
