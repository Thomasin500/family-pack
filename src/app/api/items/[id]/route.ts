import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { items, users, tripPackItems } from "@/db/schema";
import { eq, and, or, inArray, count } from "drizzle-orm";
import { getAuthenticatedUser, handleApiError, ApiError } from "@/lib/api-helpers";

function householdItemFilter(householdId: string, memberIds: string[]) {
  return or(
    and(eq(items.ownerType, "personal"), inArray(items.ownerId, memberIds)),
    and(eq(items.ownerType, "shared"), eq(items.ownerId, householdId))
  );
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser();
    const { id } = await params;
    const body = await req.json();
    const householdId = user.householdId!;

    const members = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.householdId, householdId));
    const memberIds = members.map((m) => m.id);

    const [updated] = await db
      .update(items)
      .set({ ...body, updatedAt: new Date() })
      .where(and(eq(items.id, id), householdItemFilter(householdId, memberIds)))
      .returning();

    if (!updated) throw new ApiError(404, "Item not found");

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser();
    const { id } = await params;
    const householdId = user.householdId!;

    const members = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.householdId, householdId));
    const memberIds = members.map((m) => m.id);

    const url = new URL(req.url);
    const force = url.searchParams.get("force") === "true";

    if (!force) {
      const [usage] = await db
        .select({ count: count() })
        .from(tripPackItems)
        .where(eq(tripPackItems.itemId, id));

      if (usage.count > 0) {
        return NextResponse.json(
          {
            error: "Item is in trips",
            tripCount: usage.count,
            message: `This item is in ${usage.count} trip pack(s). Delete anyway?`,
          },
          { status: 409 }
        );
      }
    }

    const [deleted] = await db
      .delete(items)
      .where(and(eq(items.id, id), householdItemFilter(householdId, memberIds)))
      .returning();

    if (!deleted) throw new ApiError(404, "Item not found");

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
