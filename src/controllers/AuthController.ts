import type { Request, Response } from "express";
import { BusinessError } from "../middleware/errorHandler.js";

export class AuthController {
  // GET /auth/me - Get current user session
  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      // User data is already attached by requireAuth middleware
      if (!req.user) {
        throw new BusinessError("Not authenticated", 401);
      }

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: req.user.id,
            name: req.user.name,
            email: req.user.email,
            emailVerified: req.user.emailVerified,
            isAdmin: req.user.isAdmin || false,
          },
        },
      });
    } catch (error) {
      if (error instanceof BusinessError) {
        throw error;
      }
      throw new BusinessError(
        error instanceof Error ? error.message : "Authentication failed",
        401
      );
    }
  }
}
