# Simplified Authentication Implementation Plan

## Overview
Add a basic username/password authentication system with two user types (user and admin). Authentication will be via a single login endpoint that returns success/failure with the user's role.

---

## 1. Database Schema

### Users Table (`src/db/schemas/users.ts`)

Create a new Drizzle schema file:

```typescript
users:
  - id (integer, primary key)
  - username (text, unique, not null)
  - passwordHash (text, not null)
  - role (text, enum: 'user' | 'admin', not null)
  - firstName (text, not null)
  - lastName (text, not null)
```

**No timestamps needed** - keeping it simple.

---

## 2. Database Migration

### Create Migration File
- Use Drizzle to generate migration for the users table
- Run migration to create the table in SQLite database

### Manual Seed Data
Create a simple seed script to manually add test users:
- 1 admin user (e.g., username: "admin", password hash for "admin123")
- 1-2 regular users for testing

---

## 3. Repository Layer

### `src/repositories/UserRepository.ts`

Single method needed:
```typescript
findByUsername(username: string): Promise<User | null>
```

Returns user object with id, username, passwordHash, role, firstName, lastName, or null if not found.

---

## 4. Service Layer

### `src/services/AuthService.ts`

Single method needed:
```typescript
login(username: string, password: string): Promise<LoginResult>
```

**Logic:**
1. Call `UserRepository.findByUsername(username)`
2. If user not found → return failure
3. Use bcrypt to compare input password with stored passwordHash
4. If password matches → return success with role
5. If password doesn't match → return failure

**Return type:**
```typescript
LoginResult = 
  | { success: true, role: 'user' | 'admin' }
  | { success: false }
```

---

## 5. Controller Layer

### `src/controllers/AuthController.ts`

Single endpoint:
```typescript
POST /api/auth/login
```

**Request body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response on success:**
```json
{
  "success": true,
  "role": "admin" // or "user"
}
```

**Response on failure:**
```json
{
  "success": false
}
```

**Controller logic:**
1. Extract username and password from request body
2. Call `AuthService.login(username, password)`
3. Return the result as JSON

---

## 6. Routes

### `src/routes/AuthRoutes.ts`

Create new route file:
- Register POST `/api/auth/login` route
- Connect to `AuthController.login` method

### Update `src/app.ts`
- Import and register AuthRoutes
- Add to Express app (likely at `/api/auth` base path)

---

## 7. Dependency Injection

### Update `src/di/container.ts`

Register new dependencies:
1. `UserRepository` (needs database connection)
2. `AuthService` (needs UserRepository)
3. `AuthController` (needs AuthService)

Follow existing pattern used for Job-related classes.

---

## 8. NPM Dependencies

### Install Required Packages

```bash
npm install bcrypt
npm install --save-dev @types/bcrypt
```

**bcrypt** will be used for:
- Hashing passwords when creating seed data
- Comparing passwords during login

---

## 9. Implementation Order

### Step 1: Schema & Database
1. Create `src/db/schemas/users.ts`
2. Export from `src/db/schemas.ts` (if applicable)
3. Generate Drizzle migration
4. Run migration

### Step 2: Seed Users
1. Create seed script to hash passwords and insert users
2. Run seed script manually

### Step 3: Repository
1. Create `src/repositories/UserRepository.ts`
2. Implement `findByUsername` method

### Step 4: Service
1. Create `src/services/AuthService.ts`
2. Implement `login` method with bcrypt comparison

### Step 5: Controller
1. Create `src/controllers/AuthController.ts`
2. Implement login endpoint handler

### Step 6: Routes
1. Create `src/routes/AuthRoutes.ts`
2. Update `src/app.ts` to register auth routes

### Step 7: DI Container
1. Update `src/di/container.ts`
2. Register UserRepository, AuthService, AuthController

### Step 8: Manual Testing
1. Start server
2. Use Postman/curl to test login endpoint
3. Verify correct responses for:
   - Valid admin credentials
   - Valid user credentials
   - Invalid username
   - Invalid password

---

## 10. Key Decisions & Simplifications

✅ **What we're including:**
- Basic username/password authentication
- Password hashing with bcrypt
- User and admin role distinction
- firstName and lastName fields
- Single login endpoint

❌ **What we're NOT including:**
- JWT tokens
- Session management
- Refresh tokens
- User registration/creation endpoints
- Logout functionality
- Timestamps (createdAt/updatedAt)
- Password validation rules
- Input sanitization (beyond basic checks)
- HTTPS enforcement
- Rate limiting
- Cookie handling
- Integration with existing job system
- Protected routes/middleware
- Unit/integration tests

---

## 11. Example Usage

### Creating a User Manually (via seed script)
```typescript
const hashedPassword = await bcrypt.hash("mypassword123", 12);
// Insert into database with username, hashedPassword, role, firstName, lastName
```

### Login Request (from frontend)
```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

### Success Response
```json
{
  "success": true,
  "role": "admin"
}
```

### Failure Response
```json
{
  "success": false
}
```

---

## Notes
- Frontend will handle role-based UI rendering (showing/hiding buttons)
- No server-side route protection needed at this stage
- User management (CRUD) can be added later
- Job-user integration can be added in future iteration
- This approach prioritizes simplicity and getting basic auth working first
