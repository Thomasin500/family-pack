import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { trips, tripMembers, tripPacks, users } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { getAuthenticatedUser, handleApiError, ApiError } from "@/lib/api-helpers";
import { createTripSchema } from "@/lib/validators";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();

    const result = await db.query.trips.findMany({
      where: eq(trips.householdId, user.householdId!),
      with: {
        members: {
          with: { user: true },
        },
        packs: {
          with: {
            user: true,
            packItems: {
              with: { item: true },
            },
          },
        },
      },
      orderBy: (trips, { desc }) => [desc(trips.createdAt)],
    });

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    const {
      name,
      description,
      startDate,
      endDate,
      location,
      season,
      terrain,
      distanceMiles,
      elevationGainFt,
      elevationHighFt,
      durationDays,
      memberIds,
    } = createTripSchema.parse(await req.json());

    // Verify every memberId belongs to the caller's household.
    const householdMembers = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.householdId, user.householdId!), inArray(users.id, memberIds)));
    if (householdMembers.length !== memberIds.length) {
      throw new ApiError(400, "One or more members are not in your household");
    }

    const [trip] = await db
      .insert(trips)
      .values({
        name,
        description: description ?? null,
        startDate: startDate ?? null,
        endDate: endDate ?? null,
        location: location ?? null,
        season: season ?? null,
        terrain: terrain ?? null,
        distanceMiles: distanceMiles ?? null,
        elevationGainFt: elevationGainFt ?? null,
        elevationHighFt: elevationHighFt ?? null,
        durationDays: durationDays ?? null,
        householdId: user.householdId!,
        createdByUserId: user.id,
      })
      .returning();

    // Create trip members and packs for each member
    const memberValues = memberIds.map((userId: string) => ({
      tripId: trip.id,
      userId,
    }));
    await db.insert(tripMembers).values(memberValues);

    const packValues = memberIds.map((userId: string) => ({
      tripId: trip.id,
      userId,
    }));
    await db.insert(tripPacks).values(packValues);

    // Return the full trip with relations
    const fullTrip = await db.query.trips.findFirst({
      where: eq(trips.id, trip.id),
      with: {
        members: { with: { user: true } },
        packs: { with: { user: true } },
      },
    });

    return NextResponse.json(fullTrip, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
