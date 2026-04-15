import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { households, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { handleApiError, ApiError } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) throw new ApiError(401, "Not authenticated");

    const user = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });
    if (!user) throw new ApiError(401, "User not found");

    if (user.householdId) {
      throw new ApiError(400, "User already belongs to a household");
    }

    const { inviteCode } = await req.json();
    if (!inviteCode) throw new ApiError(400, "Invite code is required");

    const household = await db.query.households.findFirst({
      where: eq(households.inviteCode, inviteCode),
    });
    if (!household) throw new ApiError(404, "Invalid invite code");

    await db
      .update(users)
      .set({ householdId: household.id })
      .where(eq(users.id, user.id));

    return NextResponse.json({ household });
  } catch (error) {
    return handleApiError(error);
  }
}
