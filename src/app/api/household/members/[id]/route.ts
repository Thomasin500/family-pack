import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAuthenticatedUser, handleApiError, ApiError } from "@/lib/api-helpers";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const authedUser = await getAuthenticatedUser();
    const body = await req.json();

    // Find the member
    const member = await db.query.users.findFirst({
      where: eq(users.id, id),
    });
    if (!member) throw new ApiError(404, "Member not found");
    if (member.householdId !== authedUser.householdId) {
      throw new ApiError(403, "Not in your household");
    }

    // Only allow editing managed members (pets/children) or yourself
    const isSelf = member.id === authedUser.id;
    const isManaged = member.managedByUserId === authedUser.id;
    if (!isSelf && !isManaged) {
      throw new ApiError(403, "You can only edit your own profile or members you manage");
    }

    const updates: Record<string, unknown> = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.bodyWeightKg !== undefined) updates.bodyWeightKg = body.bodyWeightKg;
    if (body.breed !== undefined) updates.breed = body.breed;
    if (body.heightCm !== undefined) updates.heightCm = body.heightCm;
    if (body.birthDate !== undefined) updates.birthDate = body.birthDate;
    if (body.sex !== undefined) updates.sex = body.sex;

    if (Object.keys(updates).length === 0) {
      throw new ApiError(400, "No valid fields to update");
    }

    updates.updatedAt = new Date();

    const [updated] = await db.update(users).set(updates).where(eq(users.id, id)).returning();

    return NextResponse.json({ member: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const authedUser = await getAuthenticatedUser();

    const member = await db.query.users.findFirst({
      where: eq(users.id, id),
    });
    if (!member) throw new ApiError(404, "Member not found");
    if (member.householdId !== authedUser.householdId) {
      throw new ApiError(403, "Not in your household");
    }
    if (member.id === authedUser.id) {
      throw new ApiError(400, "Cannot delete yourself");
    }
    if (!member.managedByUserId) {
      throw new ApiError(
        400,
        "Cannot delete adult members — they must leave the household themselves"
      );
    }
    if (member.managedByUserId !== authedUser.id) {
      throw new ApiError(403, "You can only delete members you manage");
    }

    // Delete the member (cascading will handle trip_members, trip_packs, etc.)
    await db.delete(users).where(eq(users.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
