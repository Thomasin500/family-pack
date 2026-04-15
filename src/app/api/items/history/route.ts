import { NextResponse } from "next/server";
import { db } from "@/db";
import { tripPackItems, tripPacks, items, users } from "@/db/schema";
import { eq, sql, inArray } from "drizzle-orm";
import { getAuthenticatedUser, handleApiError } from "@/lib/api-helpers";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    const householdId = user.householdId!;

    // Get all household member IDs
    const members = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.householdId, householdId));
    const memberIds = members.map((m) => m.id);

    // Count distinct trips per item for all household items
    const tripCounts = await db
      .select({
        itemId: tripPackItems.itemId,
        tripCount: sql<number>`count(distinct ${tripPacks.tripId})`.as("trip_count"),
      })
      .from(tripPackItems)
      .innerJoin(tripPacks, eq(tripPackItems.tripPackId, tripPacks.id))
      .where(inArray(tripPacks.userId, memberIds))
      .groupBy(tripPackItems.itemId);

    // Return as a map: { [itemId]: tripCount }
    const result: Record<string, number> = {};
    for (const row of tripCounts) {
      result[row.itemId] = Number(row.tripCount);
    }

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
