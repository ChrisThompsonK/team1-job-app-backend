export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  location?: string;
  salary?: string;
  createdAt: Date;
}
