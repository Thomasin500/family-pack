import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getAuthenticatedUser, handleApiError, ApiError } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    const { name, role, bodyWeightKg, breed } = await req.json();
    if (!name) throw new ApiError(400, "Name is required");
    if (!role || !["child", "pet"].includes(role)) {
      throw new ApiError(400, "Role must be 'child' or 'pet'");
    }

    const [member] = await db
      .insert(users)
      .values({
        name,
        role,
        bodyWeightKg: bodyWeightKg ?? null,
        breed: breed ?? null,
        managedByUserId: user.id,
        householdId: user.householdId,
      })
      .returning();

    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
