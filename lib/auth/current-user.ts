import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { users, type User } from "@/lib/db/schema";

/**
 * Resolves the signed-in Clerk session to this app's internal `users` row.
 * Returns null if signed out, or if the Clerk webhook hasn't synced the row
 * yet (rare race on first sign-up).
 */
export async function getCurrentUser(): Promise<User | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const db = getDb();
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkUserId, userId))
    .limit(1);

  return user ?? null;
}
