import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { handleApiError, ApiError } from "@/lib/api-helpers";

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) throw new ApiError(401, "Not authenticated");

    const user = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });
    if (!user) throw new ApiError(401, "User not found");

    const { bodyWeightKg, heightCm, name } = await req.json();

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (bodyWeightKg !== undefined) updates.bodyWeightKg = bodyWeightKg;
    if (heightCm !== undefined) updates.heightCm = heightCm;
    if (name !== undefined) updates.name = name;

    const [updated] = await db.update(users).set(updates).where(eq(users.id, user.id)).returning();

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
