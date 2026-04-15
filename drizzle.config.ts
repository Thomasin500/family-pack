import { existsSync } from "fs";
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load .env.local for local dev. On Vercel, env vars are injected automatically.
if (existsSync(".env.local")) {
  config({ path: ".env.local" });
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
