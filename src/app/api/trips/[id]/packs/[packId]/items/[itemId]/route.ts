import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tripPacks, tripPackItems, trips } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getAuthenticatedUser, handleApiError, ApiError } from "@/lib/api-helpers";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; packId: string; itemId: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    const { id, packId, itemId } = await params;

    // Verify the trip belongs to the household
    const trip = await db.query.trips.findFirst({
      where: and(eq(trips.id, id), eq(trips.householdId, user.householdId!)),
    });
    if (!trip) throw new ApiError(404, "Trip not found");

    // Verify the pack belongs to this trip
    const pack = await db.query.tripPacks.findFirst({
      where: and(eq(tripPacks.id, packId), eq(tripPacks.tripId, id)),
    });
    if (!pack) throw new ApiError(404, "Pack not found");

    const body = await req.json();

    const [updated] = await db
      .update(tripPackItems)
      .set(body)
      .where(
        and(
          eq(tripPackItems.id, itemId),
          eq(tripPackItems.tripPackId, packId)
        )
      )
      .returning();

    if (!updated) throw new ApiError(404, "Pack item not found");

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; packId: string; itemId: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    const { id, packId, itemId } = await params;

    // Verify the trip belongs to the household
    const trip = await db.query.trips.findFirst({
      where: and(eq(trips.id, id), eq(trips.householdId, user.householdId!)),
    });
    if (!trip) throw new ApiError(404, "Trip not found");

    // Verify the pack belongs to this trip
    const pack = await db.query.tripPacks.findFirst({
      where: and(eq(tripPacks.id, packId), eq(tripPacks.tripId, id)),
    });
    if (!pack) throw new ApiError(404, "Pack not found");

    const [deleted] = await db
      .delete(tripPackItems)
      .where(
        and(
          eq(tripPackItems.id, itemId),
          eq(tripPackItems.tripPackId, packId)
        )
      )
      .returning();

    if (!deleted) throw new ApiError(404, "Pack item not found");

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
