import { db } from "@/db";
import { sessions } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Delete every database session for a user, forcing them to sign in again.
 * Safe to call on users with no sessions (no-op).
 */
export async function invalidateUserSessions(userId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.userId, userId));
}
