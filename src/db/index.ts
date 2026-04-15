import * as schema from "./schema";

let _db: ReturnType<typeof createDb> | null = null;

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  if (
    process.env.NODE_ENV === "production" ||
    process.env.USE_NEON === "true"
  ) {
    // Production / Staging: Neon serverless HTTP driver
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { neon } = require("@neondatabase/serverless");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { drizzle } = require("drizzle-orm/neon-http");
    const sql = neon(url);
    return drizzle({ client: sql, schema });
  } else {
    // Local development: standard pg driver (Docker Postgres)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { drizzle } = require("drizzle-orm/node-postgres");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Pool } = require("pg");
    const pool = new Pool({ connectionString: url });
    return drizzle({ client: pool, schema });
  }
}

// Lazy initialization — only creates the connection when first accessed
export const db = new Proxy({} as ReturnType<typeof createDb>, {
  get(_target, prop) {
    if (!_db) {
      _db = createDb();
    }
    return (_db as Record<string | symbol, unknown>)[prop];
  },
});
