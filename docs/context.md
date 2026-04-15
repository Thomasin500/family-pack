# Family Pack — Session Context Document

> Use this document to brief a new Claude session on the full context of the Family Pack project. Paste this at the start of a conversation to pick up where we left off.

**Last updated:** April 15, 2026

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

| Phase                               | Status  | What                                                                                                                     |
| ----------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------ |
| **1: Foundation**                   | DONE    | Next.js scaffold, Drizzle schema, Docker Postgres, Neon production, Vercel deploy, Google OAuth, CI pipeline             |
| **2: Gear Closet**                  | DONE    | Closet page with tabs, item table with inline editing, add item dialog with catalog typeahead, weight summary            |
| **3: Trip Workspace**               | DONE    | Trip list, new trip dialog, trip workspace with pack columns, shared gear pool, add-to-pack, weight summaries            |
| **4: Core Completion**              | DONE    | Unit toggle (imperial/metric), checklist mode, gear history + veterancy labels, loadout view skeleton, Vitest test suite |
| **5: Trip Experience**              | Next    | Drag-and-drop (dnd-kit), cut list + wishlist, what-if mode, templates, trip duplication                                  |
| **6: Intelligence & Gamification**  | Planned | Activity tags, pack class labels, smart trip tags, readiness system, weight trends, party view                           |
| **7: Polish & Completeness**        | Planned | Mobile, closet search, weight display gaps, editing power, sharing pages, age-aware defaults                             |
| **8: Import/Export & Kits**         | Planned | LighterPack import, CSV/PDF export, reusable kits                                                                        |
| **9: Advanced Loadout & Analytics** | Planned | SVG pack overlay, person silhouette, dog variant, group view, comparison view                                            |
| **10: Community & Scale**           | Planned | Public gallery, offline PWA, trip planning (calorie calc), gear intelligence                                             |

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

### Built and Deployed (Phases 1-3)

- Full database schema (14 tables) pushed to local Docker + Neon production
- Google OAuth authentication (login, session, user creation)
- Household create + join + member management (including pets)
- Invite code display + copy on dashboard
- Gear closet with tabs (Mine/Partner/Shared), inline editing, catalog typeahead
- Trip list with new trip creation (who's going + metadata)
- Trip workspace with pack columns, shared gear pool, weight summaries
- 98-product catalog seeded from 24 outdoor brands
- Dev seed data (household, 3 users, 10 categories, 16 items, 1 trip)
- CI pipeline (typecheck + lint)
- Production deploy on Vercel + Neon with preview branch support

### Built in Phase 4 (April 14-15, 2026 — not yet pushed to prod)

- **Unit preference toggle** — imperial/metric switch in nav bar, persisted to DB, flows through all weight displays via `WeightUnitProvider` context. Inline editing respects unit (oz vs g). API: `GET/PATCH /api/user/preferences`
- **Checklist mode** — Toggle on trip workspace header. Checkboxes per item, progress bar per pack ("5/22 packed"), strikethrough + dimming on checked items. Schema: `isChecked` boolean on `trip_pack_items`
- **Gear history & veterancy** — Trip count per item via join query (`GET /api/items/history`). Veterancy labels in closet: Breaking In / Trusted / Veteran / Legendary (color-coded, with trip count tooltip)
- **Loadout view skeleton** — CSS grid pack-zone modal per person. Zones: Brain, Main Top/Mid/Bottom, Side Pockets, External, Worn. Category-to-zone mapping
- **Carry weight warnings** — Color-coded body weight % (green/yellow/orange/red) with separate pet thresholds
- **Body weight input for humans** — Inline editable on dashboard, respects imperial/metric
- **Closet search** — Search bar filtering by name, brand, model, category
- **Trip duplication** — Deep copy (members, packs, pack items) via copy button on trip cards. API: `POST /api/trips/[id]/duplicate`
- **Catalog pipeline** — 9,065 products from 4 sources (hand-curated + Gear Weight DB + LighterPack lists + Featherweight). Known-brands list (107 brands with aliases). Merge + dedup pipeline with QA report. Community promotion logic (auto-adds stable items when packed on trips). Popularity counter on typeahead selection
- **Test suite** — 65 Vitest tests across 7 files (81% coverage on src/lib/)
- **Web app extras** — Metadata + OG tags, 404 page, error boundary, loading skeletons, toast notifications with delete confirmations, Vercel Analytics, robots.txt
- **DX** — Prettier, Husky pre-commit hooks, lint-staged, Dependabot, seed scripts, format scripts, dynamic imports for modals, thorough README

### On Fast Follow List (Phase 5+)

- Drag-and-drop between pack columns (dnd-kit)
- Cut list + wishlist (trip-level + closet-level)
- What-if mode (extends cut list — ghost items, swap simulation)
- Trip templates + default loadouts (new schema needed)
- Readiness system (Ten Essentials fuzzy matching, hybrid approach, warnings on by default)
- Gamification Phase A (pack class labels, dog class labels, smart auto-derived trip tags)
- Gamification Phase B (weight trend charts by season, party composition modal, carrier history)
- Activity tags (tag picker UI, closet filter, trip activity selection — schema column exists)
- Reusable kits (schema exists, needs API + UI)
- CSV/PDF export, LighterPack import

### Known Issues / Tech Debt

- ~43 `any` types across 9 component files (ESLint set to warn)
- API PATCH routes spread raw body without Zod schema validation
- No drag-and-drop between packs yet (items added via dialog)
- No custom favicon (still default Next.js icon) or web app manifest
- Catalog search requires pg_trgm extension enabled on Neon (may need manual setup)
- Schema changes (`isChecked`, `sourceCount`, `popularity`) need `drizzle-kit push` locally and Neon migration for prod
- Catalog needs to be seeded on production (`npm run seed:catalog:merged`)

---

## Conversation Style Notes

- Thomas prefers thorough analysis and honest competitive assessments (including admitting when competitors do things better)
- Values practical, buildable plans over theoretical ideals
- Thinks in terms of his real-world workflow (the spreadsheet) rather than abstract features
- Appreciates when I research competitors live rather than relying on stale knowledge
- Excited about gamification and RPG-style loadout concepts. Wants the app to feel fun and engaging, not just a spreadsheet.

---

## Key Files

| Path                           | Purpose                                                                                                                                                                           |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/spec.md`                 | Full product specification (~1,800 lines)                                                                                                                                         |
| `docs/context.md`              | This file — session context for new Claude conversations                                                                                                                          |
| `docs/roadmap.md`              | Condensed feature roadmap with 10 phases, all spec features mapped                                                                                                                |
| `src/db/schema.ts`             | Full Drizzle schema (14 tables, all enums, relations, type exports)                                                                                                               |
| `src/db/index.ts`              | Dual driver connection (pg local, Neon prod) with .env.local fallback                                                                                                             |
| `src/lib/auth.ts`              | Auth.js config (Google OAuth + Drizzle adapter)                                                                                                                                   |
| `src/lib/api-helpers.ts`       | getAuthenticatedUser(), handleApiError(), ApiError class                                                                                                                          |
| `src/lib/weight.ts`            | Weight conversion utilities (gramsToOz, displayWeight, bodyWeightPercent)                                                                                                         |
| `src/lib/gear-veterancy.ts`    | Veterancy level calculation + color mapping                                                                                                                                       |
| `src/lib/pack-zones.ts`        | Pack zone definitions + category-to-zone mapping for loadout view                                                                                                                 |
| `src/lib/constants.ts`         | Default categories, carry limit constants                                                                                                                                         |
| `src/lib/fetch.ts`             | Shared fetchApi helper for hooks                                                                                                                                                  |
| `src/app/api/`                 | 16 API route files (household, categories, items, items/history, trips, pack items, catalog search, user/preferences)                                                             |
| `src/hooks/`                   | 9 TanStack Query hook files (household, categories, items, item-history, trips, pack items, catalog search, user-preferences)                                                     |
| `src/components/providers/`    | QueryProvider, WeightUnitProvider (React context for imperial/metric)                                                                                                             |
| `src/components/app/`          | Nav bar (with unit toggle), dashboard (with body weight input), household setup                                                                                                   |
| `src/components/closet/`       | Closet page (with search), item table (with veterancy labels), add item dialog, catalog typeahead (with popularity tracking), weight summary                                      |
| `src/components/trips/`        | Trips page (with duplicate), trip workspace (with checklist toggle), pack column (with checklist + loadout + carry warnings), shared gear pool, add to pack dialog, loadout modal |
| `src/lib/carry-warnings.ts`    | Body weight % warning thresholds (human vs pet)                                                                                                                                   |
| `src/lib/catalog-promotion.ts` | Community catalog growth — auto-promotes stable items when packed                                                                                                                 |
| `src/lib/__tests__/`           | 7 Vitest test files — 65 tests (weight, veterancy, zones, carry-warnings, fetch, api-helpers, utils)                                                                              |
| `data/catalog/`                | Catalog pipeline: known-brands.json, source extracts, merged-catalog.json (9,065 items), merge-report.txt                                                                         |
| `scripts/catalog/`             | Catalog extraction + merge pipeline (extract-gwdb, extract-lighterpack, extract-featherweight, merge-catalog, brand-matcher)                                                      |
| `scripts/seed-catalog.ts`      | Seeds 98 catalog products                                                                                                                                                         |
| `scripts/seed-dev-data.ts`     | Seeds dev household, users, items, categories, trip                                                                                                                               |
| `docker-compose.yml`           | Local Postgres for development                                                                                                                                                    |
| `vitest.config.ts`             | Vitest test configuration with @ alias                                                                                                                                            |
| `.github/workflows/ci.yml`     | CI pipeline (typecheck + lint)                                                                                                                                                    |
