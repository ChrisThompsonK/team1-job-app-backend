import cors from "cors";
import type { Express } from "express";
import express from "express";
import morgan from "morgan";
import { env } from "../config/env.js";

export const configureMiddleware = (app: Express): void => {
  // Middleware to parse JSON
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan("dev"));
  
  // Configure CORS with environment variable
  const corsOrigin = env.corsOrigin === "*" ? "*" : env.corsOrigin.split(",");
  app.use(
    cors({
      origin: corsOrigin,
      credentials: true,
    })
  );
};
