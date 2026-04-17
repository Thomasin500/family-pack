import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { trips, tripMembers, tripPacks, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getAuthenticatedUser, handleApiError, ApiError } from "@/lib/api-helpers";
import { addTripMemberSchema } from "@/lib/validators";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser();
    const { id } = await params;
    const { userId } = addTripMemberSchema.parse(await req.json());

    // Verify trip belongs to household
    const trip = await db.query.trips.findFirst({
      where: and(eq(trips.id, id), eq(trips.householdId, user.householdId!)),
    });
    if (!trip) throw new ApiError(404, "Trip not found");

    // Verify the userId is a member of this household (not another family).
    const targetUser = await db.query.users.findFirst({
      where: and(eq(users.id, userId), eq(users.householdId, user.householdId!)),
    });
    if (!targetUser) throw new ApiError(400, "User not in your household");

    // Add member
    const [member] = await db.insert(tripMembers).values({ tripId: id, userId }).returning();

    // Auto-create a pack for the new member
    await db.insert(tripPacks).values({ tripId: id, userId });

    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser();
    const { id } = await params;
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) throw new ApiError(400, "userId query param is required");

    // Verify trip belongs to household
    const trip = await db.query.trips.findFirst({
      where: and(eq(trips.id, id), eq(trips.householdId, user.householdId!)),
    });
    if (!trip) throw new ApiError(404, "Trip not found");

    // Delete pack (cascade deletes pack items)
    await db.delete(tripPacks).where(and(eq(tripPacks.tripId, id), eq(tripPacks.userId, userId)));

    // Delete member
    await db
      .delete(tripMembers)
      .where(and(eq(tripMembers.tripId, id), eq(tripMembers.userId, userId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
