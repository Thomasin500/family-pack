import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tripPacks, tripPackItems, trips, items as itemsTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getAuthenticatedUser, handleApiError, ApiError } from "@/lib/api-helpers";
import { movePackItemSchema } from "@/lib/validators";

/**
 * Move a tripPackItem into another pack within the same trip, preserving
 * ownedByUserId (so "carrying for X" keeps working). For stackable items
 * this decrements the source (deletes the row if it would reach 0) and
 * upserts the target.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser();
    const { id: tripId } = await params;

    const trip = await db.query.trips.findFirst({
      where: and(eq(trips.id, tripId), eq(trips.householdId, user.householdId!)),
    });
    if (!trip) throw new ApiError(404, "Trip not found");

    const body = movePackItemSchema.parse(await req.json());
    const { tripPackItemId, toPackId, sortOrder } = body;

    const source = await db.query.tripPackItems.findFirst({
      where: eq(tripPackItems.id, tripPackItemId),
    });
    if (!source) throw new ApiError(404, "Pack item not found");

    const [fromPack, toPack] = await Promise.all([
      db.query.tripPacks.findFirst({ where: eq(tripPacks.id, source.tripPackId) }),
      db.query.tripPacks.findFirst({ where: eq(tripPacks.id, toPackId) }),
    ]);
    if (!fromPack || fromPack.tripId !== tripId) throw new ApiError(404, "Source pack not in trip");
    if (!toPack || toPack.tripId !== tripId) throw new ApiError(404, "Target pack not in trip");

    if (source.tripPackId === toPackId) {
      // No-op move — just return the row.
      return NextResponse.json(source);
    }

    const item = await db.query.items.findFirst({
      where: eq(itemsTable.id, source.itemId),
    });
    if (!item) throw new ApiError(404, "Item not found");

    if (item.allowMultiple) {
      // Stackable: decrement source (or delete if 1), upsert target by +1.
      const srcQty = source.quantity ?? 1;
      if (srcQty <= 1) {
        await db.delete(tripPackItems).where(eq(tripPackItems.id, source.id));
      } else {
        await db
          .update(tripPackItems)
          .set({ quantity: srcQty - 1 })
          .where(eq(tripPackItems.id, source.id));
      }

      const existingTarget = await db.query.tripPackItems.findFirst({
        where: and(eq(tripPackItems.tripPackId, toPackId), eq(tripPackItems.itemId, source.itemId)),
      });
      if (existingTarget) {
        const [updated] = await db
          .update(tripPackItems)
          .set({ quantity: (existingTarget.quantity ?? 1) + 1 })
          .where(eq(tripPackItems.id, existingTarget.id))
          .returning();
        return NextResponse.json(updated);
      }

      const [inserted] = await db
        .insert(tripPackItems)
        .values({
          tripPackId: toPackId,
          itemId: source.itemId,
          quantity: 1,
          ownedByUserId: source.ownedByUserId,
          sortOrder: sortOrder ?? 0,
          isWornOverride: source.isWornOverride,
          isConsumableOverride: source.isConsumableOverride,
        })
        .returning();
      return NextResponse.json(inserted);
    }

    // Non-stackable: move the row. If target already has this item (should be
    // rare since non-stackable items stay in one place), merge by summing qty
    // then delete the source.
    const existingTarget = await db.query.tripPackItems.findFirst({
      where: and(eq(tripPackItems.tripPackId, toPackId), eq(tripPackItems.itemId, source.itemId)),
    });
    if (existingTarget) {
      await db.delete(tripPackItems).where(eq(tripPackItems.id, source.id));
      const [updated] = await db
        .update(tripPackItems)
        .set({ quantity: (existingTarget.quantity ?? 1) + (source.quantity ?? 1) })
        .where(eq(tripPackItems.id, existingTarget.id))
        .returning();
      return NextResponse.json(updated);
    }

    const update: Record<string, unknown> = { tripPackId: toPackId };
    if (sortOrder !== undefined) update.sortOrder = sortOrder;
    const [moved] = await db
      .update(tripPackItems)
      .set(update)
      .where(eq(tripPackItems.id, source.id))
      .returning();
    return NextResponse.json(moved);
  } catch (error) {
    return handleApiError(error);
  }
}
