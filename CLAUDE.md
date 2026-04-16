@AGENTS.md
@docs/context.md
@docs/spec.md
@docs/roadmap.md
@docs/bugs.md

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

## Before Committing

- **Always run `npx next build`** to catch type errors and build failures before committing. Local `tsc --noEmit` is less strict than the Next.js build.
- **Check for lint errors:** The repo uses Husky pre-commit hooks with lint-staged (ESLint + Prettier). Fix any ESLint errors before committing — warnings are tolerated but errors will block the commit.
- **No `useEffect` + `setState` combos:** The ESLint config enforces `react-hooks/set-state-in-effect` as an error. Use ref-based open-transition detection or derived state instead of resetting state inside effects.
- **Remove unused imports:** ESLint warns on unused vars/imports. Clean these up before committing.
