import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { catalogProducts } from "@/db/schema";
import { sql } from "drizzle-orm";
import { getAuthenticatedUser, handleApiError } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    await getAuthenticatedUser();

    const query = req.nextUrl.searchParams.get("q") ?? "";

    if (query.length < 2) {
      return NextResponse.json([]);
    }

    const results = await db
      .select()
      .from(catalogProducts)
      .where(sql`similarity(${catalogProducts.searchText}, ${query}) > 0.15`)
      .orderBy(sql`similarity(${catalogProducts.searchText}, ${query}) DESC`)
      .limit(8);

    return NextResponse.json(results);
  } catch (error) {
    return handleApiError(error);
  }
}
