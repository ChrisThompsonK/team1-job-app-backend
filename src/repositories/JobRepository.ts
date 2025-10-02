import type { Job } from "../models/JobModel";

export class JobRepository {
  private jobs: Job[] = [
    {
      id: "1",
      title: "Software Developer",
      company: "Tech Corp",
      description: "Develop amazing software",
      location: "Remote",
      salary: "$80,000",
      createdAt: new Date(),
    },
    {
      id: "2",
      title: "Product Manager",
      company: "StartupXYZ",
      description: "Manage product development",
      location: "New York",
      salary: "$90,000",
      createdAt: new Date(),
    },
  ];

  async findAll(): Promise<Job[]> {
    return this.jobs;
  }

  async findById(id: string): Promise<Job | null> {
    const job = this.jobs.find((job) => job.id === id);
    return job || null;
  }

  async create(jobData: Omit<Job, "id" | "createdAt">): Promise<Job> {
    const newJob: Job = {
      id: Math.random().toString(36).substr(2, 9),
      ...jobData,
      createdAt: new Date(),
    };
    this.jobs.push(newJob);
    return newJob;
  }

  async delete(id: string): Promise<boolean> {
    const initialLength = this.jobs.length;
    this.jobs = this.jobs.filter((job) => job.id !== id);
    return this.jobs.length < initialLength;
  }
}
