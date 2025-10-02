import cors from "cors";
import type { Express } from "express";
import express from "express";
import morgan from "morgan";

export const configureMiddleware = (app: Express): void => {
  // Middleware to parse JSON
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan("dev"));
  app.use(cors());
};
