import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { roadmapSuggestions } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getAuthenticatedUser, handleApiError, ApiError } from "@/lib/api-helpers";
import { updateRoadmapSuggestionSchema } from "@/lib/validators";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser();
    const { id } = await params;
    const body = updateRoadmapSuggestionSchema.parse(await req.json());

    // Must be in the same household. Any household member can edit their own
    // suggestion; only the author can edit title/description/phase. Status can
    // be changed by anyone in the household (so you can mark "reviewing" etc).
    const existing = await db.query.roadmapSuggestions.findFirst({
      where: and(
        eq(roadmapSuggestions.id, id),
        eq(roadmapSuggestions.householdId, user.householdId!)
      ),
    });
    if (!existing) throw new ApiError(404, "Suggestion not found");

    const editingContent =
      body.title !== undefined || body.description !== undefined || body.phaseId !== undefined;
    if (editingContent && existing.userId !== user.id) {
      throw new ApiError(403, "Only the author can edit this suggestion's content");
    }

    const [updated] = await db
      .update(roadmapSuggestions)
      .set({ ...body })
      .where(eq(roadmapSuggestions.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
