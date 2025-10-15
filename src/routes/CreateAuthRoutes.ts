import { Router } from "express";
import type { AuthController } from "../controllers/AuthController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const createAuthRoutes = (authController: AuthController) => {
  const router = Router();

  // Authentication routes - all wrapped with asyncHandler for error handling
  // Note: Login is now handled by Better Auth directly at /api/auth/sign-in/email

  router.get(
    "/profile",
    asyncHandler(authController.getCurrentUser.bind(authController))
  );

  return router;
};
