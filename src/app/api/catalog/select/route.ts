import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { catalogProducts } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { handleApiError } from "@/lib/api-helpers";
import { catalogSelectSchema } from "@/lib/validators";

/** Increment popularity counter when a user selects a catalog item from typeahead. */
export async function POST(req: NextRequest) {
  try {
    const { id } = catalogSelectSchema.parse(await req.json());

    await db
      .update(catalogProducts)
      .set({ popularity: sql`${catalogProducts.popularity} + 1` })
      .where(eq(catalogProducts.id, id));

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
