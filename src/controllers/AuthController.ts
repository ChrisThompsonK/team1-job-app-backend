import { createClient } from "@libsql/client";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
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

  // POST /auth/login - User login
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new BusinessError("Email and password are required", 400);
      }

      // Use Better Auth to sign in
      const result = await auth.api.signInEmail({
        body: {
          email,
          password,
        },
      });

      if (!result || !result.user) {
        throw new BusinessError("Invalid email or password", 401);
      }

      // Fetch complete user data including isAdmin field
      const fullUserData = await this.db
        .select()
        .from(user)
        .where(eq(user.id, result.user.id))
        .limit(1);

      if (!fullUserData || fullUserData.length === 0) {
        throw new BusinessError("User data not found", 500);
      }

      const userData = fullUserData[0];

      // Create JWT token manually since Better Auth might be returning session token
      const jwtPayload = {
        sub: userData.id,
        email: userData.email,
        name: userData.name,
        isAdmin: userData.isAdmin || false,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
      };

      const jwtToken = jwt.sign(jwtPayload, env.betterAuthSecret, {
        algorithm: "HS256",
      });

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            emailVerified: userData.emailVerified,
            isAdmin: userData.isAdmin || false,
          },
          token: jwtToken,
        },
      });
    } catch (error) {
      if (error instanceof BusinessError) {
        throw error;
      }
      throw new BusinessError(
        error instanceof Error ? error.message : "Login failed",
        401
      );
    }
  }
}
