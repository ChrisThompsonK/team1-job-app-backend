import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Create mock functions first
const mockGetSession = vi.fn();
const mockDbLimit = vi.fn();
const mockDbWhere = vi.fn();
const mockDbFrom = vi.fn();
const mockDbSelect = vi.fn();

// Mock modules
vi.mock("../config/env.js", () => ({
  env: {
    databaseUrl: "file:test.db",
  },
}));

vi.mock("../db/schemas.js", () => ({}));

vi.mock("../db/schemas/auth.js", () => ({
  user: {
    id: "id",
    isAdmin: "isAdmin",
  },
}));

vi.mock("@libsql/client", () => ({
  createClient: vi.fn(() => ({})),
}));

vi.mock("drizzle-orm/libsql", () => ({
  drizzle: vi.fn(() => ({
    select: mockDbSelect,
  })),
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn(),
}));

vi.mock("../utils/auth.js", () => ({
  auth: {
    api: {
      getSession: mockGetSession,
    },
  },
}));

// Import the middleware after mocking
const { requireAuth, requireAdmin, optionalAuth } = await import(
  "./authMiddleware.js"
);

describe("Auth Middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: vi.fn(() => mockResponse as Response),
      json: vi.fn(() => mockResponse as Response),
    };
    mockNext = vi.fn();

    // Setup database mocking chain
    mockDbSelect.mockReturnValue({
      from: mockDbFrom,
    });
    mockDbFrom.mockReturnValue({
      where: mockDbWhere,
    });
    mockDbWhere.mockReturnValue({
      limit: mockDbLimit,
    });
    mockDbLimit.mockResolvedValue([{ id: "user1", isAdmin: true }]);
  });

  describe("requireAuth", () => {
    it("should call next if valid session exists", async () => {
      mockGetSession.mockResolvedValue({
        user: {
          id: "user1",
          email: "test@example.com",
          name: "Test User",
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        session: {
          id: "session1",
          userId: "user1",
          token: "token123",
          expiresAt: new Date(Date.now() + 86400000), // 24 hours from now
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      await requireAuth(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.user).toBeDefined();
      expect(mockRequest.user?.id).toBe("user1");
      expect(mockRequest.user?.isAdmin).toBe(true);
    });

    it("should return 401 if no session exists", async () => {
      mockGetSession.mockResolvedValue(null);

      await requireAuth(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Unauthorized",
        message: "Invalid or expired session",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 401 if session is expired", async () => {
      mockGetSession.mockResolvedValue({
        user: {
          id: "user1",
          email: "test@example.com",
          name: "Test User",
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        session: {
          id: "session1",
          userId: "user1",
          token: "token123",
          expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      await requireAuth(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Unauthorized",
        message: "Session has expired",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should work with non-admin user", async () => {
      // Mock database to return non-admin user
      mockDbLimit.mockResolvedValueOnce([{ id: "user1", isAdmin: false }]);

      mockGetSession.mockResolvedValue({
        user: {
          id: "user1",
          email: "test@example.com",
          name: "Test User",
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        session: {
          id: "session1",
          userId: "user1",
          token: "token123",
          expiresAt: new Date(Date.now() + 86400000), // 24 hours from now
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      await requireAuth(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.user).toBeDefined();
      expect(mockRequest.user?.id).toBe("user1");
      expect(mockRequest.user?.isAdmin).toBe(false);
    });

    it("should handle auth API errors", async () => {
      mockGetSession.mockRejectedValue(new Error("Auth API error"));

      await requireAuth(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Unauthorized",
        message: "Failed to validate session",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("requireAdmin", () => {
    it("should call next if user is admin", async () => {
      mockRequest.user = {
        id: "admin1",
        email: "admin@example.com",
        isAdmin: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await requireAdmin(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
    });

    it("should return 401 if no user in request", async () => {
      await requireAdmin(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Unauthorized",
        message: "Authentication required",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 403 if user is not admin", async () => {
      mockRequest.user = {
        id: "user1",
        email: "user@example.com",
        isAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await requireAdmin(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Forbidden",
        message: "Admin privileges required",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("optionalAuth", () => {
    it("should attach user if valid session exists", async () => {
      mockGetSession.mockResolvedValue({
        user: {
          id: "user1",
          email: "test@example.com",
          name: "Test User",
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        session: {
          id: "session1",
          userId: "user1",
          token: "token123",
          expiresAt: new Date(Date.now() + 86400000), // 24 hours from now
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      await optionalAuth(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.user).toBeDefined();
      expect(mockRequest.user?.id).toBe("user1");
      expect(mockRequest.user?.isAdmin).toBe(true);
    });

    it("should continue without user if no session exists", async () => {
      mockGetSession.mockResolvedValue(null);

      await optionalAuth(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.user).toBeUndefined();
    });

    it("should continue without user if session is expired", async () => {
      mockGetSession.mockResolvedValue({
        user: {
          id: "user1",
          email: "test@example.com",
          name: "Test User",
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        session: {
          id: "session1",
          userId: "user1",
          token: "token123",
          expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      await optionalAuth(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.user).toBeUndefined();
    });

    it("should continue without user if auth API throws error", async () => {
      mockGetSession.mockRejectedValue(new Error("Auth API error"));

      await optionalAuth(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.user).toBeUndefined();
    });
  });
});
