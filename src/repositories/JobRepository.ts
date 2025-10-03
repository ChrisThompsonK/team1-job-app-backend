import type { Job } from "../models/JobModel";
import { Band, Capability, JobStatus } from "../models/JobModel";

// TEMPORARY: In-memory storage - replace with actual database when ready
class InMemoryJobStore {
  private jobs: Job[] = [
    // Sample job data to test with
    {
      id: "job_001",
      jobRoleName: "Senior Data Engineer",
      description:
        "We are looking for a Senior Data Engineer to join our Data team. You will be responsible for building robust data pipelines and ensuring data quality across our systems.",
      responsibilities: [
        "Design and implement scalable data pipelines",
        "Optimize data warehouse performance",
        "Collaborate with data scientists and analysts",
        "Ensure data quality and governance",
      ],
      jobSpecLink:
        "https://company.sharepoint.com/sites/hr/jobspecs/senior-data-engineer.pdf",
      location: "London, UK",
      capability: Capability.DATA,
      band: Band.E3,
      closingDate: new Date("2024-11-15"),
      status: JobStatus.OPEN,
      numberOfOpenPositions: 2,
    },
    {
      id: "job_002",
      jobRoleName: "Workday Integration Specialist",
      description:
        "Join our Workday team to help implement and maintain HR system integrations. Perfect opportunity to work with cutting-edge HR technology.",
      responsibilities: [
        "Configure Workday integrations",
        "Troubleshoot integration issues",
        "Support HR business processes",
        "Create technical documentation",
      ],
      jobSpecLink:
        "https://company.sharepoint.com/sites/hr/jobspecs/workday-specialist.pdf",
      location: "Manchester, UK",
      capability: Capability.WORKDAY,
      band: Band.E2,
      closingDate: new Date("2024-10-30"),
      status: JobStatus.OPEN,
      numberOfOpenPositions: 1,
    },
    {
      id: "job_003",
      jobRoleName: "Principal Software Engineer",
      description:
        "Lead our engineering team in building next-generation applications. This is a senior technical leadership role with significant impact.",
      responsibilities: [
        "Provide technical leadership and mentoring",
        "Architect complex software systems",
        "Drive engineering best practices",
        "Collaborate with product and design teams",
      ],
      jobSpecLink:
        "https://company.sharepoint.com/sites/hr/jobspecs/principal-engineer.pdf",
      location: "Remote, UK",
      capability: Capability.ENGINEERING,
      band: Band.E5,
      closingDate: new Date("2024-12-01"),
      status: JobStatus.OPEN,
      numberOfOpenPositions: 1,
    },
    {
      id: "job_004",
      jobRoleName: "Junior Data Analyst",
      description:
        "Entry-level position for someone passionate about data analysis and insights. Great opportunity to start your data career.",
      responsibilities: [
        "Create reports and dashboards",
        "Analyze business data trends",
        "Support senior analysts with projects",
        "Learn data visualization tools",
      ],
      jobSpecLink:
        "https://company.sharepoint.com/sites/hr/jobspecs/junior-analyst.pdf",
      location: "Birmingham, UK",
      capability: Capability.DATA,
      band: Band.E1,
      closingDate: new Date("2024-10-25"),
      status: JobStatus.DRAFT,
      numberOfOpenPositions: 3,
    },
  ];

  // Get all jobs
  getAllJobs(): Job[] {
    return [...this.jobs]; // Return a copy to prevent external modification
  }

  // Get job by ID
  getJobById(id: string): Job | null {
    return this.jobs.find((job) => job.id === id) || null;
  }
}

// Singleton instance for the temporary data store
const jobStore = new InMemoryJobStore();

export class JobRepository {
  // TEMPORARY: These methods use in-memory storage
  // TODO: Replace with actual database calls when database is ready

  async getAllJobs(): Promise<Job[]> {
    return jobStore.getAllJobs();
  }

  async getJobById(id: string): Promise<Job | null> {
    return jobStore.getJobById(id);
  }

  async createJobRole(job: Job): Promise<void> {
    //sql goes here
    console.log(job);
  }

  async editJobRole(job: Job): Promise<void> {
    //sql goes here
    console.log(job);
  }
}
