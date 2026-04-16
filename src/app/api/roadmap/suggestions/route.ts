import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { roadmapSuggestions } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { getAuthenticatedUser, handleApiError } from "@/lib/api-helpers";
import { createRoadmapSuggestionSchema } from "@/lib/validators";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    const rows = await db.query.roadmapSuggestions.findMany({
      where: eq(roadmapSuggestions.householdId, user.householdId!),
      orderBy: [desc(roadmapSuggestions.createdAt)],
    });
    return NextResponse.json(rows);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    const body = createRoadmapSuggestionSchema.parse(await req.json());

    const [created] = await db
      .insert(roadmapSuggestions)
      .values({
        userId: user.id,
        householdId: user.householdId!,
        phaseId: body.phaseId ?? null,
        title: body.title,
        description: body.description,
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    // Author OR anyone in the household can delete. Author-only would require
    // rejecting if suggestion.userId !== user.id — keep it household-wide for now.
    await db
      .delete(roadmapSuggestions)
      .where(
        and(eq(roadmapSuggestions.id, id), eq(roadmapSuggestions.householdId, user.householdId!))
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
