import type { NextFunction, Request, Response } from "express";

// Custom error class for business logic errors
export class BusinessError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = "BusinessError";
    this.statusCode = statusCode;
  }
}

// Custom error class for not found errors
export class NotFoundError extends BusinessError {
  constructor(message: string = "Resource not found") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

// Type for async route handlers
type AsyncRouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

// Middleware to wrap async route handlers and catch errors
export const asyncHandler = (fn: AsyncRouteHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Global error handling middleware
export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error("Error:", error);

  // Handle custom business errors
  if (error instanceof BusinessError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
    return;
  }

  // Handle validation errors (like invalid enum values)
  if (
    error.message.includes("Invalid capability") ||
    error.message.includes("Invalid band") ||
    error.message.includes("Invalid status")
  ) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
    return;
  }

  // Handle generic errors
  res.status(500).json({
    success: false,
    message: "An unexpected error occurred",
  });
};

// Middleware for handling 404 routes
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
};
