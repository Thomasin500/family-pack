import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tripPacks, tripPackItems, trips } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getAuthenticatedUser, handleApiError, ApiError } from "@/lib/api-helpers";
import { maybePromoteToCatalog } from "@/lib/catalog-promotion";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; packId: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    const { id, packId } = await params;

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

    const { itemId, quantity, ownedByUserId, isWornOverride, isConsumableOverride } =
      await req.json();

    if (!itemId) throw new ApiError(400, "Item ID is required");

    const [packItem] = await db
      .insert(tripPackItems)
      .values({
        tripPackId: packId,
        itemId,
        quantity: quantity ?? 1,
        ownedByUserId: ownedByUserId ?? null,
        isWornOverride: isWornOverride ?? null,
        isConsumableOverride: isConsumableOverride ?? null,
      })
      .returning();

    // Fire-and-forget: check if this item should be promoted to the catalog
    maybePromoteToCatalog(itemId).catch(() => {});

    return NextResponse.json(packItem, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
