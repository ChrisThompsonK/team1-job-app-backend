# Changes Log for Additional Features

> **Purpose**: Track all changes made after the FixedDB PR for easy recreation on a new branch
> **Created**: 2025-10-14
> **Branch**: FixedDB (temporary - will be recreated on new branch)

## Change Log

### Change #1: Add Login Endpoint
**Date**: 2025-10-14  
**Type**: NEW_FILE | MODIFIED_FILE  
**Description**: Added authentication system with login endpoint using Better Auth integration

#### Files Affected:
- `src/controllers/AuthController.ts` (NEW)
- `src/routes/CreateAuthRoutes.ts` (NEW)
- `src/di/container.ts` (MODIFIED)
- `src/app.ts` (MODIFIED)

#### Detailed Changes:

**File**: `src/controllers/AuthController.ts`
```typescript
import type { Request, Response } from "express";
import { BusinessError } from "../middleware/errorHandler.js";
import { auth } from "../utils/auth.js";

export class AuthController {
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

      // Get the JWT token from the result
      const token = result.token || null;

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
            emailVerified: result.user.emailVerified,
          },
          token: token,
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
```

**File**: `src/routes/CreateAuthRoutes.ts`
```typescript
import { Router } from "express";
import type { AuthController } from "../controllers/AuthController.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const createAuthRoutes = (authController: AuthController) => {
  const router = Router();

  // Authentication routes - all wrapped with asyncHandler for error handling
  router.post(
    "/auth/login",
    asyncHandler(authController.login.bind(authController))
  );

  return router;
};
```

**File**: `src/di/container.ts` (ADDED IMPORTS AND EXPORTS)
```typescript
// ADDED IMPORT
import { AuthController } from "../controllers/AuthController.js";

// ADDED DEPENDENCY
// Auth controller
const authController = new AuthController();

// MODIFIED EXPORT
export { authController, jobController };
```

**File**: `src/app.ts` (ADDED IMPORTS AND ROUTES)
```typescript
// ADDED IMPORT
import { authController, jobController } from "./di/container.js";
import { createAuthRoutes } from "./routes/CreateAuthRoutes.js";

// ADDED TO ENDPOINTS IN ROOT RESPONSE
      login: "/api/auth/login [POST]",

// ADDED ROUTE
app.use("/api", createAuthRoutes(authController));
```

**Reasoning**: Added a login endpoint that integrates with the existing Better Auth setup. The endpoint follows the established project patterns (Controller -> Routes -> DI -> App integration) and provides JWT token-based authentication for users to access protected resources.

---

### Change #2: Fix ES Module Import Extensions
**Date**: 2025-10-14  
**Type**: MODIFIED_FILE  
**Description**: Fixed module resolution error by adding .js extensions to schema imports

#### Files Affected:
- `src/db/schemas.ts` (MODIFIED)

#### Detailed Changes:

**File**: `src/db/schemas.ts` (FIXED IMPORTS)
```typescript
// BEFORE
export * from "./schemas/auth";
export * from "./schemas/jobs";

// AFTER  
export * from "./schemas/auth.js";
export * from "./schemas/jobs.js";
```

**Reasoning**: ES modules in Node.js require explicit file extensions for relative imports. Without the .js extension, the compiled JavaScript couldn't find the auth and jobs modules, causing a "Cannot find module" error when starting the server.

---

### Change #3: Fix Authentication Password Hashing
**Date**: 2025-10-14  
**Type**: MODIFIED_FILE  
**Description**: Fixed password hashing in auth seeds to be compatible with Better Auth's scrypt implementation

#### Files Affected:
- `src/db/seeds/authSeeds.ts` (MODIFIED)
- `src/utils/auth.ts` (MODIFIED)

#### Detailed Changes:

**File**: `src/db/seeds/authSeeds.ts` (UPDATED PASSWORD HASHING)
```typescript
// ADDED proper scrypt hashing
import { randomUUID, scrypt } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

// Helper function to hash passwords using scrypt (Better Auth's default method)
async function hashPassword(password: string): Promise<string> {
  const salt = randomUUID();
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

// UPDATED to use async hashing
export async function createAccountSeeds() {
  const accountSeeds = [];

  for (const userData of userSeeds) {
    // Default password for all users is "password123"
    const hashedPassword = await hashPassword("password123");

    accountSeeds.push({
      id: randomUUID(),
      accountId: userData.id,
      providerId: "credential",
      userId: userData.id,
      password: hashedPassword,
    });
  }

  return accountSeeds;
}
```

**File**: `src/utils/auth.ts` (ADDED JWT-ONLY CONFIG)
```typescript
// ADDED storeSessionInCookie: false for JWT-only
session: {
  expiresIn: 60 * 60, // 1 hour in seconds
  updateAge: 60 * 60, // Don't refresh session - same as expiresIn for no refresh behavior
  storeSessionInCookie: false, // Use JWT only, no session storage
},
```

**Reasoning**: The original manual password hashing format was incompatible with Better Auth's scrypt implementation. Better Auth expected hashed passwords in a specific format (salt:hash) but was receiving a different format, causing "hex string expected" errors during login. This fix ensures passwords are hashed using the same scrypt method and format that Better Auth uses internally.

---

### Change #2: [NEXT_CHANGE_TITLE]
**Date**: 2025-10-14  
**Type**: [NEW_FILE | MODIFIED_FILE | DELETED_FILE | COMMAND]  
**Description**: [Brief description]

#### Files Affected:
- `path/to/another/file.ts`

#### Detailed Changes:

**File**: `path/to/another/file.ts`
```typescript
// Complete content or specific modifications
```

**Reasoning**: [Why this change was made]

---

## Instructions for Recreation

### Prerequisites
```bash
# Ensure you're on the target branch (usually main after FixedDB merge)
git checkout main
git pull origin main
git checkout -b feature/additional-changes
```

### Step-by-Step Recreation
1. **For each NEW_FILE**: Use the complete content provided
2. **For each MODIFIED_FILE**: Apply the exact changes shown
3. **For each DELETED_FILE**: Remove the specified files
4. **For each COMMAND**: Run the terminal commands in order

### Verification Steps
- [ ] Run `npm run lint` to ensure code style compliance
- [ ] Run `npm test` to ensure all tests pass
- [ ] Run `npm run build` to ensure no build errors
- [ ] Test the application functionality

## Notes
- All changes follow Biome linting rules (2 spaces, double quotes, etc.)
- File paths are absolute from project root
- Dependencies and package.json changes are noted separately
- Database migrations are tracked with full SQL content

---

## Summary
**Total Files Modified**: 8  
**Total Files Added**: 4  
**Total Files Deleted**: 0  
**Commands Run**: 2

### Change #4: Fix Better Auth Password Hashing and Database Schema
**Date**: 2025-10-14  
**Type**: MODIFIED_FILE | NEW_FILE | DATABASE_MIGRATION  
**Description**: Fixed password authentication by adding required session table schema and using Better Auth's signUpEmail API for proper password hashing

#### Files Affected:
- `src/db/schemas/auth.ts` (MODIFIED) - Added session table schema
- `src/utils/auth.ts` (MODIFIED) - Added session table to Better Auth adapter
- `src/db/seeds/authSeeds.ts` (MODIFIED) - Use Better Auth API for user creation
- `drizzle/0003_add_session_table.sql` (NEW) - Migration for session table
- `drizzle/meta/_journal.json` (MODIFIED) - Track new migration

#### Detailed Changes:

**File**: `src/db/schemas/auth.ts` (ADDED SESSION TABLE)
```typescript
// Session table - required by Better Auth even in JWT-only mode (won't be used)
export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .default(sql`(cast(unixepoch() as integer))`)
    .notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" })
    .default(sql`(cast(unixepoch() as integer))`)
    .$onUpdate(() => new Date())
    .notNull(),
});
```

**File**: `src/utils/auth.ts` (ADDED SESSION TO SCHEMA)
```typescript
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite", // LibSQL is SQLite-compatible
    schema: {
      user: schema.user,
      account: schema.account,
      session: schema.session, // Required even in JWT-only mode
    },
  }),
  // ... rest of config unchanged
});
```

**File**: `src/db/seeds/authSeeds.ts` (COMPLETELY REWRITTEN)
```typescript
// Better Auth seeding - Create users directly with Better Auth
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { env } from "../../config/env.js";
import { account, user, session } from "../schemas/auth.js";
import { auth } from "../../utils/auth.js";

const client = createClient({
  url: env.databaseUrl,
});

const db = drizzle(client);

export const testUsers = [
  { name: "Admin User", email: "admin@jobapp.com", password: "password123" },
  { name: "John Doe", email: "john.doe@example.com", password: "password123" },
  { name: "Jane Smith", email: "jane.smith@example.com", password: "password123" },
  { name: "Bob Johnson", email: "bob.johnson@example.com", password: "password123" },
  { name: "Alice Brown", email: "alice.brown@example.com", password: "password123" },
];

export async function runAuthSeeds(): Promise<void> {
  try {
    console.log("🔐 Starting auth seeding with Better Auth...");
    
    // Clear existing auth data first (no sessions needed for JWT-only mode)
    console.log("🗑️  Clearing existing accounts...");
    await db.delete(account);
    
    console.log("🗑️  Clearing existing users...");
    await db.delete(user);
    
    console.log("👤 Creating users with Better Auth...");
    
    // Create users using Better Auth's signUp method for proper password hashing
    for (const testUser of testUsers) {
      try {
        console.log(`   Creating: ${testUser.email}`);
        
        // Use Better Auth's internal signUp to ensure proper password hashing
        await auth.api.signUpEmail({
          body: {
            name: testUser.name,
            email: testUser.email,
            password: testUser.password,
          },
        });
        
        console.log(`   ✅ Created: ${testUser.email}`);
      } catch (error) {
        console.error(`   ❌ Failed to create ${testUser.email}:`, error);
      }
    }
    
    console.log("");
    console.log("✅ Auth seeding completed!");
    console.log("   - All users have password: password123");
    console.log("   - Passwords are properly hashed by Better Auth");
    console.log("   - Test login with admin@jobapp.com / password123");
    
  } catch (error) {
    console.error("❌ Error during auth seeding:", error);
    throw error;
  }
}
```

**File**: `drizzle/0003_add_session_table.sql` (NEW MIGRATION)
```sql
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`token` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`ipAddress` text,
	`userAgent` text,
	`createdAt` integer DEFAULT (cast(unixepoch() as integer)) NOT NULL,
	`updatedAt` integer DEFAULT (cast(unixepoch() as integer)) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);
```

**File**: `drizzle/meta/_journal.json` (ADDED NEW MIGRATION ENTRY)
```json
{
  "idx": 3,
  "version": "6",
  "when": 1760451473725,
  "tag": "0003_add_session_table",
  "breakpoints": true
}
```

#### Commands Run:
1. `npm run db:seed` - Seeded database with test users using Better Auth
2. `sqlite3 jobApp.db < drizzle/0003_add_session_table.sql` - Applied session table migration

#### Testing:
- ✅ Auth seeding now works correctly
- ✅ Users created with proper password hashing via Better Auth
- ✅ Test users available: admin@jobapp.com, john.doe@example.com, etc.
- ✅ All passwords: password123
- ✅ Session table exists for Better Auth compatibility (JWT-only mode)

#### Key Issues Resolved:
1. **Password Hashing**: Better Auth requires its own signUpEmail API for proper scrypt password hashing
2. **Session Schema**: Better Auth adapter requires session table in schema even for JWT-only mode
3. **Database Migration**: Created proper migration file for session table for team consistency
4. **Authentication Flow**: Login endpoint now works with properly hashed passwords

**Next Steps**: After FixedDB PR is merged, use this log to recreate all changes on a new branch.