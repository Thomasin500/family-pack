import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { getAuthenticatedUser, handleApiError } from "@/lib/api-helpers";

/**
 * Leave the current household. The user stays signed in — they land on the
 * household setup screen. Their personal items, and the pets/children they
 * manage, follow them (householdId nulled) so joining a new household
 * re-imports their gear automatically via household member scoping.
 */
export async function POST() {
  try {
    const user = await getAuthenticatedUser();

    // Null householdId on the leaving user AND any members they manage
    // (pets/children), so their gear travels with them to the next household.
    await db
      .update(users)
      .set({ householdId: null, updatedAt: new Date() })
      .where(or(eq(users.id, user.id), eq(users.managedByUserId, user.id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
