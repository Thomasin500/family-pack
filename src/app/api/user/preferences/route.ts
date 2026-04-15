import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { handleApiError, ApiError } from "@/lib/api-helpers";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) throw new ApiError(401, "Not authenticated");

    const user = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });
    if (!user) throw new ApiError(401, "User not found");

    return NextResponse.json({
      weightUnitPref: user.weightUnitPref ?? "imperial",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) throw new ApiError(401, "Not authenticated");

    const user = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });
    if (!user) throw new ApiError(401, "User not found");

    const { weightUnitPref } = await req.json();

    if (weightUnitPref && !["imperial", "metric"].includes(weightUnitPref)) {
      throw new ApiError(400, "Invalid weight unit preference");
    }

    const [updated] = await db
      .update(users)
      .set({
        ...(weightUnitPref && { weightUnitPref }),
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning();

    return NextResponse.json({
      weightUnitPref: updated.weightUnitPref,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
