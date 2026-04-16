import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { households, users, categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { handleApiError, ApiError } from "@/lib/api-helpers";
import { nanoid } from "nanoid";
import { DEFAULT_CATEGORIES } from "@/lib/constants";
import { createHouseholdSchema } from "@/lib/validators";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) throw new ApiError(401, "Not authenticated");

    const user = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });
    if (!user) throw new ApiError(401, "User not found");

    if (!user.householdId) {
      return NextResponse.json({ household: null, members: [] });
    }

    const household = await db.query.households.findFirst({
      where: eq(households.id, user.householdId),
    });

    const members = await db.select().from(users).where(eq(users.householdId, user.householdId));

    return NextResponse.json({ household, members, currentUserId: user.id });
  } catch (error) {
    return handleApiError(error);
  }
}

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

    const { name } = createHouseholdSchema.parse(await req.json());

    const inviteCode = nanoid(8);

    const [household] = await db.insert(households).values({ name, inviteCode }).returning();

    await db.update(users).set({ householdId: household.id }).where(eq(users.id, user.id));

    const defaultCats = DEFAULT_CATEGORIES.map((cat) => ({
      name: cat.name,
      color: cat.color,
      sortOrder: cat.sortOrder,
      householdId: household.id,
    }));

    await db.insert(categories).values(defaultCats);

    return NextResponse.json({ household }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
