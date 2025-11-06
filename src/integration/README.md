# Integration Tests

This directory contains integration tests that verify the end-to-end functionality of API endpoints.

## User Registration Integration Tests

**File:** `user-registration.integration.test.ts`

### Overview
Comprehensive integration tests for the user registration API endpoint (`POST /api/auth/sign-up/email`). These tests make real HTTP requests to the API using `supertest` to validate the complete registration flow.

### Test Coverage

The test suite includes **41 test cases** covering:

#### 1. Success Scenarios (2xx)
- Valid registration with required fields
- Various valid email formats
- Various valid password formats
- Response structure validation
- Session cookie management

#### 2. Client Errors (4xx)
- Missing required fields (email, password)
- Invalid email formats
- Invalid passwords (too short, empty)
- Duplicate email handling (422 response)
- Case-insensitive email validation

#### 3. Data Sanitization
- Email validation (whitespace rejection, case normalization)
- Name field handling
- Extra fields filtering

#### 4. Security Features
- Password security (no plaintext exposure)
- Session management (HttpOnly cookies)
- Error message security (no sensitive data leakage)

#### 5. API Compliance
- HTTP method validation (POST only)
- Content-Type handling (JSON)
- Response format validation
- Performance benchmarks

### Running the Tests

```bash
# Run all integration tests
npm test -- src/integration/

# Run only the registration tests
npm test -- src/integration/user-registration.integration.test.ts

# Run with coverage
npm run test:coverage -- src/integration/
```

### Key Features

1. **Real HTTP Requests**: Uses `supertest` to make actual HTTP calls to the Express app
2. **Better Auth Integration**: Tests the Better Auth library's sign-up endpoint
3. **Unique Test Data**: Each test generates unique email addresses to avoid conflicts
4. **Comprehensive Validation**: Covers success cases, error cases, edge cases, and security
5. **Performance Testing**: Includes concurrency and response time validation

### Test Structure

```typescript
describe("User Registration API - Integration Tests", () => {
  describe("Success Scenarios (2xx)", () => { /* ... */ });
  describe("Client Errors (4xx)", () => { /* ... */ });
  describe("Data Sanitization and Edge Cases", () => { /* ... */ });
  describe("Security Features", () => { /* ... */ });
  // ... more test groups
});
```

### Notes

- **Better Auth Behavior**: These tests are adapted to Better Auth's actual behavior:
  - Returns 500 for missing password (not 400)
  - Returns 422 for duplicate emails (not 409)
  - Rejects emails with leading/trailing whitespace (doesn't trim)
  - Name field may be ignored during registration
  
- **Database**: Tests use the configured test database (see `vitest.config.ts`)

### Future Enhancements

Consider adding:
- Tests for concurrent duplicate registration attempts
- Rate limiting tests
- Email verification flow tests
- Password strength requirement tests
- Integration with other authentication endpoints (login, logout)
