import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { handleApiError, ApiError } from "@/lib/api-helpers";
import { updateProfileSchema } from "@/lib/validators";

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) throw new ApiError(401, "Not authenticated");

    const user = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });
    if (!user) throw new ApiError(401, "User not found");

    const body = updateProfileSchema.parse(await req.json());

    const [updated] = await db
      .update(users)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(users.id, user.id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
