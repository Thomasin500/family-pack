import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tripPacks, tripPackItems, trips, items as itemsTable, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getAuthenticatedUser, handleApiError, ApiError } from "@/lib/api-helpers";
import { maybePromoteToCatalog } from "@/lib/catalog-promotion";
import { bumpPackItemSchema } from "@/lib/validators";

/**
 * Upsert a tripPackItem — creates a new row with quantity 1 or increments
 * the quantity on the existing row for (packId, itemId). This enforces the
 * "one tripPackItem per (pack, item)" invariant for stackable items and
 * makes drag-and-drop "add to pack" idempotent.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; packId: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    const { id, packId } = await params;

    const trip = await db.query.trips.findFirst({
      where: and(eq(trips.id, id), eq(trips.householdId, user.householdId!)),
    });
    if (!trip) throw new ApiError(404, "Trip not found");

    const pack = await db.query.tripPacks.findFirst({
      where: and(eq(tripPacks.id, packId), eq(tripPacks.tripId, id)),
    });
    if (!pack) throw new ApiError(404, "Pack not found");

    const { itemId } = bumpPackItemSchema.parse(await req.json());

    // Harden: verify the item belongs to this household (either shared by
    // the household or owned by a household member). Prevents pulling in
    // gear from another family's closet via a guessed UUID.
    const item = await db.query.items.findFirst({ where: eq(itemsTable.id, itemId) });
    if (!item) throw new ApiError(404, "Item not found");
    if (item.ownerType === "shared") {
      if (item.ownerId !== user.householdId) throw new ApiError(404, "Item not found");
    } else {
      const owner = await db.query.users.findFirst({
        where: and(eq(users.id, item.ownerId), eq(users.householdId, user.householdId!)),
      });
      if (!owner) throw new ApiError(404, "Item not found");
    }

    const existing = await db.query.tripPackItems.findFirst({
      where: and(eq(tripPackItems.tripPackId, packId), eq(tripPackItems.itemId, itemId)),
    });

    let packItem;
    if (existing) {
      const [updated] = await db
        .update(tripPackItems)
        .set({ quantity: (existing.quantity ?? 1) + 1 })
        .where(eq(tripPackItems.id, existing.id))
        .returning();
      packItem = updated;
    } else {
      const [inserted] = await db
        .insert(tripPackItems)
        .values({
          tripPackId: packId,
          itemId,
          quantity: 1,
        })
        .returning();
      packItem = inserted;
      // Fire-and-forget catalog promotion for brand-new additions.
      maybePromoteToCatalog(itemId).catch(() => {});
    }

    return NextResponse.json(packItem, { status: existing ? 200 : 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
