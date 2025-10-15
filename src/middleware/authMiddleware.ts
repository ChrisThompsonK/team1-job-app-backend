import { createClient } from "@libsql/client";
import type { NextFunction, Request, Response } from "express";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { env } from "../config/env.js";
import { user } from "../db/schemas/auth.js";
import { auth } from "../utils/auth.js";
import * as schema from "../db/schemas.js";

// Create database connection
const client = createClient({
  url: env.databaseUrl,
});

const db = drizzle(client, { schema });

/**
 * Helper function to get user details from database including isAdmin field
 */
const getUserFromDatabase = async (userId: string) => {
  const [userRecord] = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  
  return userRecord;
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
  next: NextFunction,
): Promise<void> => {
  try {
    // Get session from Better Auth
    const session = await auth.api.getSession({
      headers: req.headers as Record<string, string>,
    });

    if (!session || !session.user || !session.session) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Invalid or expired session",
      });
      return;
    }

    // Check if session is expired
    const now = new Date();
    const expiresAt = new Date(session.session.expiresAt);
    if (now > expiresAt) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Session has expired",
      });
      return;
    }

    // Get full user data from database to include isAdmin field
    const userRecord = await getUserFromDatabase(session.user.id);
    
    // Attach user and session info to request
    req.user = {
      id: session.user.id,
      ...(session.user.name && { name: session.user.name }),
      email: session.user.email,
      emailVerified: session.user.emailVerified || false,
      isAdmin: userRecord?.isAdmin || false,
      createdAt: session.user.createdAt,
      updatedAt: session.user.updatedAt,
    };

    req.session = {
      id: session.session.id,
      userId: session.session.userId,
      token: session.session.token,
      expiresAt: session.session.expiresAt,
      ...(session.session.ipAddress && { ipAddress: session.session.ipAddress }),
      ...(session.session.userAgent && { userAgent: session.session.userAgent }),
      createdAt: session.session.createdAt,
      updatedAt: session.session.updatedAt,
    };

    next();
  } catch (error) {
    console.error("Session validation error:", error);
    res.status(401).json({
      error: "Unauthorized",
      message: "Failed to validate session",
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
  next: NextFunction,
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
  next: NextFunction,
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
        // Get full user data from database to include isAdmin field
        const userRecord = await getUserFromDatabase(session.user.id);
        
        // Attach user and session info to request
        req.user = {
          id: session.user.id,
          ...(session.user.name && { name: session.user.name }),
          email: session.user.email,
          emailVerified: session.user.emailVerified || false,
          isAdmin: userRecord?.isAdmin || false,
          createdAt: session.user.createdAt,
          updatedAt: session.user.updatedAt,
        };

        req.session = {
          id: session.session.id,
          userId: session.session.userId,
          token: session.session.token,
          expiresAt: session.session.expiresAt,
          ...(session.session.ipAddress && { ipAddress: session.session.ipAddress }),
          ...(session.session.userAgent && { userAgent: session.session.userAgent }),
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