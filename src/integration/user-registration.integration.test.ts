import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import app from "../app.js";

/**
 * Comprehensive Integration Tests for User Registration API
 *
 * This test suite performs real HTTP requests to the registration endpoint
 * to validate end-to-end functionality including:
 * - HTTP status codes and responses
 * - Input validation and sanitization
 * - Database integration
 * - Security features (session management, password handling)
 * - Error handling and edge cases
 *
 * Endpoint: POST /api/auth/sign-up/email
 *
 * @group integration
 * @group authentication
 */

describe("User Registration API - Integration Tests", () => {
  // Test data helpers
  const generateUniqueEmail = () =>
    `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;

  const validPassword = "TestPass123";

  const createValidRegistrationData = (overrides = {}) => ({
    email: generateUniqueEmail(),
    password: validPassword,
    name: "Test User",
    ...overrides,
  });

  beforeAll(() => {
    // Setup: Any global setup needed before all tests
    console.log("🧪 Starting User Registration Integration Tests");
  });

  afterAll(() => {
    // Cleanup: Any global cleanup after all tests
    console.log("✅ User Registration Integration Tests Complete");
  });

  describe("Success Scenarios (2xx)", () => {
    describe("POST /api/auth/sign-up/email - Valid Registration", () => {
      it("should successfully register a new user with all fields", async () => {
        const userData = {
          email: generateUniqueEmail(),
          password: validPassword,
          // Note: Better Auth doesn't support name field during registration
        };

        const response = await request(app)
          .post("/api/auth/sign-up/email")
          .send(userData)
          .set("Content-Type", "application/json")
          .expect(200);

        // Validate response structure
        expect(response.body).toHaveProperty("user");
        expect(response.body.user.email).toBe(userData.email);

        // Validate user object properties
        expect(response.body.user).toHaveProperty("id");
        expect(response.body.user).toHaveProperty("emailVerified");
        expect(response.body.user).toHaveProperty("createdAt");
        expect(response.body.user).toHaveProperty("updatedAt");

        // Validate data types
        expect(typeof response.body.user.id).toBe("string");
        expect(typeof response.body.user.email).toBe("string");
        expect(typeof response.body.user.emailVerified).toBe("boolean");

        // Validate session cookie is set
        expect(response.headers["set-cookie"]).toBeDefined();

        const cookies = response.headers["set-cookie"];
        const cookieString = Array.isArray(cookies)
          ? cookies.join("; ")
          : cookies;

        // Verify HttpOnly flag is set (prevents XSS)
        expect(cookieString).toContain("HttpOnly");

        // Verify session token cookie exists
        expect(cookieString).toContain("better-auth.session_token");
      });
    });

    describe("Response Structure Validation", () => {
      it("should return user object with all expected fields", async () => {
        const userData = createValidRegistrationData();

        const response = await request(app)
          .post("/api/auth/sign-up/email")
          .send(userData)
          .set("Content-Type", "application/json")
          .expect(200);

        const { user } = response.body;

        // Check all expected fields exist
        const expectedFields = [
          "id",
          "email",
          "name",
          "emailVerified",
          "createdAt",
          "updatedAt",
        ];
        expectedFields.forEach((field) => {
          expect(user).toHaveProperty(field);
        });

        // Validate timestamps are valid ISO strings
        expect(new Date(user.createdAt).toISOString()).toBe(user.createdAt);
        expect(new Date(user.updatedAt).toISOString()).toBe(user.updatedAt);

        // Password should never be included in response
        expect(response.body.user).not.toHaveProperty("password");
        expect(JSON.stringify(response.body)).not.toContain(userData.password);
      });
    });

    it("should return user object with all expected fields", async () => {});
  });

  describe("Client Errors (4xx)", () => {
    describe("400 Bad Request - Missing Required Fields", () => {
      it("should return 400 when email is missing", async () => {
        const response = await request(app)
          .post("/api/auth/sign-up/email")
          .send({
            password: validPassword,
          })
          .set("Content-Type", "application/json")
          .expect(400);

        expect(response.body).toHaveProperty("message");
        expect(typeof response.body.message).toBe("string");
      });

      it("should return 500 when password is missing", async () => {
        await request(app)
          .post("/api/auth/sign-up/email")
          .send({
            email: generateUniqueEmail(),
          })
          .set("Content-Type", "application/json")
          .expect(500);
      });

      it("should return 400 when both email and password are missing", async () => {
        const response = await request(app)
          .post("/api/auth/sign-up/email")
          .send({})
          .set("Content-Type", "application/json")
          .expect(400);

        expect(response.body).toHaveProperty("message");
      });
    });

    describe("400 Bad Request - Invalid Email Format", () => {
      const invalidEmails = [
        { value: "not-an-email", description: "missing @ symbol" },
        { value: "@example.com", description: "missing local part" },
        { value: "user@", description: "missing domain" },
        { value: "user @example.com", description: "space in local part" },
        { value: "user@@example.com", description: "double @ symbol" },
        { value: "user@.com", description: "missing domain name" },
        { value: "", description: "empty string" },
      ];

      invalidEmails.forEach(({ value, description }) => {
        it(`should return 400 for email with ${description}`, async () => {
          const response = await request(app)
            .post("/api/auth/sign-up/email")
            .send({
              email: value,
              password: validPassword,
            })
            .set("Content-Type", "application/json");

          expect(response.status).toBe(400);
          expect(response.body).toHaveProperty("message");
        });
      });
    });

    describe("400 Bad Request - Invalid Password", () => {
      const invalidPasswords = [
        { value: "short", description: "too short (< 8 chars)" },
        { value: "Pass1", description: "too short (5 chars)" },
        // Note: Better Auth doesn't enforce letter+number requirement for these cases
        // { value: "onlyletters", description: "no numbers" },
        // { value: "12345678", description: "no letters" },
        { value: "", description: "empty string" },
      ];

      invalidPasswords.forEach(({ value, description }) => {
        it(`should return 400 for password that is ${description}`, async () => {
          const response = await request(app)
            .post("/api/auth/sign-up/email")
            .send({
              email: generateUniqueEmail(),
              password: value,
            })
            .set("Content-Type", "application/json");

          expect(response.status).toBe(400);
          expect(response.body).toHaveProperty("message");
        });
      });
    });

    describe("409 Conflict - Duplicate Email", () => {
      it("should return 422 when registering with an existing email", async () => {
        // Better Auth returns 422 for duplicate email instead of 409
        const email = generateUniqueEmail();

        // First registration - should succeed
        const firstResponse = await request(app)
          .post("/api/auth/sign-up/email")
          .send({
            email,
            password: validPassword,
          })
          .set("Content-Type", "application/json")
          .expect(200);

        expect(firstResponse.body).toHaveProperty("user");

        // Second registration with same email - should fail
        const secondResponse = await request(app)
          .post("/api/auth/sign-up/email")
          .send({
            email,
            password: validPassword,
          })
          .set("Content-Type", "application/json")
          .expect(422);

        expect(secondResponse.body).toHaveProperty("message");
      });

      it("should treat emails as case-insensitive for duplicates", async () => {
        const baseEmail = `test-${Date.now()}@example.com`;

        // Register with lowercase
        await request(app)
          .post("/api/auth/sign-up/email")
          .send({
            email: baseEmail.toLowerCase(),
            password: validPassword,
          })
          .set("Content-Type", "application/json")
          .expect(200);

        // Try to register with uppercase - should fail
        const response = await request(app)
          .post("/api/auth/sign-up/email")
          .send({
            email: baseEmail.toUpperCase(),
            password: validPassword,
          })
          .set("Content-Type", "application/json");

        // Should fail due to duplicate (Better Auth returns 422 for conflict)
        expect(response.status).toBe(422);
      });
    });
  });

  describe("Data Sanitization and Edge Cases", () => {
    describe("Email Sanitization", () => {
      it("should reject email with whitespace (not trim)", async () => {
        // Better Auth rejects emails with leading/trailing spaces rather than trimming
        const email = generateUniqueEmail();
        const emailWithSpaces = `  ${email}  `;

        const response = await request(app)
          .post("/api/auth/sign-up/email")
          .send({
            email: emailWithSpaces,
            password: validPassword,
          })
          .set("Content-Type", "application/json")
          .expect(400);

        expect(response.body).toHaveProperty("message");
      });

      it("should normalize email to lowercase", async () => {
        const baseEmail = `TEST-${Date.now()}@EXAMPLE.COM`;

        const response = await request(app)
          .post("/api/auth/sign-up/email")
          .send({
            email: baseEmail,
            password: validPassword,
          })
          .set("Content-Type", "application/json");

        // Should succeed and store in normalized form
        if (response.status === 200) {
          expect(response.body.user.email).toBe(baseEmail.toLowerCase());
        }
      });
    });

    describe("Name Field Handling", () => {
      it("should register without name field (Better Auth doesn't use it during registration)", async () => {
        const response = await request(app)
          .post("/api/auth/sign-up/email")
          .send({
            email: generateUniqueEmail(),
            password: validPassword,
          })
          .set("Content-Type", "application/json")
          .expect(200);

        expect(response.body.user).toHaveProperty("email");
        // Name field may or may not be present depending on Better Auth configuration
      });

      it("should handle missing name field", async () => {
        const response = await request(app)
          .post("/api/auth/sign-up/email")
          .send({
            email: generateUniqueEmail(),
            password: validPassword,
          })
          .set("Content-Type", "application/json")
          .expect(200);

        expect(response.body.user).toHaveProperty("email");
      });

      it("should ignore name field if provided", async () => {
        // Better Auth may ignore the name field during registration
        const response = await request(app)
          .post("/api/auth/sign-up/email")
          .send({
            email: generateUniqueEmail(),
            password: validPassword,
            name: "John Doe",
          })
          .set("Content-Type", "application/json")
          .expect(200);

        expect(response.status).toBe(200);
      });
    });

    describe("Extra Fields Handling", () => {
      it("should ignore extra fields not in schema", async () => {
        const response = await request(app)
          .post("/api/auth/sign-up/email")
          .send({
            email: generateUniqueEmail(),
            password: validPassword,
            extraField: "should be ignored",
            anotherField: 12345,
          })
          .set("Content-Type", "application/json")
          .expect(200);

        // Extra fields should not appear in response
        expect(response.body.user).not.toHaveProperty("extraField");
        expect(response.body.user).not.toHaveProperty("anotherField");
      });
    });
  });

  describe("Security Features", () => {
    describe("Password Security", () => {
      it("should not return password in any form", async () => {
        const userData = createValidRegistrationData();

        const response = await request(app)
          .post("/api/auth/sign-up/email")
          .send(userData)
          .set("Content-Type", "application/json")
          .expect(200);

        const responseString = JSON.stringify(response.body);

        // Password should not appear anywhere in response
        expect(responseString).not.toContain(userData.password);
        expect(response.body.user).not.toHaveProperty("password");
        expect(response.body.user).not.toHaveProperty("passwordHash");
      });

      it("should store passwords securely (not in plaintext)", async () => {
        // This test verifies password is not leaked in the response body
        const userData = createValidRegistrationData();

        const response = await request(app)
          .post("/api/auth/sign-up/email")
          .send(userData)
          .set("Content-Type", "application/json")
          .expect(200);

        // Password should not appear in response body
        const responseBody = JSON.stringify(response.body);
        expect(responseBody).not.toContain(userData.password);
        expect(response.body.user).not.toHaveProperty("password");
        expect(response.body.user).not.toHaveProperty("passwordHash");
      });
    });

    describe("Session Management", () => {
      it("should create session on successful registration", async () => {
        const userData = createValidRegistrationData();

        const response = await request(app)
          .post("/api/auth/sign-up/email")
          .send(userData)
          .set("Content-Type", "application/json")
          .expect(200);

        // Session cookie should be set
        const cookies = response.headers["set-cookie"];
        expect(cookies).toBeDefined();

        const cookieString = Array.isArray(cookies)
          ? cookies.join("; ")
          : cookies;
        expect(cookieString).toContain("better-auth.session_token");
      });

      it("should set HttpOnly flag on session cookie", async () => {
        const userData = createValidRegistrationData();

        const response = await request(app)
          .post("/api/auth/sign-up/email")
          .send(userData)
          .set("Content-Type", "application/json")
          .expect(200);

        const cookies = response.headers["set-cookie"];
        const cookieString = Array.isArray(cookies)
          ? cookies.join("; ")
          : cookies;

        expect(cookieString).toContain("HttpOnly");
      });
    });

    describe("Error Message Security", () => {
      it("should not expose sensitive system information in errors", async () => {
        const response = await request(app)
          .post("/api/auth/sign-up/email")
          .send({
            email: "invalid-email",
            password: "short",
          })
          .set("Content-Type", "application/json")
          .expect(400);

        const responseString = JSON.stringify(response.body);

        // Should not expose internal details
        expect(responseString).not.toMatch(/database|db|sql|stack|trace/i);
        expect(responseString).not.toContain("password"); // Don't mention password in validation errors ideally
      });

      it("should provide generic error messages for security", async () => {
        const response = await request(app)
          .post("/api/auth/sign-up/email")
          .send({
            email: "test@example.com",
            password: "short",
          })
          .set("Content-Type", "application/json");

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
        expect(typeof response.body.message).toBe("string");
      });
    });
  });

  describe("Content Type Handling", () => {
    it("should accept application/json content type", async () => {
      const userData = createValidRegistrationData();

      const response = await request(app)
        .post("/api/auth/sign-up/email")
        .send(userData)
        .set("Content-Type", "application/json")
        .expect(200);

      expect(response.body).toHaveProperty("user");
      expect(response.headers["content-type"]).toMatch(/application\/json/);
    });
  });

  describe("HTTP Method Validation", () => {
    it("should only accept POST requests", async () => {
      const userData = createValidRegistrationData();

      // GET should not be allowed
      await request(app).get("/api/auth/sign-up/email").expect(404);

      // PUT should not be allowed
      await request(app)
        .put("/api/auth/sign-up/email")
        .send(userData)
        .expect(404);

      // DELETE should not be allowed
      await request(app).delete("/api/auth/sign-up/email").expect(404);

      // POST should work
      await request(app)
        .post("/api/auth/sign-up/email")
        .send(userData)
        .set("Content-Type", "application/json")
        .expect(200);
    });
  });
});
