import { db } from "@/db";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`SELECT 1 as ok`);
    return NextResponse.json({ status: "ok", database: "connected" });
  } catch {
    return NextResponse.json({ status: "error", database: "unavailable" }, { status: 500 });
  }
}
