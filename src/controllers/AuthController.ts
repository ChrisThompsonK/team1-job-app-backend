import { createClient } from "@libsql/client";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import type { Request, Response } from "express";
import { env } from "../config/env.js";
import { user } from "../db/schemas/auth.js";
import { BusinessError } from "../middleware/errorHandler.js";
import { auth } from "../utils/auth.js";

export class AuthController {
  private db;

  constructor() {
    const client = createClient({
      url: env.databaseUrl,
    });
    this.db = drizzle(client);
  }

  // GET /auth/me - Get current user session
  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      // Get session from cookie
      const session = await auth.api.getSession({
        headers: {
          cookie: req.headers.cookie || "",
        },
      });

      if (!session || !session.user) {
        throw new BusinessError("Not authenticated", 401);
      }

      // Fetch complete user data including isAdmin field
      const fullUserData = await this.db
        .select()
        .from(user)
        .where(eq(user.id, session.user.id))
        .limit(1);

      if (!fullUserData || fullUserData.length === 0) {
        throw new BusinessError("User data not found", 500);
      }

      const userData = fullUserData[0];
      if (!userData) {
        throw new BusinessError("User data not found", 500);
      }

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            emailVerified: userData.emailVerified,
            isAdmin: userData.isAdmin || false,
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
