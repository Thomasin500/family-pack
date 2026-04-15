import * as schema from "./schema";

function createDb() {
  if (
    process.env.NODE_ENV === "production" ||
    process.env.USE_NEON === "true"
  ) {
    // Production / Staging: Neon serverless HTTP driver
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { neon } = require("@neondatabase/serverless");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { drizzle } = require("drizzle-orm/neon-http");
    const sql = neon(process.env.DATABASE_URL!);
    return drizzle({ client: sql, schema });
  } else {
    // Local development: standard pg driver (Docker Postgres)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { drizzle } = require("drizzle-orm/node-postgres");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Pool } = require("pg");
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    return drizzle({ client: pool, schema });
  }
}

export const db = createDb();
