import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getAuthenticatedUser, handleApiError, ApiError } from "@/lib/api-helpers";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    const { id } = await params;
    const body = await req.json();

    const [updated] = await db
      .update(categories)
      .set(body)
      .where(
        and(eq(categories.id, id), eq(categories.householdId, user.householdId!))
      )
      .returning();

    if (!updated) throw new ApiError(404, "Category not found");

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    const { id } = await params;

    const [deleted] = await db
      .delete(categories)
      .where(
        and(eq(categories.id, id), eq(categories.householdId, user.householdId!))
      )
      .returning();

    if (!deleted) throw new ApiError(404, "Category not found");

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
