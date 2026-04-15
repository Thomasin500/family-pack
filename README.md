# Family Pack

Backpacking gear management for couples, families, and pets. Track weights, plan trips, and balance packs across your whole household.

**Live:** [familypack.vercel.app](https://familypack.vercel.app)

## What Makes This Different

Every other gear app assumes a single user. Family Pack models a **household** — where each person has their own account, their own gear closet, shared household gear, and the family decides who carries what.

- **Owner vs carrier** — Your partner owns their sleeping bag, but you might carry it
- **Shared gear pool** — The tent belongs to the household, not one person. Drag it into whoever's pack
- **Pets as first-class members** — Birch the dog gets her own pack column, carry weight limits, and veterancy tracking
- **Weight balancing** — See all packs side by side and spot who's overloaded

## Tech Stack

| Layer     | Choice                                                   |
| --------- | -------------------------------------------------------- |
| Framework | Next.js 16 (App Router)                                  |
| Language  | TypeScript (strict)                                      |
| Database  | PostgreSQL — Docker locally, Neon in production          |
| ORM       | Drizzle                                                  |
| Auth      | Auth.js (NextAuth v5) with Google OAuth                  |
| Styling   | Tailwind CSS 4 + shadcn/ui                               |
| State     | TanStack Query (server state) + React Context (UI state) |
| Testing   | Vitest                                                   |
| Hosting   | Vercel + Neon (both free tier)                           |
| Analytics | Vercel Analytics                                         |

## Prerequisites

- **Node.js 20** (use `nvm use` — `.nvmrc` is included)
- **Docker** (for the local PostgreSQL database)
- **Google OAuth credentials** (for authentication)

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/your-username/family-pack.git
cd family-pack
nvm use
npm install
```

### 2. Set up environment variables

Create `.env.local` in the project root:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/familypack
AUTH_SECRET=your-random-secret-here
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
```

Generate `AUTH_SECRET` with: `openssl rand -base64 32`

For Google OAuth, create credentials at [console.cloud.google.com](https://console.cloud.google.com/apis/credentials) with `http://localhost:3000/api/auth/callback/google` as the redirect URI.

### 3. Start the database

```bash
docker compose up -d
```

### 4. Push the schema

```bash
npm run db:push
```

### 5. Seed data (optional)

```bash
npm run seed          # Seeds catalog (98 products) + dev data (household, users, items, trip)
npm run seed:catalog  # Seeds only the product catalog
npm run seed:dev      # Seeds only the dev household/users/items
```

### 6. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script                 | What it does                       |
| ---------------------- | ---------------------------------- |
| `npm run dev`          | Start dev server (Turbopack)       |
| `npm run build`        | Production build                   |
| `npm start`            | Start production server            |
| `npm test`             | Run tests (Vitest)                 |
| `npm run test:watch`   | Run tests in watch mode            |
| `npm run typecheck`    | TypeScript type checking           |
| `npm run lint`         | ESLint                             |
| `npm run format`       | Prettier format all files          |
| `npm run format:check` | Check Prettier formatting          |
| `npm run db:push`      | Push schema to local DB            |
| `npm run db:generate`  | Generate Drizzle migrations        |
| `npm run db:migrate`   | Run Drizzle migrations             |
| `npm run db:studio`    | Open Drizzle Studio (DB browser)   |
| `npm run db:reset`     | Reset local DB (destroys all data) |
| `npm run seed`         | Seed catalog + dev data            |
| `npm run seed:catalog` | Seed product catalog only          |
| `npm run seed:dev`     | Seed dev data only                 |

## Project Structure

```
family-pack/
├── .github/
│   ├── workflows/ci.yml        # CI: typecheck + lint + test
│   └── dependabot.yml          # Automated dependency updates
├── docs/
│   ├── context.md              # Session context for AI-assisted development
│   ├── spec.md                 # Full product specification (~1,800 lines)
│   └── roadmap.md              # Phased feature roadmap (10 phases, ~140 features)
├── scripts/
│   ├── seed-catalog.ts         # Seeds 98 outdoor gear products
│   └── seed-dev-data.ts        # Seeds dev household, users, items, trip
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout (fonts, metadata, analytics, toasts)
│   │   ├── page.tsx            # Landing page
│   │   ├── not-found.tsx       # 404 page
│   │   ├── login/page.tsx      # Login page
│   │   ├── app/
│   │   │   ├── layout.tsx      # Authenticated layout (auth check, nav, providers)
│   │   │   ├── page.tsx        # Dashboard
│   │   │   ├── error.tsx       # Error boundary
│   │   │   ├── loading.tsx     # Loading skeleton
│   │   │   ├── closet/         # Gear closet page
│   │   │   └── trips/          # Trips list + trip workspace pages
│   │   └── api/
│   │       ├── auth/           # NextAuth route handler
│   │       ├── catalog/search/ # Fuzzy product catalog search
│   │       ├── categories/     # Category CRUD
│   │       ├── health/         # Health check endpoint
│   │       ├── household/      # Household create/join/members
│   │       ├── items/          # Item CRUD + history (trip counts)
│   │       ├── trips/          # Trip CRUD + pack items
│   │       └── user/           # User preferences (weight unit)
│   ├── components/
│   │   ├── app/                # Nav bar, dashboard, household setup
│   │   ├── closet/             # Closet page, item table, add dialog, catalog typeahead
│   │   ├── providers/          # QueryProvider, WeightUnitProvider
│   │   ├── trips/              # Trip workspace, pack columns, loadout modal, shared pool
│   │   └── ui/                 # shadcn/ui primitives
│   ├── db/
│   │   ├── schema.ts           # Drizzle schema (14 tables, 6 enums, relations)
│   │   └── index.ts            # Dual DB driver (pg local, Neon prod)
│   ├── hooks/                  # TanStack Query hooks (9 files)
│   └── lib/
│       ├── api-helpers.ts      # Auth helper, error handler, ApiError class
│       ├── auth.ts             # Auth.js config
│       ├── carry-warnings.ts   # Body weight % warning thresholds
│       ├── constants.ts        # Default categories, carry limits
│       ├── fetch.ts            # Shared fetchApi helper
│       ├── gear-veterancy.ts   # Trip count → veterancy labels
│       ├── pack-zones.ts       # Pack zone mapping for loadout view
│       ├── utils.ts            # cn() class merging
│       ├── weight.ts           # Weight conversion + display
│       └── __tests__/          # 7 test files, 65 tests
├── public/
│   ├── logo.webp               # App logo
│   └── robots.txt              # Search engine directives
├── .nvmrc                      # Node 20
├── .prettierrc                 # Prettier config
├── .lintstagedrc.json          # lint-staged config
├── docker-compose.yml          # Local PostgreSQL
├── drizzle.config.ts           # Drizzle Kit config
├── vitest.config.ts            # Vitest config
└── CLAUDE.md                   # AI assistant instructions
```

## Database

### Schema (14 tables)

- **households** — Name, invite code
- **users** — Auth.js user + profile (body weight, role, unit pref). Pets are users with `role: "pet"`
- **accounts, sessions, verificationTokens** — Auth.js adapter tables
- **categories** — Per-household gear categories with color and sort order
- **items** — Gear items with weight (stored in grams), owner type (personal/shared), category
- **kits, kit_items** — Reusable gear bundles (schema ready, UI not yet built)
- **trips** — Trip metadata (dates, location, season, terrain, temp range)
- **trip_members** — Who's going on a trip, with carry limits
- **trip_packs** — One pack per person per trip
- **trip_pack_items** — Items in a pack, with owner/carrier distinction, worn/consumable overrides, checklist state
- **catalog_products** — 9,065 gear products for typeahead search (from 4 sources), with popularity ranking and source count tracking

### Key data model concepts

- **Owner vs carrier**: `trip_pack_item.owned_by_user_id` (whose gear) vs `trip_pack.user_id` (who carries it)
- **Pets as users**: A pet is a `user` row with `role: "pet"`, `managed_by_user_id` pointing to an adult, no email
- **Shared gear**: Items with `owner_type: "shared"` belong to the household, assigned to packs during trip planning
- **Weight in grams**: All weights stored as integers (grams). Display layer handles oz/lb/g/kg conversion

### Environments

|           | Local              | Staging                    | Production                 |
| --------- | ------------------ | -------------------------- | -------------------------- |
| App       | localhost:3000     | Vercel preview             | familypack.vercel.app      |
| Database  | Docker PostgreSQL  | Neon branch                | Neon main                  |
| DB driver | `pg`               | `@neondatabase/serverless` | `@neondatabase/serverless` |
| Schema    | `drizzle-kit push` | `drizzle-kit migrate`      | `drizzle-kit migrate`      |

## Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
```

**65 tests** across 7 files covering:

- Weight conversions and display formatting (imperial + metric)
- Gear veterancy level calculation
- Pack zone mapping (category to zone)
- Carry weight warning thresholds (human vs pet)
- Fetch helper error handling
- API error class and handler
- Utility functions

Coverage for `src/lib/`: 81% statements, 87% branches.

## Features Built

### Phase 1-3: Foundation

- Google OAuth authentication
- Household create + join with invite code
- Gear closet with tabs (Mine / Partner / Shared)
- Inline editing on item name and weight
- Catalog typeahead (98 products, fuzzy search via pg_trgm)
- Trip list and creation (who's going + metadata)
- Trip workspace with pack columns and shared gear pool
- Weight display: base weight, total carried, skin-out total, % body weight
- Dark mode

### Phase 4: Core Completion

- **Unit toggle** — Imperial/metric switch in nav bar, persisted to DB
- **Checklist mode** — Toggle on trip workspace, checkboxes per item, progress bars
- **Gear history** — Trip count per item, veterancy labels (Breaking In / Trusted / Veteran / Legendary)
- **Loadout view** — Pack zone modal (Brain, Main Top/Mid/Bottom, Side Pockets, External, Worn)
- **Carry weight warnings** — Color-coded body weight % (Light / Moderate / Heavy / Overloaded) with pet-specific thresholds
- **Body weight input** — Inline editable for human members on dashboard
- **Closet search** — Filter by name, brand, model, category
- **Trip duplication** — Deep copy of trips including members, packs, and pack items
- **Catalog pipeline** — 9,065 products from 4 sources with brand matching, deduplication, and QA reporting
- **Community catalog growth** — Auto-promotes stable items to catalog when packed on trips; popularity ranking on typeahead
- **Test suite** — 65 Vitest tests with 81% coverage on lib/
- **Web app extras** — Metadata + OG tags, 404, error boundary, loading skeletons, toast notifications with delete confirmations, Vercel Analytics
- **DX** — Prettier, Husky + lint-staged, Dependabot, seed scripts, format scripts

## Deployment

The app deploys automatically to Vercel on push to `main`. Preview deployments are created for pull requests.

### Environment variables on Vercel

Set these in Vercel project settings:

- `AUTH_SECRET`
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`
- `DATABASE_URL` (auto-injected by Neon integration)

## CI/CD

GitHub Actions runs on every PR and push to `main`:

1. TypeScript type checking
2. ESLint
3. Vitest test suite

Pre-commit hook (Husky + lint-staged) runs Prettier and ESLint on staged files.

Dependabot is configured for weekly dependency updates.

## Documentation

- **`docs/spec.md`** — Complete product specification (~1,800 lines): product vision, competitive landscape, full feature list (~140 features across 4 tiers), data model, architecture
- **`docs/context.md`** — Session context for AI-assisted development: who the user is, what's built, key decisions, current status
- **`docs/roadmap.md`** — Phased roadmap mapping all spec features to 10 implementation phases

## License

Private project. Not licensed for redistribution.
