import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAuthenticatedUser, handleApiError } from "@/lib/api-helpers";

/**
 * Leave the current household. The user stays signed in — they land on the
 * household setup screen. Their personal items travel with them (the item rows
 * reference `users.id`, so joining a new household re-imports them via the
 * member-scoped query).
 *
 * Pets and children stay with the household — they belong to the household,
 * not to the adult who originally added them. `managedByUserId` is audit-only
 * and no longer determines who takes non-adult members on leave.
 */
export async function POST() {
  try {
    const user = await getAuthenticatedUser();

    await db
      .update(users)
      .set({ householdId: null, updatedAt: new Date() })
      .where(eq(users.id, user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
