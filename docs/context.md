# Family Pack — Session Context Document

> Use this document to brief a new Claude session on the full context of the Family Pack project. Paste this at the start of a conversation to pick up where we left off.

**Last updated:** April 16, 2026

---

## Who Is the User

- **Name:** Thomas Freeman
- **Role:** Full-stack web developer, most familiar with React and Node
- **Working directory:** `/Users/thomasfreeman/GitHub/family-pack/`
- **Backpacker** who hikes with a partner and a dog named Birch (55 lb dog with a Ruffwear Palisades pack)
- Currently tracks gear in a spreadsheet with columns: Category, Name, Model, Type (Carried/Worn/Consumable/Birch Carries), Weight in oz, Weight in lb
- Has ~70 items in the spreadsheet across categories: Big Four, Birch's Stuff, Clothing, Fishing, Kitchen/Food/Water, Tools & Utility
- Calculates Base Weight, Total Carried, Skin Out Total, and weight as % of body weight manually
- Also tracks a "Weight to Lose" section — items being considered for cutting with potential savings

---

## The Project

**Family Pack** is a web app for backpacking gear management and trip planning, focused on couples, families, and pets. The MVP has been built and deployed.

### Core Differentiator

No existing app models a household. They all assume a single user or a single account managing participants. Family Pack models a couple/family as **separate accounts linked into a household** with shared gear, where each person (and pet) manages their own closet and pack.

### The Pitch

> Other apps do solo gear lists. Family Pack does **household** trips — where both people have their own account, their own gear closet, shared household gear, and parents decide who carries what.

### Full Spec Document

The complete product specification is at:

```
docs/spec.md
```

This is a ~1,800 line document covering: product vision, competitive landscape, UI design principles with wireframes, complete tiered feature list (~119 features), tech stack, full Drizzle database schema, page routes, project folder structure, catalog seed strategy, database/hosting setup walkthrough, scaling roadmap, and phased implementation plan. **Read this file before making any architectural or feature decisions.**

---

## Key Decisions Already Made

These were discussed and agreed upon. Do not revisit unless the user asks.

### Scope Simplifications

| Decision                                              | Rationale                                                                                                                                                           |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **One active trip at a time**                         | No need for gear scheduling, conflict detection, or calendar views. The family only does one trip at a time. Dramatically simplifies the data model                 |
| **No gear checkout/availability tracking**            | Shared gear is always available. No need to track which trip has the bear canister                                                                                  |
| **Catalog stores names only (no weights)**            | Manufacturer weights are unreliable. Backpackers weigh their own gear. Catalog just auto-fills brand + model to save typing. Users enter their own measured weights |
| **No trip journaling**                                | OutPack does trip journaling (waypoints, GPX, photos). We're a gear planning tool, not a trip journal. Users can pair us with AllTrails/Gaia for that               |
| **No barcode scanner**                                | Niche feature, unreliable per reviews. Not worth the effort                                                                                                         |
| **Project name: Family Pack**                         | Repo: `family-pack`, Vercel: `familypack.vercel.app`                                                                                                                |
| **Next.js 16 uses proxy.ts instead of middleware.ts** | Breaking change from 15                                                                                                                                             |
| **Drizzle config loads .env.local conditionally**     | `existsSync` check for Vercel compatibility                                                                                                                         |
| **db/index.ts loads .env.local fallback**             | For seed scripts running outside Next.js                                                                                                                            |
| **Build script does NOT run migrations**              | Schema pushed manually to Neon, migrations added later                                                                                                              |
| **ESLint: no-explicit-any downgraded to warning**     | MVP uses `any` in hooks, will type properly later                                                                                                                   |

### Architecture Decisions

| Decision         | Choice                                                  | Rationale                                                                    |
| ---------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Framework        | Next.js 14+ (App Router)                                | User knows React. SSR for share pages. API routes eliminate separate backend |
| Database         | PostgreSQL on Neon                                      | Free tier, relational data fits, `pg_trgm` for fuzzy catalog search          |
| ORM              | Drizzle                                                 | Lighter than Prisma, great TS inference, SQL-like                            |
| Auth             | Auth.js (NextAuth v5)                                   | Google OAuth to start                                                        |
| Styling          | Tailwind + shadcn/ui                                    | Fast iteration, dark mode built in                                           |
| Drag & Drop      | dnd-kit                                                 | Best React DnD, handles cross-column drag                                    |
| Charts           | Recharts                                                | React-native, simple API                                                     |
| Hosting          | Vercel (free) + Neon (free) to start                    | $0/mo. Migrate to Railway if needed later                                    |
| Local dev DB     | Docker Postgres (port 5432)                             | Fast, offline, free. Don't hit Neon during dev                               |
| DB driver        | Dual: `pg` locally, `@neondatabase/serverless` in prod  | One `db/index.ts` switches based on `NODE_ENV`                               |
| Staging          | Vercel preview deploys + Neon branch per PR             | Auto-created, copy-on-write from prod, auto-deleted on merge                 |
| Schema dev       | `drizzle-kit push` locally, `drizzle-kit migrate` in CI | Push for fast iteration, migrations for versioned prod changes               |
| Weight storage   | Integer grams                                           | No floating point errors. Display layer handles oz/lb/kg conversion          |
| Real-time sync   | Polling (5s) or SWR revalidation                        | WebSockets overkill for 2-6 household members                                |
| Auto-save        | Debounced mutations (300ms) + optimistic updates        | No save button anywhere                                                      |
| Primary keys     | UUID                                                    | Merge-safe, shard-safe, offline-sync-safe                                    |
| State management | TanStack Query for server state, React context for UI   | No Redux                                                                     |

### Data Model Key Insights

1. **Owner vs Carrier:** `TripPackItem` has `trip_pack_id` (whose pack it's IN = carrier) and `owned_by_user_id` (whose gear it IS = owner). This one distinction enables: parent carries kid's sleeping bag, human carries overflow dog food, partner carries shared tent.

2. **Pets as Users:** A pet is a User with `role: "pet"`, `managedByUserId` pointing to an adult, and `bodyWeightKg` for carry-limit calculations. No email, no login. Their closet is managed by the adult. In the trip workspace, they get their own pack column. This reuses the entire existing architecture.

3. **Shared gear pool:** Items with `owner_type: "shared"` belong to the household, not a person. On group trips, they appear in an unassigned pool and are dragged into someone's pack column.

4. **Solo alternative linking:** `Item.solo_alt_id` links a personal item to a shared item (e.g., solo tarp <-> 2-person tent). When creating a solo trip from a group template, the app suggests swapping shared gear for solo alternatives.

5. **Templates (designed, not yet built):** A template stores a reusable trip configuration — which items go in which person's pack. Created from existing trips or manually. Each person can have a default loadout that auto-populates when they're added to any trip. Tables: `templates` and `templateItems`.

---

## Competitive Landscape Summary

Researched thoroughly. Rankings:

1. **Hikt** — Best overall polish, cross-platform, offline sync. No household model.
2. **OutPack** — Most feature-rich for trip lifecycle. Has group trips with gear assignment, food/meal planner, trip journaling, gear history, wishlist, social features. Still single-account model.
3. **PackStack** — Best trip metadata + calorie calculator (Pandolf equation). Multi-pack per trip, hiker profiles. Single-account, partner can't edit. Open source on GitHub.
4. **PackWizard** — Best gear research/shopping. Deep gear database with pricing, "find lighter alternatives." Affiliate-driven UX.
5. **LighterPack** — Legacy standard, best inline editing speed. Dated UI, no closet, poor mobile.

### What We Own Exclusively (no competitor does these)

- Household model (separate accounts, shared gear pool)
- Owner vs carrier distinction
- Shared gear drag assignment between packs
- Solo alternative item linking
- What-if mode for weight optimization
- Weight heatmap on item rows
- Carry weight limits with capacity % balancing and auto-suggest
- Age-aware and pet-aware defaults
- Pets as first-class trip members with carry weight limits
- Fork/remix community lists (planned Tier 4)
- Cut list (mark items as "considering cutting" with savings tally)

### What We Deliberately Don't Do (competitors do, we skip)

- Trip journaling / waypoints / GPX / photos (OutPack's territory)
- Full meal planner with food library (OutPack). We have a simpler calorie calc in Tier 3
- Affiliate gear shopping / live pricing (PackWizard's territory)
- Barcode scanner (unreliable)

---

## Catalog Seed Strategy

The catalog IS seeded with **98 products across 24 outdoor brands**. Dev data IS seeded with a household, 3 members, 16 items, and 1 trip.

Two data sources were identified for seeding the product name catalog:

1. **OpenWeightDatabase** (`github.com/OpenWeightDatabase/OpenWeightDatabase/tree/main/db`) — ~30-60 entries. Clean CSV with Brand, Model, Weight columns across 11 category folders. Very small but properly structured.

2. **Featherweight** (`github.com/MooseV2/featherweight/blob/master/docs/assets/ul_items.txt`) — ~1,190 entries. CSV format: `weight,item_name`. Messy: no brand/model split, duplicates, generics mixed with products, multi-language entries. Needs cleanup pipeline with known-brand-list matching.

**Search:** PostgreSQL `pg_trgm` extension for fuzzy typeahead. No Elasticsearch needed.

---

## The User's Actual Gear Data

Thomas provided his real backpacking spreadsheet. Key observations that shaped the design:

- **Birch (dog) is a first-class trip member** with own pack, food, clothing, first aid, carry weight tracked as 20.17% of body weight. This moved pet support from Tier 4 to Tier 1.
- **Tracks "Skin Out Total"** — carried + worn = everything on your body. Added to weight display.
- **Calculates weight as % of body weight** for self and dog. Added to all weight displays.
- **Has a "Weight to Lose" section** — manual what-if analysis. Validated the What-If feature and inspired the simpler "Cut List" in Tier 2.
- **"Not Bringing" as a type** — gear in closet explicitly excluded from trip. Added "Not on This Trip" visibility feature.
- **Activity-specific categories** (Fishing) — validated custom categories, inspired Activity Tags feature.
- **Partner tracked separately** (shows 0.00 in partner column) — validates separate-account household model.

### Sample Items from Spreadsheet

```
Big Four    | Tent         | Nemo Dagger 2p                              | Carried | 59.2 oz
Big Four    | Backpack     | ULA Ultra Catalyst                          | Carried | 42.2 oz
Big Four    | Sleeping Bag | Kelty Cosmic Ultra 800                      | Carried | 43.48 oz
Birch       | Pack         | Ruffwear Palisades with harness             | Birch   | 26.12 oz
Birch       | Food         | 2 Meals                                     | Birch   | 18.65 oz
Clothing    | Hoodie       | Arcteryx Kyanite                            | Carried | 15.77 oz
Clothing    | Pants        | Prana Stretch Zion Green New                 | Worn    | 13.86 oz
Fishing     | Rod + Reel   |                                             | Carried |  9.22 oz
Kitchen     | Stove        | Jet Boil w/ Stand                           | Carried | 16.55 oz
Kitchen     | Water filter | Sawyer and things                           | Carried |  5.7 oz
Tools       | Chair        | Orange Thermarest                           | Carried | 10.28 oz
Tools       | Headlamp     | Blue Petzl Tikkina                          | Carried |  3.25 oz
```

Summary stats from spreadsheet:

- Base Weight: 426.47 oz / 26.65 lb (14.41% body weight)
- Total Carried: 562.66 oz / 35.17 lb (19.01% body weight)
- Skin Out Total: 588.41 oz / 36.78 lb (19.88% body weight)
- Birch's Weight: 177.52 oz / 11.10 lb (20.17% of 55 lb dog)

---

## Feature Tiers (summary — full list in spec doc)

| Tier                            | Count | Key Features                                                                                                |
| ------------------------------- | ----- | ----------------------------------------------------------------------------------------------------------- |
| **Tier 1 — Core MVP**           | ~48   | **BUILT.** Auth, household, gear closet, trip workspace, weight display, pet support, dark mode             |
| **Tier 2 — Quality of Life**    | ~42   | Sharing, checklist, mobile, kits, wishlist, cut list, activity tags, **trip templates, readiness system**   |
| **Tier 3 — Differentiators**    | ~37   | What-if, comparison, calorie calc, gear intelligence, gear history, **loadout view, gamification elements** |
| **Tier 4 — Community & Polish** | ~13   | Public gallery, offline PWA, analytics over time                                                            |

---

## Implementation Phases

| Phase                             | Status  | What                                                                                                                         |
| --------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **1: Foundation**                 | DONE    | Next.js scaffold, Drizzle schema, Docker Postgres, Neon production, Vercel deploy, Google OAuth, CI pipeline                 |
| **2: Gear Closet**                | DONE    | Closet page with tabs, item table with inline editing, add item dialog with catalog typeahead, weight summary                |
| **3: Trip Workspace**             | DONE    | Trip list, new trip dialog, trip workspace with pack columns, shared gear pool, add-to-pack, weight summaries                |
| **4: Core Completion**            | DONE    | Unit toggle, checklist mode, gear history + veterancy labels, loadout view skeleton, Vitest test suite                       |
| **4.5: Quick Wins & Fixes**       | DONE    | 20+ fixes: inline editing, category mgmt, trip edit/delete/complete/search, member mgmt, 4-way weight toggle, dnd categories |
| **5: Trip Stats & Visualization** | Next    | Trip stats panel, shared weight balance, pack class labels, smart trip tags, category charts, metadata expansion             |
| **6: Party View & Loadout**       | Planned | Silhouette cards per member, item slots per zone, camp area for shared gear, dog variant, group view                         |
| **7: Drag-and-Drop + Cut List**   | Planned | Cross-column drag (dnd-kit installed), cut list, "not on this trip" view                                                     |
| **8: Tech Debt + Polish**         | Planned | Zod validation, type hooks, error boundaries, mobile responsive, sharing pages                                               |
| **9: Intelligence & Readiness**   | Planned | Readiness system, activity tags, balance intelligence, gear history insights                                                 |
| **10: Import/Export & Advanced**  | Planned | LighterPack import, CSV/PDF export, reusable kits, comparison view                                                           |
| **11: Community & Scale**         | Planned | Public gallery, offline PWA, trip planning (calorie calc), gear intelligence                                                 |

Full roadmap with all features: `docs/roadmap.md`

---

## Hosting, Scaling & Development Environments

### Environments

All environments are confirmed working.

|               | Local                | Staging (per PR)                 | Production                       |
| ------------- | -------------------- | -------------------------------- | -------------------------------- |
| **App**       | `localhost:3000`     | `feat-xyz.vercel.app`            | `familypack.vercel.app`          |
| **Database**  | Docker Postgres      | Neon branch (auto-created)       | Neon main branch                 |
| **DB driver** | `pg` (node-postgres) | `@neondatabase/serverless`       | `@neondatabase/serverless`       |
| **Schema**    | `drizzle-kit push`   | `drizzle-kit migrate` (in build) | `drizzle-kit migrate` (in build) |
| **Data**      | Seed scripts         | Copy-on-write from prod          | Real data                        |
| **Cost**      | $0                   | $0                               | $0                               |

Key files:

- `docker-compose.yml` — local Postgres container
- `src/db/index.ts` — dual driver (switches on `NODE_ENV`) with `.env.local` fallback for seed scripts
- `.env.local` — local connection string (never committed)
- Vercel + Neon integration auto-injects `DATABASE_URL` per environment

### Scaling

- **Start:** Vercel Free + Neon Free = $0/mo
- **At 100-1,000 users:** Vercel Pro ($20) + Neon Launch ($5) = ~$25-40/mo
- **At 1,000-10,000:** Consider Railway ($8-15/mo all-in) or Coolify + Hetzner ($5/mo)
- **Migration is trivial:** Change one file (`src/db/index.ts`) to swap Neon HTTP driver for standard `pg` pool
- **No vendor lock-in:** Standard Next.js + Postgres + Drizzle runs anywhere

---

## Current Build Status

### Built and Deployed (Phases 1-4)

- Full database schema (14 tables + `completedAt` on trips) pushed to local Docker + Neon production
- Google OAuth authentication (login, session, user creation)
- Household create + join + member management (including pets)
- Invite code display + copy on dashboard
- Gear closet with tabs (user name/Partner/Pets/Shared), full inline editing (name, brand, model, category, notes), catalog typeahead
- Trip list with creation, duplication, deletion, search + sort, completion status
- Trip workspace with pack columns, shared gear pool, add-to-pack per column, weight summaries
- 9,065-product catalog seeded on production from 4 sources (107 brands)
- Dev seed data (household, 3 users, 10 categories, 16 items, 1 trip)
- CI pipeline (typecheck + lint), Prettier + Husky pre-commit hooks
- Production deploy on Vercel + Neon with preview branch support

### Built in Phase 4 (April 14-15, 2026)

- **4-way weight unit toggle** — cycle oz → lb → g → kg via nav bar button, stored in localStorage, all displays + inline editing respect unit
- **Checklist mode** — Toggle persisted via `?checklist=true` URL param. Checkboxes per item, progress bar per pack, strikethrough + dimming
- **Gear history & veterancy** — Trip count per item, veterancy labels: Breaking In / Trusted / Veteran / Legendary (color-coded)
- **Loadout view skeleton** — CSS grid pack-zone modal per person. Zones: Brain, Main Top/Mid/Bottom, Side Pockets, External, Worn
- **Carry weight warnings** — Color-coded body weight % (green/yellow/orange/red) with separate pet thresholds
- **Catalog pipeline** — 9,065 products, merge + dedup pipeline, community promotion logic, popularity counter
- **Test suite** — 82 Vitest tests across 7 files
- **Web app extras** — Metadata + OG tags, 404 page, error boundary, loading skeletons, toast notifications, Vercel Analytics

### Built in Phase 4.5 (April 15, 2026)

- **Closet improvements** — User's name on tab (not "Mine"), clickable worn/consumable/carried badges, full inline editing (name/brand/model/category/notes), collapsible + drag-reorderable categories (dnd-kit), category management dialog (add/edit/delete with color picker + safe delete)
- **Trip improvements** — Edit trip dialog (name/dates/location/season/terrain), trip search + sort, trip completion (completedAt, Complete/Reopen, banner, badge), trip delete, trip member management (add/remove post-creation), collapsible pack columns, add-to-pack "+" per column, empty state buttons, clear season option
- **Household improvements** — Member/pet edit API (PATCH/DELETE), pet edit UI (inline name/weight/breed), pet weight clickable
- **System improvements** — Structured API errors (ApiResponseError class), item delete warns if in trip, category delete safety (409 + moveTo), dead code cleanup, "- LOCAL" in browser tab

### Built in Phase 8: Tech Debt (April 15, 2026)

- **Zod validation on all API routes** — 14 Zod schemas in `src/lib/validators.ts`, every POST/PATCH route validated. No more raw `...body` spreads. ZodError caught in `handleApiError` with 400 response.
- **Typed hooks** — All 8 hook files return proper types (`Item[]`, `Trip`, `Category[]`, etc.) instead of `any[]`. Shared types in `src/types/index.ts`.
- **Error boundaries** — `ErrorBoundary` component wrapping pack columns and closet item table. Graceful failure with retry button.
- **Custom favicon** — Backpack logo as favicon (16/32/48px), apple-touch-icon (180px), PWA icons (192/512px). Logo in nav bar.
- **Database backups** — GitHub Actions workflow runs `pg_dump` every 4 hours, stores gzipped artifacts with 30-day retention. Manual trigger available.

### Built in Phase 4.6: Beta-ready Polish (April 16, 2026)

A long iteration pass on UX + self-service features so the app is ready to hand to beta testers. ~18 shipped items:

- **Confirm-dialog system** — `src/components/providers/confirm-provider.tsx` with `useConfirm()`. All destructive prompts (delete item, delete category, delete trip, remove pack item, remove trip member, delete managed member, leave household) use a centered shadcn Dialog with backdrop. Everyday success toasts stay small/corner.
- **Click-outside editor dismissal** — `useClickOutside` hook; every inline editor closes when clean, shows red-ring "Save or Cancel" warning when dirty. Applied to closet rows, weights, categories, dashboard weight/pet, shared-assign chip.
- **Changelog drawer** — typed entries in `src/lib/changelog.ts`, rendered via a bottom drawer on every `/app/*` page. Drawer header is fully clickable; Roadmap pill pinned to the absolute far right of the footer via absolute positioning.
- **Roadmap page (`/app/roadmap`)** — `src/lib/roadmap.ts` rendered as a vertical timeline. Completed phases collapse into a group at the top, active phases below. Status icons + badges.
- **Roadmap suggestions (new DB table `roadmap_suggestion`)** — POST/GET/PATCH/DELETE routes at `/api/roadmap/suggestions`. Per-phase + general "Suggest" buttons on the roadmap page. Inline edit (title / description / phase) for authors. Household-scoped visibility. `npm run suggestions:list` CLI for dev triage across households.
- **Unified trip add flow** — shared gear shows in the per-pack Add Items dialog; the large shared-gear panel replaced by a thin `UnassignedSharedBar` that only appears when there's unassigned shared gear.
- **Trip tile per-person weights** — each tile shows Pack / Base / Carry columns, with pack-class color on the base weight. Reads from household settings. First-names only for compactness.
- **Trip category subheader** — each category in a pack column has a chevron collapse, bigger/bolder name in the category color, item count + subtotal + sort menu on a separate subline. Weights right-aligned; delete ✕ on hover after the weight. Item names wrap instead of truncating.
- **Trip workspace scaling** — 1 pack centered, 2–3 in a grid, 4+ → horizontal snap-scroll with 320px min-width cards and a "← scroll to see all N packs →" hint.
- **Household Settings page (`/app/settings/household`)** — new. Configurable pack-class tiers (Ultralight/Lightweight/Light/Traditional cutoffs in lb), 4-tier human carry %, 4-tier pet carry %, category manager (same modal as closet), Danger Zone with Leave Household. Reached via a gear icon in the nav (replaces the old dashboard link).
- **Leave Household** — `POST /api/household/leave` nulls `householdId` on self + managed pets/children without killing the session. User lands back on HouseholdSetup with gear intact; joining a new household auto-imports it via member-scoped query.
- **Change item owner** — closet inline editor has an Owner dropdown (every household member + Shared). Item hops tabs on save. PATCH route now enforces shared/personal owner consistency.
- **Sort menus** — shared `CategorySortMenu` with Type / Name A→Z / Name Z→A / Weight ↑ / Weight ↓. Default sort groups worn → carried → consumable. Trigger reads "Sort by: <icon>".
- **Security + schema hygiene pass** — `/api/catalog/select` requires auth. `/api/health` no longer leaks user count. Security headers in `next.config.ts` (X-Frame, X-Content-Type, Referrer, Permissions, HSTS). All FKs have explicit `ON DELETE SET NULL`. `items.ownerId` polymorphic pattern documented in-schema.
- **Session-invalidation helper** — `invalidateUserSessions(userId)` wired into the existing member DELETE path for future adult-removal flows.
- **4-tier carry warnings** — Comfortable / OK / Warn / Overloaded for both humans and pets, driven by household settings.
- **Cursor-pointer on all Button variants** — no more ambiguous pointer on hover.

### Next Up (Phase 5: Trip Stats & Visualization)

- Trip stats collapsible panel (per-person weight breakdown, category bar charts, shared gear balance)
- Pack class labels rendered in the trip workspace (thresholds already configurable via household settings)
- Smart auto-derived trip tags (Cold Weather, Dog Friendly, Ultralight, etc.)
- Trip metadata expansion (distance, duration, elevation fields)
- Category weight charts (recharts)

### Schema status (as of April 16)

- All schema changes pushed to local Docker + Neon prod.
- Recent additions: `roadmap_suggestion` table; `household.settings` jsonb column; FK `ON DELETE SET NULL` on users.householdId, items.categoryId, items.catalogProductId, trips.createdByUserId, tripPackItems.ownedByUserId.
- `drizzle-kit push` to Neon: **use the direct (non-pooled) URL**. Runtime still uses the pooled URL. After a push, if Vercel functions hit stale `relation does not exist` errors, flush the Neon cache — the serverless edge caches table metadata.

### Known Issues / Tech Debt

- ~70 `any` type warnings remaining in component files (ESLint set to warn; non-blocking)
- No drag-and-drop between packs yet (Phase 7 planned; dnd-kit installed)
- No web app manifest yet (PWA icons are ready for it)
- Mobile trip workspace (tabbed person switcher) still to-do (Phase 8b)
- Full bug list with UX issues at `docs/bugs.md`

---

## Conversation Style Notes

- Thomas prefers thorough analysis and honest competitive assessments (including admitting when competitors do things better)
- Values practical, buildable plans over theoretical ideals
- Thinks in terms of his real-world workflow (the spreadsheet) rather than abstract features
- Appreciates when I research competitors live rather than relying on stale knowledge
- Excited about gamification and RPG-style loadout concepts. Wants the app to feel fun and engaging, not just a spreadsheet.

---

## Key Files

| Path                                   | Purpose                                                                                                                                                                                      |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/spec.md`                         | Full product specification (~1,800 lines)                                                                                                                                                    |
| `docs/context.md`                      | This file — session context for new Claude conversations                                                                                                                                     |
| `docs/roadmap.md`                      | Condensed feature roadmap with 10 phases, all spec features mapped                                                                                                                           |
| `docs/bugs.md`                         | Active bug list and UX issues                                                                                                                                                                |
| `src/db/schema.ts`                     | Full Drizzle schema (14 tables, all enums, relations, type exports)                                                                                                                          |
| `src/db/index.ts`                      | Dual driver connection (pg local, Neon prod) with .env.local fallback                                                                                                                        |
| `src/lib/auth.ts`                      | Auth.js config (Google OAuth + Drizzle adapter)                                                                                                                                              |
| `src/lib/api-helpers.ts`               | getAuthenticatedUser(), handleApiError() (catches ApiError + ZodError), ApiError class                                                                                                       |
| `src/lib/validators.ts`                | Zod schemas for all API request bodies (14 schemas: createItem, updateTrip, addPackItem, etc.)                                                                                               |
| `src/types/index.ts`                   | Shared TypeScript interfaces for all entities (Item, Trip, Category, User, TripPack, TripPackItem, etc.)                                                                                     |
| `src/lib/weight.ts`                    | Weight conversion utilities (4-way unit support: oz/lb/g/kg, displayWeight, inputToGrams, gramsToInput)                                                                                      |
| `src/lib/fetch.ts`                     | fetchApi helper + ApiResponseError class (preserves structured error bodies)                                                                                                                 |
| `src/lib/gear-veterancy.ts`            | Veterancy level calculation + color mapping                                                                                                                                                  |
| `src/lib/pack-zones.ts`                | Pack zone definitions + category-to-zone mapping for loadout view                                                                                                                            |
| `src/lib/constants.ts`                 | Default categories, carry limit constants                                                                                                                                                    |
| `src/app/api/`                         | 21 API route files — all POST/PATCH validated with Zod schemas                                                                                                                               |
| `src/hooks/`                           | 8 TanStack Query hook files — all typed with proper return types from `src/types/`                                                                                                           |
| `src/components/providers/`            | QueryProvider, WeightUnitProvider (4-way cycle: oz/lb/g/kg, localStorage-backed)                                                                                                             |
| `src/components/ui/error-boundary.tsx` | React ErrorBoundary class component with retry button                                                                                                                                        |
| `src/components/app/`                  | Nav bar (with unit toggle + logo), dashboard (with pet edit + body weight), household setup                                                                                                  |
| `src/components/closet/`               | Closet page, item table (inline editing, dnd-kit reorder, collapsible categories), add item dialog, catalog typeahead, weight summary, category manager                                      |
| `src/components/trips/`                | Trips page (search/sort/delete), trip workspace (checklist/complete/edit/members), pack column (collapsible, add-to-pack), shared gear pool, edit trip dialog, members dialog, loadout modal |
| `src/lib/carry-warnings.ts`            | Body weight % warning thresholds (human vs pet)                                                                                                                                              |
| `src/lib/catalog-promotion.ts`         | Community catalog growth — auto-promotes stable items when packed                                                                                                                            |
| `src/lib/__tests__/`                   | 7 Vitest test files — 82 tests (weight, veterancy, zones, carry-warnings, fetch, api-helpers, utils)                                                                                         |
| `data/catalog/`                        | Catalog pipeline: known-brands.json, source extracts, merged-catalog.json (9,065 items), merge-report.txt                                                                                    |
| `scripts/catalog/`                     | Catalog extraction + merge pipeline (extract-gwdb, extract-lighterpack, extract-featherweight, merge-catalog, brand-matcher)                                                                 |
| `scripts/seed-catalog.ts`              | Seeds 98 hand-curated catalog products                                                                                                                                                       |
| `scripts/seed-catalog-merged.ts`       | Seeds full 9,065-item merged catalog                                                                                                                                                         |
| `scripts/seed-dev-data.ts`             | Seeds dev household, users, items, categories, trip                                                                                                                                          |
| `docker-compose.yml`                   | Local Postgres for development                                                                                                                                                               |
| `vitest.config.ts`                     | Vitest test configuration with @ alias                                                                                                                                                       |
| `.github/workflows/ci.yml`             | CI pipeline (typecheck + lint)                                                                                                                                                               |
| `.github/workflows/backup.yml`         | Database backup — pg_dump every 4 hours, 30-day artifact retention                                                                                                                           |
