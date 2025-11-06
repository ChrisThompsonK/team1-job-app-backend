import { describe, expect, it, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "./app.js";

/**
 * Integration Tests for User Registration API
 * These tests make real HTTP calls to the API endpoint
 * Endpoint: POST /api/auth/sign-up/email
 */

describe("User Registration API Integration Tests", () => {
  // Generate unique email for each test run to avoid conflicts
  const generateTestEmail = () => `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;

  describe("HTTP Status Codes", () => {
    it("should return 200 with valid registration data", async () => {
      const response = await request(app)
        .post("/api/auth/sign-up/email")
        .send({
          email: generateTestEmail(),
          password: "TestPass123",
          name: "Integration Test User",
        })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("user");
    });

    it("should return 400 for missing email", async () => {
      const response = await request(app)
        .post("/api/auth/sign-up/email")
        .send({
          password: "TestPass123",
        })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });

    it("should return 400 for missing password", async () => {
      const response = await request(app)
        .post("/api/auth/sign-up/email")
        .send({
          email: generateTestEmail(),
        })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(400);
    });

    it("should return 400 for invalid email format", async () => {
      const response = await request(app)
        .post("/api/auth/sign-up/email")
        .send({
          email: "not-an-email",
          password: "TestPass123",
        })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(400);
    });

    it("should return 400 for password too short", async () => {
      const response = await request(app)
        .post("/api/auth/sign-up/email")
        .send({
          email: generateTestEmail(),
          password: "short", // Less than 8 characters
        })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(400);
    });

    it("should return 409 for duplicate email", async () => {
      const email = generateTestEmail();

      // First registration should succeed
      const firstResponse = await request(app)
        .post("/api/auth/sign-up/email")
        .send({
          email: email,
          password: "TestPass123",
        })
        .set("Content-Type", "application/json");

      expect(firstResponse.status).toBe(200);

      // Second registration with same email should fail
      const secondResponse = await request(app)
        .post("/api/auth/sign-up/email")
        .send({
          email: email,
          password: "TestPass123",
        })
        .set("Content-Type", "application/json");

      expect(secondResponse.status).toBe(409);
      expect(secondResponse.body.message).toMatch(/already exists|duplicate/i);
    });
  });

  describe("JSON Response Structure", () => {
    it("should return correct user object structure", async () => {
      const response = await request(app)
        .post("/api/auth/sign-up/email")
        .send({
          email: generateTestEmail(),
          password: "TestPass123",
          name: "Test User",
        })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("user");
      
      const user = response.body.user;
      expect(user).toHaveProperty("id");
      expect(user).toHaveProperty("email");
      expect(user).toHaveProperty("name");
      expect(user).toHaveProperty("emailVerified");
      expect(user).toHaveProperty("createdAt");
      expect(user).toHaveProperty("updatedAt");

      // Validate data types
      expect(typeof user.id).toBe("string");
      expect(typeof user.email).toBe("string");
      expect(typeof user.name).toBe("string");
      expect(typeof user.emailVerified).toBe("boolean");
    });

    it("should not include password in response", async () => {
      const response = await request(app)
        .post("/api/auth/sign-up/email")
        .send({
          email: generateTestEmail(),
          password: "TestPass123",
        })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(200);
      expect(response.body.user).not.toHaveProperty("password");
      expect(JSON.stringify(response.body)).not.toContain("TestPass123");
    });

    it("should include session cookies in response", async () => {
      const response = await request(app)
        .post("/api/auth/sign-up/email")
        .send({
          email: generateTestEmail(),
          password: "TestPass123",
        })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(200);
      
      // Check for Set-Cookie header
      const cookies = response.headers["set-cookie"];
      expect(cookies).toBeDefined();
      
      if (Array.isArray(cookies)) {
        const sessionCookie = cookies.find(c => c.includes("better-auth.session_token"));
        expect(sessionCookie).toBeDefined();
      } else if (typeof cookies === "string") {
        expect(cookies).toContain("better-auth.session_token");
      }
    });

    it("should return error structure for validation failures", async () => {
      const response = await request(app)
        .post("/api/auth/sign-up/email")
        .send({
          email: "invalid-email",
          password: "TestPass123",
        })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
      expect(typeof response.body.message).toBe("string");
      expect(response.body.message.length).toBeGreaterThan(0);
    });
  });

  describe("Input Data Validation", () => {
    it("should accept various valid email formats", async () => {
      const validEmails = [
        `test.user.${Date.now()}@example.com`,
        `user+tag${Date.now()}@example.co.uk`,
        `a${Date.now()}@b.co`,
      ];

      for (const email of validEmails) {
        const response = await request(app)
          .post("/api/auth/sign-up/email")
          .send({
            email: email,
            password: "TestPass123",
          })
          .set("Content-Type", "application/json");

        expect(response.status).toBe(200);
      }
    });

    it("should reject various invalid email formats", async () => {
      const invalidEmails = [
        "notanemail",
        "@example.com",
        "user@",
        "user @example.com",
      ];

      for (const email of invalidEmails) {
        const response = await request(app)
          .post("/api/auth/sign-up/email")
          .send({
            email: email,
            password: "TestPass123",
          })
          .set("Content-Type", "application/json");

        expect(response.status).toBe(400);
      }
    });

    it("should accept valid passwords with letters and numbers", async () => {
      const validPasswords = [
        "Password123",
        "Test1234",
        "abcDEF123",
      ];

      for (const password of validPasswords) {
        const response = await request(app)
          .post("/api/auth/sign-up/email")
          .send({
            email: generateTestEmail(),
            password: password,
          })
          .set("Content-Type", "application/json");

        expect(response.status).toBe(200);
      }
    });

    it("should handle optional name field", async () => {
      // With name
      const response1 = await request(app)
        .post("/api/auth/sign-up/email")
        .send({
          email: generateTestEmail(),
          password: "TestPass123",
          name: "John Doe",
        })
        .set("Content-Type", "application/json");

      expect(response1.status).toBe(200);
      expect(response1.body.user.name).toBe("John Doe");

      // Without name
      const response2 = await request(app)
        .post("/api/auth/sign-up/email")
        .send({
          email: generateTestEmail(),
          password: "TestPass123",
        })
        .set("Content-Type", "application/json");

      expect(response2.status).toBe(200);
    });

    it("should trim whitespace from email", async () => {
      const email = generateTestEmail();
      const response = await request(app)
        .post("/api/auth/sign-up/email")
        .send({
          email: `  ${email}  `,
          password: "TestPass123",
        })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe(email);
      expect(response.body.user.email).not.toContain(" ");
    });

    it("should handle empty string email", async () => {
      const response = await request(app)
        .post("/api/auth/sign-up/email")
        .send({
          email: "",
          password: "TestPass123",
        })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(400);
    });

    it("should handle empty string password", async () => {
      const response = await request(app)
        .post("/api/auth/sign-up/email")
        .send({
          email: generateTestEmail(),
          password: "",
        })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(400);
    });
  });

  describe("Security", () => {
    it("should set HttpOnly cookie flag", async () => {
      const response = await request(app)
        .post("/api/auth/sign-up/email")
        .send({
          email: generateTestEmail(),
          password: "TestPass123",
        })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(200);
      
      const cookies = response.headers["set-cookie"];
      expect(cookies).toBeDefined();
      
      const cookieString = Array.isArray(cookies) ? cookies.join("; ") : cookies;
      expect(cookieString).toContain("HttpOnly");
    });

    it("should not expose sensitive information in errors", async () => {
      const response = await request(app)
        .post("/api/auth/sign-up/email")
        .send({
          email: "invalid",
          password: "short",
        })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(400);
      
      const responseText = JSON.stringify(response.body);
      expect(responseText).not.toContain("database");
      expect(responseText).not.toContain("stack");
      expect(responseText).not.toContain("SQL");
      expect(responseText).not.toContain("password");
    });
  });
});
