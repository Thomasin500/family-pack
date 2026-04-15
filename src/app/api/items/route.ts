import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { items, users } from "@/db/schema";
import { eq, and, or, inArray } from "drizzle-orm";
import { getAuthenticatedUser, handleApiError, ApiError } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    const householdId = user.householdId!;

    const ownerId = req.nextUrl.searchParams.get("ownerId");

    // Get all household member IDs for personal items
    const members = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.householdId, householdId));

    const memberIds = members.map((m) => m.id);

    let whereClause;
    if (ownerId) {
      // Filter to a specific owner
      whereClause = and(
        eq(items.ownerId, ownerId),
        or(
          and(eq(items.ownerType, "personal"), inArray(items.ownerId, memberIds)),
          and(eq(items.ownerType, "shared"), eq(items.ownerId, householdId))
        )
      );
    } else {
      // All household items: personal items for all members + shared items
      whereClause = or(
        and(eq(items.ownerType, "personal"), inArray(items.ownerId, memberIds)),
        and(eq(items.ownerType, "shared"), eq(items.ownerId, householdId))
      );
    }

    const result = await db.query.items.findMany({
      where: whereClause,
      with: { category: true },
    });

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    const body = await req.json();
    const {
      name,
      brand,
      model,
      weightGrams,
      categoryId,
      ownerType,
      ownerId,
      isConsumable,
      isWorn,
      tags,
      notes,
    } = body;

    if (!name) throw new ApiError(400, "Name is required");
    if (!ownerType) throw new ApiError(400, "Owner type is required");
    if (!ownerId) throw new ApiError(400, "Owner ID is required");

    // Validate the ownerId belongs to the household
    if (ownerType === "personal") {
      const owner = await db.query.users.findFirst({
        where: and(eq(users.id, ownerId), eq(users.householdId, user.householdId!)),
      });
      if (!owner) throw new ApiError(400, "Owner not found in household");
    } else if (ownerType === "shared") {
      if (ownerId !== user.householdId) {
        throw new ApiError(400, "Shared items must use household ID as ownerId");
      }
    }

    const [item] = await db
      .insert(items)
      .values({
        name,
        brand: brand ?? null,
        model: model ?? null,
        weightGrams: weightGrams ?? 0,
        categoryId: categoryId ?? null,
        ownerType,
        ownerId,
        isConsumable: isConsumable ?? false,
        isWorn: isWorn ?? false,
        tags: tags ?? null,
        notes: notes ?? null,
      })
      .returning();

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
