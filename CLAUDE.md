@AGENTS.md

# Family Pack — Backpacking Gear App

Read these docs for full project context:
- `docs/context.md` — Session briefing: who the user is, what's built, key decisions, current status
- `docs/spec.md` — Full product specification: features, data model, tech stack, architecture
- `docs/roadmap.md` — Phased feature roadmap with all ~140 spec features mapped

## Quick Reference
- **Stack:** Next.js 16 + Drizzle ORM + Neon Postgres + Auth.js + Tailwind + shadcn/ui + TanStack Query
- **Local dev:** Docker Postgres (run `docker compose up -d`, then `npm run dev`)
- **Schema changes:** Edit `src/db/schema.ts`, then `npx drizzle-kit push` locally
- **Tests:** `npm run test` (Vitest, 38 tests in `src/lib/__tests__/`)
- **Next.js 16 breaking change:** Middleware is now `proxy.ts` (not `middleware.ts`), export `proxy` (not `middleware`)
- **Dual DB driver:** `src/db/index.ts` uses `pg` locally and `@neondatabase/serverless` in production
- **Weight units:** `WeightUnitProvider` context — use `useWeightUnit()` hook, never hardcode `"imperial"`
- **Node version:** 20 (use `nvm use 20`)
