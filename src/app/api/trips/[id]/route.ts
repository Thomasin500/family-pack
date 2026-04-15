import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { trips } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getAuthenticatedUser, handleApiError, ApiError } from "@/lib/api-helpers";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    const { id } = await params;

    const trip = await db.query.trips.findFirst({
      where: and(eq(trips.id, id), eq(trips.householdId, user.householdId!)),
      with: {
        members: {
          with: { user: true },
        },
        packs: {
          with: {
            user: true,
            packItems: {
              with: {
                item: {
                  with: { category: true },
                },
              },
            },
          },
        },
      },
    });

    if (!trip) throw new ApiError(404, "Trip not found");

    return NextResponse.json(trip);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    const { id } = await params;
    const body = await req.json();

    const [updated] = await db
      .update(trips)
      .set({ ...body, updatedAt: new Date() })
      .where(and(eq(trips.id, id), eq(trips.householdId, user.householdId!)))
      .returning();

    if (!updated) throw new ApiError(404, "Trip not found");

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
      .delete(trips)
      .where(and(eq(trips.id, id), eq(trips.householdId, user.householdId!)))
      .returning();

    if (!deleted) throw new ApiError(404, "Trip not found");

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
