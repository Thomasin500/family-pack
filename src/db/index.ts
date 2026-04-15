import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { neon } from "@neondatabase/serverless";
import { Pool } from "pg";
import * as schema from "./schema";

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  if (
    process.env.NODE_ENV === "production" ||
    process.env.USE_NEON === "true"
  ) {
    const sql = neon(url);
    return drizzleNeon({ client: sql, schema });
  } else {
    const pool = new Pool({ connectionString: url });
    return drizzlePg({ client: pool, schema });
  }
}

export const db = createDb();
