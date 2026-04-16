import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getAuthenticatedUser, handleApiError } from "@/lib/api-helpers";
import { addMemberSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    const { name, role, bodyWeightKg, breed } = addMemberSchema.parse(await req.json());

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
