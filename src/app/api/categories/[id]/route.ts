import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { categories, items } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";
import { getAuthenticatedUser, handleApiError, ApiError } from "@/lib/api-helpers";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser();
    const { id } = await params;
    const body = await req.json();

    const [updated] = await db
      .update(categories)
      .set(body)
      .where(and(eq(categories.id, id), eq(categories.householdId, user.householdId!)))
      .returning();

    if (!updated) throw new ApiError(404, "Category not found");

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser();
    const { id } = await params;
    const url = new URL(req.url);
    const force = url.searchParams.get("force") === "true";
    const moveTo = url.searchParams.get("moveTo");

    // Check if the category has items
    const [itemCount] = await db
      .select({ count: count() })
      .from(items)
      .where(eq(items.categoryId, id));

    if (itemCount.count > 0 && !force) {
      return NextResponse.json(
        {
          error: "Category has items",
          itemCount: itemCount.count,
          message: `This category contains ${itemCount.count} item(s). Move or delete them first, or use ?force=true&moveTo=<categoryId> to move them.`,
        },
        { status: 409 }
      );
    }

    // If force delete with moveTo, reassign items first
    if (itemCount.count > 0 && force && moveTo) {
      await db.update(items).set({ categoryId: moveTo }).where(eq(items.categoryId, id));
    } else if (itemCount.count > 0 && force) {
      // Force without moveTo: set categoryId to null
      await db.update(items).set({ categoryId: null }).where(eq(items.categoryId, id));
    }

    const [deleted] = await db
      .delete(categories)
      .where(and(eq(categories.id, id), eq(categories.householdId, user.householdId!)))
      .returning();

    if (!deleted) throw new ApiError(404, "Category not found");

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
