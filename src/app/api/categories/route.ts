import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { getAuthenticatedUser, handleApiError } from "@/lib/api-helpers";
import { createCategorySchema } from "@/lib/validators";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();

    const result = await db
      .select()
      .from(categories)
      .where(eq(categories.householdId, user.householdId!))
      .orderBy(asc(categories.sortOrder));

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    const { name, color, sortOrder } = createCategorySchema.parse(await req.json());

    const [category] = await db
      .insert(categories)
      .values({
        name,
        color: color ?? undefined,
        sortOrder: sortOrder ?? 0,
        householdId: user.householdId!,
      })
      .returning();

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
