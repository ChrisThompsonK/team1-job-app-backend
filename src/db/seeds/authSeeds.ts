// Import scrypt for password hashing (same as Better Auth uses)
import { randomUUID, scrypt } from "node:crypto";
import { promisify } from "node:util";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { env } from "../../config/env.js";
import { account, user } from "../schemas/auth.js";

const scryptAsync = promisify(scrypt);

// Helper function to hash passwords using scrypt (Better Auth's default)
async function hashPassword(password: string): Promise<string> {
  const salt = randomUUID();
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `scrypt:${salt}:${derivedKey.toString("hex")}`;
}

const client = createClient({
  url: env.databaseUrl,
});

const db = drizzle(client);

// Seed data for users
export const userSeeds = [
  {
    id: randomUUID(),
    name: "Admin User",
    email: "admin@jobapp.com",
    emailVerified: true,
    isAdmin: true,
  },
  {
    id: randomUUID(),
    name: "John Doe",
    email: "john.doe@example.com",
    emailVerified: true,
    isAdmin: false,
  },
  {
    id: randomUUID(),
    name: "Jane Smith",
    email: "jane.smith@example.com",
    emailVerified: true,
    isAdmin: false,
  },
  {
    id: randomUUID(),
    name: "Bob Johnson",
    email: "bob.johnson@example.com",
    emailVerified: false,
    isAdmin: false,
  },
  {
    id: randomUUID(),
    name: "Alice Brown",
    email: "alice.brown@example.com",
    emailVerified: true,
    isAdmin: false,
  },
];

// Function to create account seeds with hashed passwords
export async function createAccountSeeds() {
  const accountSeeds = [];

  for (const userData of userSeeds) {
    // Default password for all users is "password123"
    const hashedPassword = await hashPassword("password123");

    accountSeeds.push({
      id: randomUUID(),
      accountId: randomUUID(),
      providerId: "credential", // Better Auth uses "credential" for email/password
      userId: userData.id,
      password: hashedPassword,
    });
  }

  return accountSeeds;
}

export async function runAuthSeeds(): Promise<void> {
  try {
    console.log("🔐 Starting auth seeding...");

    // Clear existing auth data
    console.log("🗑️  Clearing existing accounts...");
    await db.delete(account);

    console.log("🗑️  Clearing existing users...");
    await db.delete(user);

    // Insert user data
    console.log("👤 Inserting users...");
    await db.insert(user).values(userSeeds);

    // Insert account data with hashed passwords
    console.log("🔑 Inserting accounts with hashed passwords...");
    const accountSeeds = await createAccountSeeds();
    await db.insert(account).values(accountSeeds);

    console.log(
      `✅ Successfully seeded ${userSeeds.length} users and accounts`
    );
    console.log("   - Admin user: admin@jobapp.com (password: password123)");
    console.log(
      "   - Regular users: john.doe@example.com, jane.smith@example.com, etc."
    );
    console.log("   - All users have password: password123");
    console.log("   - Passwords are properly hashed using scrypt");
  } catch (error) {
    console.error("❌ Error seeding auth data:", error);
    throw error;
  }
}
