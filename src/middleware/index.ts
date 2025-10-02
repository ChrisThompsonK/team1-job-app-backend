import cors from "cors";
import express from "express";
import morgan from "morgan";

export function setupMiddleware(app: express.Express): void {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan("dev"));
  app.use(cors());
}
