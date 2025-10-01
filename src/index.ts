import type { Request, Response } from "express";
import express from "express";

const app = express();
const port = 3000;
// Middleware to parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Hello World endpoint
app.get("/", (_req: Request, res: Response) => {
  res.json({
    title: "Job Application Frontend",
    message: "Welcome to the Job Application System",
  });
});

// API Hello World endpoint
app.get("/api", (_req: Request, res: Response) => {
  res.json({ message: "Hello World! 🌍" });
});

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
