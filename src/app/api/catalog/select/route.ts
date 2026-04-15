import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { catalogProducts } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { handleApiError, ApiError } from "@/lib/api-helpers";

/** Increment popularity counter when a user selects a catalog item from typeahead. */
export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) throw new ApiError(400, "ID is required");

    await db
      .update(catalogProducts)
      .set({ popularity: sql`${catalogProducts.popularity} + 1` })
      .where(eq(catalogProducts.id, id));

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
