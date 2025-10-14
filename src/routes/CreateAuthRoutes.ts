import { Router } from "express";
import type { AuthController } from "../controllers/AuthController.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const createAuthRoutes = (authController: AuthController) => {
  const router = Router();

  // Authentication routes - all wrapped with asyncHandler for error handling
  router.post(
    "/auth/login",
    asyncHandler(authController.login.bind(authController))
  );

  return router;
};
