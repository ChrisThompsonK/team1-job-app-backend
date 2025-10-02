import cors from "cors";
import morgan from "morgan";
import express from "express";
    
export function setupMiddleware(app: express.Express): void {
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(morgan("dev"));
    app.use(cors());
}