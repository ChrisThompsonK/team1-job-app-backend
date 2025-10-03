import { jobsTable } from "../schemas/jobs";

export const jobRolesSeeds: typeof jobsTable.$inferInsert[] = [
  {
    jobRoleName: "Senior Software Engineer",
    description:
      "Lead development of complex software solutions and mentor junior developers",
    responsibilities:
      "Design and implement scalable software systems, code review, technical leadership, mentoring team members",
    jobSpecLink: "https://company.com/careers/senior-software-engineer",
    location: "London, UK",
    capability: "Engineering",
    band: "Senior",
    closingDate: "2025-11-15",
    status: "Open",
    numberOfOpenPositions: 3,
  },
  {
    jobRoleName: "Product Manager",
    description:
      "Drive product strategy and work with cross-functional teams to deliver exceptional user experiences",
    responsibilities:
      "Product roadmap planning, stakeholder management, user research, feature prioritization, market analysis",
    jobSpecLink: "https://company.com/careers/product-manager",
    location: "Manchester, UK",
    capability: "Product",
    band: "Mid",
    closingDate: "2025-10-30",
    status: "Open",
    numberOfOpenPositions: 2,
  },
  {
    jobRoleName: "Data Scientist",
    description:
      "Analyze complex datasets to derive insights and build predictive models",
    responsibilities:
      "Data analysis, machine learning model development, statistical analysis, data visualization, reporting",
    jobSpecLink: "https://company.com/careers/data-scientist",
    location: "Birmingham, UK",
    capability: "Data & Analytics",
    band: "Mid",
    closingDate: "2025-12-01",
    status: "Open",
    numberOfOpenPositions: 1,
  },
  {
    jobRoleName: "UX Designer",
    description:
      "Create intuitive and engaging user experiences for digital products",
    responsibilities:
      "User research, wireframing, prototyping, usability testing, design systems, collaboration with developers",
    jobSpecLink: "https://company.com/careers/ux-designer",
    location: "Remote, UK",
    capability: "Design",
    band: "Junior",
    closingDate: "2025-11-20",
    status: "Open",
    numberOfOpenPositions: 2,
  },
  {
    jobRoleName: "DevOps Engineer",
    description:
      "Maintain and improve infrastructure, CI/CD pipelines, and deployment processes",
    responsibilities:
      "Infrastructure management, automation, monitoring, security implementation, cloud services management",
    jobSpecLink: "https://company.com/careers/devops-engineer",
    location: "Edinburgh, UK",
    capability: "Platform",
    band: "Senior",
    closingDate: "2025-10-25",
    status: "Open",
    numberOfOpenPositions: 1,
  },
  {
    jobRoleName: "Frontend Developer",
    description:
      "Build responsive and interactive user interfaces using modern web technologies",
    responsibilities:
      "React/Vue development, responsive design, performance optimization, testing, accessibility implementation",
    jobSpecLink: "https://company.com/careers/frontend-developer",
    location: "Bristol, UK",
    capability: "Engineering",
    band: "Mid",
    closingDate: "2025-11-10",
    status: "Open",
    numberOfOpenPositions: 4,
  },
  {
    jobRoleName: "QA Engineer",
    description:
      "Ensure software quality through comprehensive testing strategies and automation",
    responsibilities:
      "Test planning, automated testing, manual testing, bug reporting, quality assurance processes",
    jobSpecLink: "https://company.com/careers/qa-engineer",
    location: "Leeds, UK",
    capability: "Quality",
    band: "Junior",
    closingDate: "2025-11-05",
    status: "Open",
    numberOfOpenPositions: 2,
  },
  {
    jobRoleName: "Solutions Architect",
    description:
      "Design enterprise-level technical solutions and guide implementation strategies",
    responsibilities:
      "Architecture design, technical documentation, stakeholder consultation, technology evaluation",
    jobSpecLink: "https://company.com/careers/solutions-architect",
    location: "London, UK",
    capability: "Architecture",
    band: "Principal",
    closingDate: "2025-12-15",
    status: "Open",
    numberOfOpenPositions: 1,
  },
  {
    jobRoleName: "Business Analyst",
    description:
      "Bridge business requirements with technical solutions and process improvements",
    responsibilities:
      "Requirements gathering, process analysis, stakeholder management, documentation, solution design",
    jobSpecLink: "https://company.com/careers/business-analyst",
    location: "Cardiff, UK",
    capability: "Business Analysis",
    band: "Mid",
    closingDate: "2025-10-28",
    status: "Closed",
    numberOfOpenPositions: 0,
  },
  {
    jobRoleName: "Cybersecurity Specialist",
    description:
      "Protect organizational assets through security monitoring and threat analysis",
    responsibilities:
      "Security monitoring, vulnerability assessment, incident response, security policy development",
    jobSpecLink: "https://company.com/careers/cybersecurity-specialist",
    location: "Glasgow, UK",
    capability: "Security",
    band: "Senior",
    closingDate: "2025-11-30",
    status: "Open",
    numberOfOpenPositions: 2,
  },
];

export { jobsTable as jobRolesTable };
