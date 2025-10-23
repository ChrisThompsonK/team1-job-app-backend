import { Router } from "express";
import type { AuthController } from "../controllers/AuthController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const createAuthRoutes = (authController: AuthController) => {
  const router = Router();

  // Authentication routes - all wrapped with asyncHandler for error handling
  // Note: Login is now handled by Better Auth directly at /api/auth/sign-in/email

  // GET /auth/profile - Get current user profile
  router.get(
    "/profile",
    requireAuth, // Require authentication to get current user
    asyncHandler(authController.getCurrentUser.bind(authController))
  );

  // PUT /auth/profile - Update user profile (comprehensive update)
  router.put(
    "/profile",
    requireAuth, // Require authentication to update profile
    asyncHandler(authController.updateProfile.bind(authController))
  );

  return router;
};
