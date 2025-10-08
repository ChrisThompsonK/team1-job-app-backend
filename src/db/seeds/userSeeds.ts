import bcrypt from "bcrypt";
import type { usersTable } from "../schemas/users";

const SALT_ROUNDS = 12;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function createUserSeeds(): Promise<
  (typeof usersTable.$inferInsert)[]
> {
  return [
    {
      username: "admin",
      passwordHash: await hashPassword("admin123"),
      role: "admin",
      firstName: "Admin",
      lastName: "User",
    },
    {
      username: "john.doe",
      passwordHash: await hashPassword("password123"),
      role: "user",
      firstName: "John",
      lastName: "Doe",
    },
    {
      username: "jane.smith",
      passwordHash: await hashPassword("password123"),
      role: "user",
      firstName: "Jane",
      lastName: "Smith",
    },
  ];
}
