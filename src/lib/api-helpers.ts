import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ZodError } from "zod";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

export async function getAuthenticatedUser() {
  const session = await auth();
  if (!session?.user?.email) throw new ApiError(401, "Not authenticated");

  const user = await db.query.users.findFirst({
    where: eq(users.email, session.user.email),
  });
  if (!user) throw new ApiError(401, "User not found");
  if (!user.householdId) throw new ApiError(403, "No household");

  return user;
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  if (error instanceof ZodError) {
    return Response.json({ error: error.issues[0].message }, { status: 400 });
  }
  console.error(error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
