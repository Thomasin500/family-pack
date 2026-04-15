import { db } from "@/db";
import { users } from "@/db/schema";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await db.execute(sql`SELECT 1 as ok`);
    const allUsers = await db.select().from(users);

    return NextResponse.json({
      status: "ok",
      database: "connected",
      userCount: allUsers.length,
    });
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: String(error) },
      { status: 500 }
    );
  }
}
