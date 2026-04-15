import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { trips, tripMembers, tripPacks, tripPackItems } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getAuthenticatedUser, handleApiError, ApiError } from "@/lib/api-helpers";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser();
    const { id } = await params;

    // Fetch the original trip with all relations
    const original = await db.query.trips.findFirst({
      where: and(eq(trips.id, id), eq(trips.householdId, user.householdId!)),
      with: {
        members: true,
        packs: {
          with: {
            packItems: true,
          },
        },
      },
    });

    if (!original) throw new ApiError(404, "Trip not found");

    // Create the new trip
    const [newTrip] = await db
      .insert(trips)
      .values({
        name: `${original.name} (copy)`,
        description: original.description,
        location: original.location,
        season: original.season,
        terrain: original.terrain,
        tempRangeLowF: original.tempRangeLowF,
        tempRangeHighF: original.tempRangeHighF,
        householdId: user.householdId!,
        createdByUserId: user.id,
      })
      .returning();

    // Copy members
    if (original.members.length > 0) {
      await db.insert(tripMembers).values(
        original.members.map((m) => ({
          tripId: newTrip.id,
          userId: m.userId,
          maxCarryWeightGrams: m.maxCarryWeightGrams,
          targetBaseWeightGrams: m.targetBaseWeightGrams,
        }))
      );
    }

    // Copy packs and their items
    for (const pack of original.packs) {
      const [newPack] = await db
        .insert(tripPacks)
        .values({
          tripId: newTrip.id,
          userId: pack.userId,
        })
        .returning();

      if (pack.packItems.length > 0) {
        await db.insert(tripPackItems).values(
          pack.packItems.map((pi) => ({
            tripPackId: newPack.id,
            itemId: pi.itemId,
            ownedByUserId: pi.ownedByUserId,
            quantity: pi.quantity,
            sortOrder: pi.sortOrder,
            isWornOverride: pi.isWornOverride,
            isConsumableOverride: pi.isConsumableOverride,
            isBorrowed: pi.isBorrowed,
          }))
        );
      }
    }

    // Return the full new trip
    const fullTrip = await db.query.trips.findFirst({
      where: eq(trips.id, newTrip.id),
      with: {
        members: { with: { user: true } },
        packs: { with: { user: true } },
      },
    });

    return NextResponse.json(fullTrip, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
