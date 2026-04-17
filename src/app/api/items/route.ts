import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { items, users, categories } from "@/db/schema";
import { eq, and, or, inArray, asc } from "drizzle-orm";
import { getAuthenticatedUser, handleApiError, ApiError } from "@/lib/api-helpers";
import { createItemSchema } from "@/lib/validators";

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
      orderBy: [asc(items.createdAt), asc(items.id)],
    });

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    const body = createItemSchema.parse(await req.json());
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

    // Validate the categoryId belongs to the household (if supplied).
    if (categoryId) {
      const cat = await db.query.categories.findFirst({
        where: and(eq(categories.id, categoryId), eq(categories.householdId, user.householdId!)),
      });
      if (!cat) throw new ApiError(400, "Category not found in household");
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
