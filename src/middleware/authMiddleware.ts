import { createClient } from "@libsql/client";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { user } from "../db/schemas/auth.js";
import * as schema from "../db/schemas.js";
import { auth } from "../utils/auth.js";

// Create database connection
const client = createClient({
  url: env.databaseUrl,
});

const db = drizzle(client, { schema });

/**
 * Helper function to get additional user fields from database
 * Optimized to fetch only what we need since Better Auth already provides basic user data
 */
const getUserAdditionalFields = async (
  userId: string
): Promise<{
  isAdmin: boolean;
  phoneNumber?: string;
  address?: string;
}> => {
  console.log("🔍 Fetching additional user fields for userId:", userId);

  try {
    const [userRecord] = await db
      .select({
        isAdmin: user.isAdmin,
        phoneNumber: user.phoneNumber,
        address: user.address,
      })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    console.log("📊 Database query result:", userRecord || "No user found");

    const result = {
      isAdmin: userRecord?.isAdmin || false,
      ...(userRecord?.phoneNumber && { phoneNumber: userRecord.phoneNumber }),
      ...(userRecord?.address && { address: userRecord.address }),
    };

    console.log("✅ Returning user fields:", result);
    return result;
  } catch (dbError) {
    console.error("🚨 Database error in getUserAdditionalFields:", {
      error: dbError instanceof Error ? dbError.message : String(dbError),
      userId,
    });
    // Return default values if database query fails
    return { isAdmin: false };
  }
};

// Extend Express Request type to include user information
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name?: string;
        email: string;
        emailVerified?: boolean;
        isAdmin?: boolean;
        phoneNumber?: string;
        address?: string;
        createdAt: Date;
        updatedAt: Date;
      };
      session?: {
        id: string;
        userId: string;
        token: string;
        expiresAt: Date;
        ipAddress?: string;
        userAgent?: string;
        createdAt: Date;
        updatedAt: Date;
      };
    }
  }
}

/**
 * Middleware to validate session cookie and authenticate users
 * Adds user and session information to the request object if valid
 */
export const validateSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log("🔐 AUTH MIDDLEWARE DEBUG:");
    console.log("📍 Request details:", {
      method: req.method,
      url: req.url,
      headers: {
        "content-type": req.headers["content-type"],
        "user-agent": req.headers["user-agent"],
        cookie: req.headers.cookie || "NO COOKIES",
        authorization: req.headers.authorization || "NO AUTH HEADER",
      },
      timestamp: new Date().toISOString(),
    });

    // Get session from Better Auth (this validates the session cookie)
    console.log("🔍 Calling auth.api.getSession...");
    const session = await auth.api.getSession({
      headers: req.headers as Record<string, string>,
    });

    console.log("📊 Session result:", {
      hasSession: !!session,
      hasUser: !!session?.user,
      hasSessionData: !!session?.session,
      userId: session?.user?.id || "NO USER ID",
      userEmail: session?.user?.email || "NO EMAIL",
      sessionExpiry: session?.session?.expiresAt || "NO EXPIRY",
    });

    if (!session || !session.user || !session.session) {
      console.log("❌ Session validation failed: No session or user data");
      res.status(401).json({
        error: "Unauthorized",
        message: "Invalid or expired session",
      });
      return;
    }

    // Check if session is expired
    const now = new Date();
    const expiresAt = new Date(session.session.expiresAt);
    console.log("⏰ Session expiry check:", {
      now: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      isExpired: now > expiresAt,
    });

    if (now > expiresAt) {
      console.log("❌ Session expired");
      res.status(401).json({
        error: "Unauthorized",
        message: "Session has expired",
      });
      return;
    }

    console.log("🔍 Fetching additional user fields from database...");
    // Single optimized database query to get additional user fields
    // Better Auth already validated the user exists and provided user data
    const additionalFields = await getUserAdditionalFields(session.user.id);
    console.log("📊 Additional fields result:", additionalFields);

    // Attach user and session info to request
    req.user = {
      id: session.user.id,
      ...(session.user.name && { name: session.user.name }),
      email: session.user.email,
      emailVerified: session.user.emailVerified || false,
      isAdmin: additionalFields.isAdmin,
      ...(additionalFields.phoneNumber && {
        phoneNumber: additionalFields.phoneNumber,
      }),
      ...(additionalFields.address && { address: additionalFields.address }),
      createdAt: session.user.createdAt,
      updatedAt: session.user.updatedAt,
    };

    req.session = {
      id: session.session.id,
      userId: session.session.userId,
      token: session.session.token,
      expiresAt: session.session.expiresAt,
      ...(session.session.ipAddress && {
        ipAddress: session.session.ipAddress,
      }),
      ...(session.session.userAgent && {
        userAgent: session.session.userAgent,
      }),
      createdAt: session.session.createdAt,
      updatedAt: session.session.updatedAt,
    };

    console.log("✅ Authentication successful:", {
      userId: req.user.id,
      email: req.user.email,
      isAdmin: req.user.isAdmin,
      sessionId: req.session.id,
    });

    next();
  } catch (error) {
    console.error("🚨 SESSION VALIDATION ERROR:");
    console.error("💥 Error details:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : "No stack trace",
      timestamp: new Date().toISOString(),
    });
    console.error("📍 Request context:", {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
    });

    res.status(401).json({
      error: "Unauthorized",
      message: "Failed to validate session",
      ...(process.env.NODE_ENV === "development" && {
        debug: error instanceof Error ? error.message : String(error),
      }),
    });
  }
};

/**
 * Middleware that requires a valid session
 * Returns 401 if no valid session is found
 */
export const requireAuth = validateSession;

/**
 * Middleware that requires admin privileges
 * Must be used after requireAuth middleware
 */
export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      error: "Unauthorized",
      message: "Authentication required",
    });
    return;
  }

  if (!req.user.isAdmin) {
    res.status(403).json({
      error: "Forbidden",
      message: "Admin privileges required",
    });
    return;
  }

  next();
};

/**
 * Optional middleware that validates session if present
 * Does not return error if no session, just continues without user info
 */
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get session from Better Auth
    const session = await auth.api.getSession({
      headers: req.headers as Record<string, string>,
    });

    if (session?.user && session?.session) {
      // Check if session is not expired
      const now = new Date();
      const expiresAt = new Date(session.session.expiresAt);
      if (now <= expiresAt) {
        // Single optimized database query to get additional user fields
        const additionalFields = await getUserAdditionalFields(session.user.id);

        // Attach user and session info to request
        req.user = {
          id: session.user.id,
          ...(session.user.name && { name: session.user.name }),
          email: session.user.email,
          emailVerified: session.user.emailVerified || false,
          isAdmin: additionalFields.isAdmin,
          ...(additionalFields.phoneNumber && {
            phoneNumber: additionalFields.phoneNumber,
          }),
          ...(additionalFields.address && {
            address: additionalFields.address,
          }),
          createdAt: session.user.createdAt,
          updatedAt: session.user.updatedAt,
        };

        req.session = {
          id: session.session.id,
          userId: session.session.userId,
          token: session.session.token,
          expiresAt: session.session.expiresAt,
          ...(session.session.ipAddress && {
            ipAddress: session.session.ipAddress,
          }),
          ...(session.session.userAgent && {
            userAgent: session.session.userAgent,
          }),
          createdAt: session.session.createdAt,
          updatedAt: session.session.updatedAt,
        };
      }
    }

    // Continue regardless of session validity
    next();
  } catch (error) {
    console.error("Optional auth validation error:", error);
    // Continue even if there's an error
    next();
  }
};
