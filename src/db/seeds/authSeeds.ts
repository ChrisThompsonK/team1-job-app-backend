// Better Auth seeding - Create users directly with Better Auth
import { createClient } from "@libsql/client";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { env } from "../../config/env.js";
import { auth } from "../../utils/auth.js";
import { account, user } from "../schemas/auth.js";

const client = createClient({
  url: env.databaseUrl,
});

const db = drizzle(client);

export const testUsers = [
  { name: "Admin User", email: "admin@jobapp.com", password: "password123" },
  { name: "John Doe", email: "john.doe@example.com", password: "password123" },
  {
    name: "Jane Smith",
    email: "jane.smith@example.com",
    password: "password123",
  },
  {
    name: "Bob Johnson",
    email: "bob.johnson@example.com",
    password: "password123",
  },
  {
    name: "Alice Brown",
    email: "alice.brown@example.com",
    password: "password123",
  },
];

export async function runAuthSeeds(): Promise<void> {
  try {
    console.log("🔐 Starting auth seeding with Better Auth...");

    // Clear existing auth data first
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

        // Set admin flag for admin user
        if (testUser.email === "admin@jobapp.com") {
          await db
            .update(user)
            .set({ isAdmin: true })
            .where(eq(user.email, testUser.email));
          console.log(`   🔑 Set admin privileges for ${testUser.email}`);
        }

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
