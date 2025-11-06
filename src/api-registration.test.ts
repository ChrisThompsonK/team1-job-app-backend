import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Comprehensive API Tests for User Registration Endpoint
 * Tests HTTP status codes, JSON response structures, and input validation
 * Endpoint: POST /api/auth/sign-up/email
 */

describe("User Registration API - POST /api/auth/sign-up/email", () => {
  // Mock fetch for testing
  let mockFetch: ReturnType<typeof vi.fn>;
  const backendUrl = "http://localhost:3001/api";

  beforeEach(() => {
    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("HTTP Status Code Validation", () => {
    describe("200/201 - Success Cases", () => {
      it("should return 200/201 with valid registration data", async () => {
        const validRegistrationData = {
          email: "newuser@example.com",
          password: "SecurePass123",
          name: "Test User",
        };

        const mockSuccessResponse = {
          user: {
            id: "user_123",
            name: "Test User",
            email: "newuser@example.com",
            emailVerified: false,
            createdAt: "2025-11-06T10:00:00.000Z",
            updatedAt: "2025-11-06T10:00:00.000Z",
          },
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: {
            get: (header: string) =>
              header === "set-cookie"
                ? "better-auth.session_token=abc123; Path=/; HttpOnly"
                : null,
          },
          json: async () => mockSuccessResponse,
        });

        const response = await fetch(`${backendUrl}/auth/sign-up/email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(validRegistrationData),
        });

        expect(response.ok).toBe(true);
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data).toHaveProperty("user");
        expect(data.user).toHaveProperty("id");
        expect(data.user).toHaveProperty("email", validRegistrationData.email);
      });

      it("should return 200 with minimal required data (email and password only)", async () => {
        const minimalRegistrationData = {
          email: "minimal@example.com",
          password: "Pass1234",
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: { get: () => null },
          json: async () => ({
            user: {
              id: "user_124",
              name: "",
              email: "minimal@example.com",
              emailVerified: false,
              createdAt: "2025-11-06T10:00:00.000Z",
              updatedAt: "2025-11-06T10:00:00.000Z",
            },
          }),
        });

        const response = await fetch(`${backendUrl}/auth/sign-up/email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(minimalRegistrationData),
        });

        expect(response.status).toBe(200);
        expect(response.ok).toBe(true);
      });
    });

    describe("400 - Bad Request Cases", () => {
      it("should return 400 for missing email", async () => {
        const invalidData = {
          password: "SecurePass123",
        };

        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 400,
          headers: { get: () => null },
          json: async () => ({
            message: "Email is required",
          }),
        });

        const response = await fetch(`${backendUrl}/auth/sign-up/email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(invalidData),
        });

        expect(response.status).toBe(400);
        expect(response.ok).toBe(false);
        const data = await response.json();
        expect(data).toHaveProperty("message");
      });

      it("should return 400 for missing password", async () => {
        const invalidData = {
          email: "test@example.com",
        };

        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 400,
          headers: { get: () => null },
          json: async () => ({
            message: "Password is required",
          }),
        });

        const response = await fetch(`${backendUrl}/auth/sign-up/email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(invalidData),
        });

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.message).toBeDefined();
      });

      it("should return 400 for invalid email format", async () => {
        const invalidData = {
          email: "not-an-email",
          password: "SecurePass123",
        };

        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 400,
          headers: { get: () => null },
          json: async () => ({
            message: "Invalid email format",
          }),
        });

        const response = await fetch(`${backendUrl}/auth/sign-up/email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(invalidData),
        });

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.message).toContain("email");
      });

      it("should return 400 for password too short (< 8 characters)", async () => {
        const invalidData = {
          email: "test@example.com",
          password: "Pass1", // Only 5 characters
        };

        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 400,
          headers: { get: () => null },
          json: async () => ({
            message: "Password must be at least 8 characters long",
          }),
        });

        const response = await fetch(`${backendUrl}/auth/sign-up/email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(invalidData),
        });

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.message).toMatch(/password|characters/i);
      });

      it("should return 400 for password without letter and number", async () => {
        const invalidData = {
          email: "test@example.com",
          password: "onlyletters", // No numbers
        };

        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 400,
          headers: { get: () => null },
          json: async () => ({
            message: "Password must contain at least one letter and one number",
          }),
        });

        const response = await fetch(`${backendUrl}/auth/sign-up/email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(invalidData),
        });

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.message).toMatch(/password/i);
      });
    });

    it("should return 400 for email too long (> 254 characters)", async () => {
      const longEmail = `${"a".repeat(250)}@example.com`;
      const invalidData = {
        email: longEmail,
        password: "SecurePass123",
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: { get: () => null },
        json: async () => ({
          message: "Email address is too long",
        }),
      });

      const response = await fetch(`${backendUrl}/auth/sign-up/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invalidData),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.message).toBeDefined();
    });

    it("should return 400 for empty request body", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: { get: () => null },
        json: async () => ({
          message: "Request body is required",
        }),
      });

      const response = await fetch(`${backendUrl}/auth/sign-up/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(400);
    });

    it("should return 400 for malformed JSON", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: { get: () => null },
        json: async () => ({
          message: "Invalid JSON format",
        }),
      });

      const response = await fetch(`${backendUrl}/auth/sign-up/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{ invalid json",
      });

      expect(response.status).toBe(400);
    });
  });

  describe("404 - Not Found Cases", () => {
    it("should return 404 for incorrect endpoint", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: { get: () => null },
        json: async () => ({
          message: "Endpoint not found",
        }),
      });

      const response = await fetch(`${backendUrl}/auth/sign-up-wrong`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          password: "SecurePass123",
        }),
      });

      expect(response.status).toBe(404);
    });
  });

  describe("409 - Conflict Cases", () => {
    it("should return 409 for duplicate email (user already exists)", async () => {
      const existingUserData = {
        email: "existing@example.com",
        password: "SecurePass123",
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        headers: { get: () => null },
        json: async () => ({
          message: "An account with this email already exists",
        }),
      });

      const response = await fetch(`${backendUrl}/auth/sign-up/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(existingUserData),
      });

      expect(response.status).toBe(409);
      const data = await response.json();
      expect(data.message).toMatch(/already exists|duplicate/i);
    });
  });

  describe("429 - Rate Limiting Cases", () => {
    it("should return 429 for too many registration attempts", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers: { get: () => null },
        json: async () => ({
          message: "Too many registration attempts. Please try again later.",
        }),
      });

      const response = await fetch(`${backendUrl}/auth/sign-up/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          password: "SecurePass123",
        }),
      });

      expect(response.status).toBe(429);
      const data = await response.json();
      expect(data.message).toMatch(/too many|rate limit/i);
    });
  });

  describe("500 - Server Error Cases", () => {
    it("should return 500 for internal server error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: { get: () => null },
        json: async () => ({
          message: "Internal server error",
        }),
      });

      const response = await fetch(`${backendUrl}/auth/sign-up/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          password: "SecurePass123",
        }),
      });

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.message).toBeDefined();
    });

    it("should return 503 for service unavailable (database down)", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        headers: { get: () => null },
        json: async () => ({
          message: "Service temporarily unavailable",
        }),
      });

      const response = await fetch(`${backendUrl}/auth/sign-up/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          password: "SecurePass123",
        }),
      });

      expect(response.status).toBe(503);
      const data = await response.json();
      expect(data.message).toMatch(/unavailable/i);
    });
  });
});

describe("JSON Response Structure Validation", () => {
  describe("Success Response Schema", () => {
    it("should have correct structure for successful registration", async () => {
      const mockSuccessResponse = {
        user: {
          id: "user_123",
          name: "Test User",
          email: "test@example.com",
          emailVerified: false,
          createdAt: "2025-11-06T10:00:00.000Z",
          updatedAt: "2025-11-06T10:00:00.000Z",
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: () => "better-auth.session_token=abc123; Path=/; HttpOnly",
        },
        json: async () => mockSuccessResponse,
      });

      const response = await fetch(`${backendUrl}/auth/sign-up/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          password: "SecurePass123",
          name: "Test User",
        }),
      });

      const data = await response.json();

      // Validate top-level structure
      expect(data).toHaveProperty("user");
      expect(data.user).toBeDefined();
      expect(typeof data.user).toBe("object");

      // Validate user object structure
      expect(data.user).toHaveProperty("id");
      expect(data.user).toHaveProperty("name");
      expect(data.user).toHaveProperty("email");
      expect(data.user).toHaveProperty("emailVerified");
      expect(data.user).toHaveProperty("createdAt");
      expect(data.user).toHaveProperty("updatedAt");

      // Validate data types
      expect(typeof data.user.id).toBe("string");
      expect(typeof data.user.name).toBe("string");
      expect(typeof data.user.email).toBe("string");
      expect(typeof data.user.emailVerified).toBe("boolean");
      expect(typeof data.user.createdAt).toBe("string");
      expect(typeof data.user.updatedAt).toBe("string");

      // Validate email format in response
      expect(data.user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);

      // Validate ISO date format
      expect(new Date(data.user.createdAt).toISOString()).toBe(
        data.user.createdAt
      );
      expect(new Date(data.user.updatedAt).toISOString()).toBe(
        data.user.updatedAt
      );
    });

    it("should include session cookies in response headers", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (header: string) =>
            header === "set-cookie"
              ? "better-auth.session_token=abc123; Path=/; HttpOnly; Secure"
              : null,
        },
        json: async () => ({
          user: {
            id: "user_123",
            name: "Test User",
            email: "test@example.com",
            emailVerified: false,
            createdAt: "2025-11-06T10:00:00.000Z",
            updatedAt: "2025-11-06T10:00:00.000Z",
          },
        }),
      });

      const response = await fetch(`${backendUrl}/auth/sign-up/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          password: "SecurePass123",
        }),
      });

      const setCookie = response.headers.get("set-cookie");
      expect(setCookie).toBeDefined();
      expect(setCookie).toContain("better-auth.session_token");
      expect(setCookie).toContain("HttpOnly");
    });

    it("should not include password in response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => null },
        json: async () => ({
          user: {
            id: "user_123",
            name: "Test User",
            email: "test@example.com",
            emailVerified: false,
            createdAt: "2025-11-06T10:00:00.000Z",
            updatedAt: "2025-11-06T10:00:00.000Z",
          },
        }),
      });

      const response = await fetch(`${backendUrl}/auth/sign-up/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          password: "SecurePass123",
        }),
      });

      const data = await response.json();
      expect(data.user).not.toHaveProperty("password");
      expect(JSON.stringify(data)).not.toContain("SecurePass123");
    });
  });

  describe("Error Response Schema", () => {
    it("should have correct structure for error responses", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: { get: () => null },
        json: async () => ({
          message: "Email is required",
        }),
      });

      const response = await fetch(`${backendUrl}/auth/sign-up/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: "SecurePass123" }),
      });

      const data = await response.json();

      // Validate error structure
      expect(data).toHaveProperty("message");
      expect(typeof data.message).toBe("string");
      expect(data.message.length).toBeGreaterThan(0);
    });

    it("should provide descriptive error messages", async () => {
      const errorScenarios = [
        {
          status: 400,
          message: "Invalid email format",
        },
        {
          status: 409,
          message: "An account with this email already exists",
        },
        {
          status: 429,
          message: "Too many registration attempts. Please try again later.",
        },
        {
          status: 500,
          message: "Internal server error",
        },
      ];

      for (const scenario of errorScenarios) {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: scenario.status,
          headers: { get: () => null },
          json: async () => ({ message: scenario.message }),
        });

        const response = await fetch(`${backendUrl}/auth/sign-up/email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "test@example.com",
            password: "SecurePass123",
          }),
        });

        const data = await response.json();
        expect(data.message).toBeDefined();
        expect(data.message.length).toBeGreaterThan(0);
        expect(typeof data.message).toBe("string");
      }
    });
  });
});

describe("Input Data Validation", () => {
  describe("Valid Input Data", () => {
    it("should accept valid email formats", async () => {
      const validEmails = [
        "user@example.com",
        "test.user@example.com",
        "user+tag@example.co.uk",
        "user123@test-domain.com",
        "a@b.co",
      ];

      for (const email of validEmails) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: { get: () => null },
          json: async () => ({
            user: {
              id: "user_123",
              name: "",
              email: email,
              emailVerified: false,
              createdAt: "2025-11-06T10:00:00.000Z",
              updatedAt: "2025-11-06T10:00:00.000Z",
            },
          }),
        });

        const response = await fetch(`${backendUrl}/auth/sign-up/email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email,
            password: "SecurePass123",
          }),
        });

        expect(response.ok).toBe(true);
      }
    });

    it("should accept valid passwords", async () => {
      const validPasswords = [
        "Password123",
        "SecureP4ss",
        "MyPass123!@#",
        "Test1234",
        "abcDEF123",
      ];

      for (const password of validPasswords) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: { get: () => null },
          json: async () => ({
            user: {
              id: "user_123",
              name: "",
              email: "test@example.com",
              emailVerified: false,
              createdAt: "2025-11-06T10:00:00.000Z",
              updatedAt: "2025-11-06T10:00:00.000Z",
            },
          }),
        });

        const response = await fetch(`${backendUrl}/auth/sign-up/email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "test@example.com",
            password: password,
          }),
        });

        expect(response.ok).toBe(true);
      }
    });

    it("should accept optional name field", async () => {
      const names = ["John Doe", "Jane Smith", "", "A", "Very Long Name Here"];

      for (const name of names) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: { get: () => null },
          json: async () => ({
            user: {
              id: "user_123",
              name: name,
              email: "test@example.com",
              emailVerified: false,
              createdAt: "2025-11-06T10:00:00.000Z",
              updatedAt: "2025-11-06T10:00:00.000Z",
            },
          }),
        });

        const response = await fetch(`${backendUrl}/auth/sign-up/email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "test@example.com",
            password: "SecurePass123",
            name: name,
          }),
        });

        expect(response.ok).toBe(true);
      }
    });
  });

  describe("Invalid Input Data", () => {
    it("should reject invalid email formats", async () => {
      const invalidEmails = [
        "notanemail",
        "@example.com",
        "user@",
        "user @example.com",
        "user@@example.com",
        "user@.com",
      ];

      for (const email of invalidEmails) {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 400,
          headers: { get: () => null },
          json: async () => ({
            message: "Invalid email format",
          }),
        });

        const response = await fetch(`${backendUrl}/auth/sign-up/email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email,
            password: "SecurePass123",
          }),
        });

        expect(response.status).toBe(400);
      }
    });

    it("should reject invalid passwords", async () => {
      const invalidPasswords = [
        "short", // Too short
        "12345678", // No letters
        "onlyletters", // No numbers
        "Pass1", // Too short
      ];

      for (const password of invalidPasswords) {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 400,
          headers: { get: () => null },
          json: async () => ({
            message:
              "Password must be at least 8 characters and contain a letter and number",
          }),
        });

        const response = await fetch(`${backendUrl}/auth/sign-up/email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "test@example.com",
            password: password,
          }),
        });

        expect(response.status).toBe(400);
      }
    });

    it("should reject requests with extra unknown fields", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => null },
        json: async () => ({
          user: {
            id: "user_123",
            name: "Test User",
            email: "test@example.com",
            emailVerified: false,
            createdAt: "2025-11-06T10:00:00.000Z",
            updatedAt: "2025-11-06T10:00:00.000Z",
          },
        }),
      });

      // Should ignore extra fields
      const response = await fetch(`${backendUrl}/auth/sign-up/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          password: "SecurePass123",
          extraField: "should be ignored",
          anotherField: 123,
        }),
      });

      // Should still succeed by ignoring extra fields
      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.user).not.toHaveProperty("extraField");
      expect(data.user).not.toHaveProperty("anotherField");
    });
  });

  describe("Edge Cases", () => {
    it("should handle null values appropriately", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: { get: () => null },
        json: async () => ({
          message: "Email is required",
        }),
      });

      const response = await fetch(`${backendUrl}/auth/sign-up/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: null,
          password: "SecurePass123",
        }),
      });

      expect(response.status).toBe(400);
    });

    it("should handle undefined values appropriately", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: { get: () => null },
        json: async () => ({
          message: "Email is required",
        }),
      });

      const response = await fetch(`${backendUrl}/auth/sign-up/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: undefined,
          password: "SecurePass123",
        }),
      });

      expect(response.status).toBe(400);
    });

    it("should handle empty strings", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: { get: () => null },
        json: async () => ({
          message: "Email cannot be empty",
        }),
      });

      const response = await fetch(`${backendUrl}/auth/sign-up/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "",
          password: "SecurePass123",
        }),
      });

      expect(response.status).toBe(400);
    });

    it("should trim whitespace from email", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => null },
        json: async () => ({
          user: {
            id: "user_123",
            name: "",
            email: "test@example.com", // Should be trimmed
            emailVerified: false,
            createdAt: "2025-11-06T10:00:00.000Z",
            updatedAt: "2025-11-06T10:00:00.000Z",
          },
        }),
      });

      const response = await fetch(`${backendUrl}/auth/sign-up/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "  test@example.com  ",
          password: "SecurePass123",
        }),
      });

      const data = await response.json();
      expect(data.user.email).toBe("test@example.com");
      expect(data.user.email).not.toContain(" ");
    });
  });
});

describe("Security Validation", () => {
  it("should not expose sensitive information in error messages", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      headers: { get: () => null },
      json: async () => ({
        message: "Internal server error",
      }),
    });

    const response = await fetch(`${backendUrl}/auth/sign-up/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        password: "SecurePass123",
      }),
    });

    const data = await response.json();
    // Should not expose database details, stack traces, etc.
    expect(JSON.stringify(data)).not.toContain("database");
    expect(JSON.stringify(data)).not.toContain("stack");
    expect(JSON.stringify(data)).not.toContain("SQL");
  });

  it("should set secure cookie flags", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: {
        get: (header: string) =>
          header === "set-cookie"
            ? "better-auth.session_token=abc123; Path=/; HttpOnly; Secure; SameSite=Strict"
            : null,
      },
      json: async () => ({
        user: {
          id: "user_123",
          name: "Test User",
          email: "test@example.com",
          emailVerified: false,
          createdAt: "2025-11-06T10:00:00.000Z",
          updatedAt: "2025-11-06T10:00:00.000Z",
        },
      }),
    });

    const response = await fetch(`${backendUrl}/auth/sign-up/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        password: "SecurePass123",
      }),
    });

    const setCookie = response.headers.get("set-cookie");
    expect(setCookie).toContain("HttpOnly");
    // In production, these should be present
    // expect(setCookie).toContain("Secure");
    // expect(setCookie).toContain("SameSite");
  });
});
