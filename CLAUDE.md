@AGENTS.md
@docs/context.md
@docs/spec.md
@docs/roadmap.md

# Family Pack — Backpacking Gear App

## Quick Reference

- **Stack:** Next.js 16 + Drizzle ORM + Neon Postgres + Auth.js + Tailwind + shadcn/ui + TanStack Query
- **Local dev:** Docker Postgres (run `docker compose up -d`, then `npm run dev`)
- **Schema changes:** Edit `src/db/schema.ts`, then `npx drizzle-kit push` locally
- **Tests:** `npm run test` (Vitest, 38 tests in `src/lib/__tests__/`)
- **Next.js 16 breaking change:** Middleware is now `proxy.ts` (not `middleware.ts`), export `proxy` (not `middleware`)
- **Dual DB driver:** `src/db/index.ts` uses `pg` locally and `@neondatabase/serverless` in production
- **Weight units:** `WeightUnitProvider` context — use `useWeightUnit()` hook, never hardcode `"imperial"`
- **Node version:** 20 (use `nvm use 20`)
