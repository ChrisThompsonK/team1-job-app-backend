import { createClient } from "@libsql/client";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import type { Request, Response } from "express";
import { env } from "../config/env.js";
import { user } from "../db/schemas/auth.js";
import * as schema from "../db/schemas.js";
import { BusinessError } from "../middleware/errorHandler.js";
import { auth } from "../utils/auth.js";
import { ProfileValidator } from "../validators/ProfileValidator.js";

// Create database connection
const client = createClient({
  url: env.databaseUrl,
});

const db = drizzle(client, { schema });

export class AuthController {
  private profileValidator = new ProfileValidator();

  // GET /auth/profile - Get current user session
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
            phoneNumber: req.user.phoneNumber,
            address: req.user.address,
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

  // PUT /auth/profile - Update user profile (comprehensive update)
  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      // User data is already attached by requireAuth middleware
      if (!req.user) {
        throw new BusinessError("Not authenticated", 401);
      }

      // Validate the update request using ProfileValidator
      const validatedData = this.profileValidator.validateProfileUpdate(
        req.body
      );

      let updatedUser: {
        id: string;
        name: string | null;
        email: string;
        emailVerified: boolean | null;
        isAdmin: boolean | null;
        phoneNumber: string | null;
        address: string | null;
      } | null = null;
      const responseMessages: string[] = [];

      // Handle basic fields update (name, phone, address)
      if (Object.keys(validatedData.basicFields).length > 0) {
        // Check if email already exists (if updating email)
        if (validatedData.emailUpdate) {
          const [existingUser] = await db
            .select({ id: user.id })
            .from(user)
            .where(eq(user.email, validatedData.emailUpdate.newEmail))
            .limit(1);

          if (existingUser && existingUser.id !== req.user.id) {
            throw new BusinessError("Email already in use", 409);
          }
        }

        // Update basic fields in database
        const updateData: {
          name?: string;
          phoneNumber?: string | null;
          address?: string | null;
          updatedAt: Date;
        } = {
          ...validatedData.basicFields,
          updatedAt: new Date(),
        };

        await db.update(user).set(updateData).where(eq(user.id, req.user.id));

        responseMessages.push("Profile information updated successfully");
      }

      // Handle email update using Better Auth
      if (validatedData.emailUpdate) {
        try {
          await auth.api.changeEmail({
            body: {
              newEmail: validatedData.emailUpdate.newEmail,
            },
            headers: req.headers as Record<string, string>,
          });
          responseMessages.push("Email updated successfully");
        } catch (_authError) {
          throw new BusinessError(
            "Failed to update email. Please check your current password.",
            400
          );
        }
      }

      // Handle password update using Better Auth
      if (validatedData.passwordUpdate) {
        try {
          await auth.api.changePassword({
            body: {
              currentPassword: validatedData.passwordUpdate.currentPassword,
              newPassword: validatedData.passwordUpdate.newPassword,
            },
            headers: req.headers as Record<string, string>,
          });
          responseMessages.push("Password updated successfully");
        } catch (_authError) {
          throw new BusinessError(
            "Failed to update password. Please check your current password.",
            400
          );
        }
      }

      // Fetch updated user data
      const userQueryResult = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          isAdmin: user.isAdmin,
          phoneNumber: user.phoneNumber,
          address: user.address,
        })
        .from(user)
        .where(eq(user.id, req.user.id))
        .limit(1);

      updatedUser = userQueryResult[0] || null;

      if (!updatedUser) {
        throw new BusinessError("User not found", 404);
      }

      res.status(200).json({
        success: true,
        message: responseMessages.join(". "),
        data: {
          user: updatedUser,
        },
      });
    } catch (error) {
      if (error instanceof BusinessError) {
        throw error;
      }
      throw new BusinessError(
        error instanceof Error ? error.message : "Failed to update profile",
        500
      );
    }
  }
}
