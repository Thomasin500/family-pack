export type PhaseStatus = "done" | "partial" | "next" | "planned";

export interface RoadmapFeature {
  title: string;
  description?: string;
  status?: PhaseStatus; // defaults to parent phase status
}

export interface RoadmapPhase {
  id: string;
  name: string;
  status: PhaseStatus;
  summary: string;
  features: RoadmapFeature[];
}

/**
 * User-visible roadmap. Phases are renumbered so the Done group reads as a
 * continuous sequence (1 → 7) and Planned picks up from there (8+). The `id`
 * of each phase is the stable dev key — do not change it, suggestion rows in
 * the DB reference it. Only the display `name` changes when we reshuffle.
 */
export const ROADMAP: RoadmapPhase[] = [
  // ── Done ────────────────────────────────────────────────────────────────────
  {
    id: "phase-1-3",
    name: "Phase 1 · Foundation + Closet + Trips",
    status: "done",
    summary:
      "Auth, household, gear closet, trip workspace, weight display, pet support, dark mode, catalog, CI/CD, Vercel + Neon deploy.",
    features: [
      { title: "Google OAuth + household model" },
      { title: "Gear closet with tabs, inline editing, catalog typeahead" },
      { title: "Trip workspace with pack columns, shared gear pool, weight summaries" },
      { title: "9,065-product seeded catalog" },
    ],
  },
  {
    id: "phase-4",
    name: "Phase 2 · Core Completion",
    status: "done",
    summary: "Unit toggle, checklist mode, gear history, loadout skeleton, Vitest suite.",
    features: [
      { title: "4-way weight unit toggle (oz / lb / g / kg)" },
      { title: "Checklist mode with per-pack progress" },
      { title: "Veterancy labels (Breaking In → Legendary)" },
      { title: "Loadout view (CSS grid pack zones)" },
    ],
  },
  {
    id: "phase-4-5",
    name: "Phase 3 · Quick Wins & Fixes",
    status: "done",
    summary: "Inline editing, category mgmt, trip edit/delete/complete/search, member mgmt.",
    features: [
      { title: "Full inline item editing (name, brand, model, category, owner, notes)" },
      { title: "Trip search, sort, completion, delete, member management" },
      { title: "Category manager with add/edit/delete + safe reassignment" },
      { title: "Changelog footer with timestamps" },
      { title: "Leave Household flow (personal gear follows you)" },
    ],
  },
  {
    id: "phase-4-6",
    name: "Phase 4 · Beta-ready Polish",
    status: "done",
    summary:
      "Confirm dialogs, click-outside editors, changelog drawer, roadmap + suggestions, household settings, unified trip add flow.",
    features: [
      { title: "Confirm-dialog system for all destructive actions" },
      { title: "Click-outside inline editors with dirty-state warning" },
      { title: "Changelog drawer + /app/roadmap page" },
      { title: "Roadmap suggestions (per-phase + general)" },
      { title: "Household settings page (pack-class tiers, carry %, categories, leave household)" },
      { title: "Unified trip add flow with unassigned-shared bar" },
      { title: "Trip tile per-person Base + Carry weights" },
      { title: "Trip workspace scaling (1 / grid / snap-scroll)" },
    ],
  },
  {
    id: "phase-8-debt",
    name: "Phase 5 · Tech Debt (core)",
    status: "done",
    summary:
      "Zod validation, typed hooks, error boundaries, security headers, schema hygiene, 4-hour db backups.",
    features: [
      { title: "Every POST/PATCH validated with Zod schemas" },
      { title: "Security headers (X-Frame, HSTS, Permissions-Policy, etc.)" },
      { title: "FK cleanup directives (ON DELETE SET NULL) across users/trips/items" },
      { title: "/api/catalog/select now requires auth" },
      { title: "DB backups via GitHub Actions pg_dump (every 4h, 30-day retention)" },
    ],
  },
  {
    id: "phase-4-7",
    name: "Phase 6 · Theme, Pet Revamp, Polish",
    status: "done",
    summary:
      "Tier sliders, auto-save settings, theme persistence, lighter/warmer theme passes, pet creation revamp (shared custody), pack class labels, pack totals at top.",
    features: [
      {
        title: "Theme persistence + no-flash load",
        description: "Cookie-backed SSR renders the right class before first paint",
      },
      {
        title: "Dark theme brighter + sage-biased",
        description: "Two passes today — surfaces lifted ~14 points with a green tilt",
      },
      {
        title: "Light theme warmed up",
        description: "Subtle brown undertone + small darken — no more whiteish glare",
      },
      {
        title: "Tier slider UI + auto-save",
        description: "Multi-thumb slider on household settings, saves 500ms after last change",
      },
      {
        title: "Pet creation revamp",
        description:
          "New PetDialog with Name / Weight / Age / Breed. Any adult can manage pets and children (shared custody). Pets stay with household on leave.",
      },
      {
        title: "Pack class labels on pack headers",
        description:
          "Ultralight / Lightweight / Traditional / Heavy Pack for humans, Trail Runner / Trail Partner / Pack Dog / Overloaded for pets",
      },
      {
        title: "Trip pack totals moved to top",
        description: "Base / Total Carried / Skin-Out / % Body Wt always visible without scroll",
      },
      {
        title: "% body-weight color scale + hover legend",
        description: "Tier popover triggers by hovering the colored percent itself",
      },
      {
        title: "Pack-class ↔ pet-carry color parity",
        description: "Green → yellow → orange → red ramp shared across pack class + carry warnings",
      },
      {
        title: "Collapse-all button (closet + trip packs)",
      },
      {
        title: "End date picker fix",
        description: "Dates normalized; new-trip mirrors start→end; min={startDate}",
      },
      {
        title: "Season removed, terrain → notes",
      },
      {
        title: "Nav 'New Trip' opens modal directly",
      },
      {
        title: "Inline category editor on settings page",
      },
      {
        title: "Changelog date grouping + top-10",
      },
    ],
  },
  {
    id: "phase-7",
    name: "Phase 7 · Gear Pool + Drag-and-Drop",
    status: "done",
    summary:
      "Full drag-and-drop loadout builder. Six milestones M1–M6, cross-household security audit, uniform error toasts across every mutation hook.",
    features: [
      {
        title: "Gear Pool panel with search, filter, sort",
        description: "Replaces the thin unassigned-shared bar; collapsible, click-to-assign",
      },
      {
        title: "Stackable items (`allowMultiple`)",
        description: "Water bottles, fuel, food-per-day stay in the pool with ×N indicator",
      },
      {
        title: "Pool → pack drag-and-drop",
        description: "Single DndContext, bump endpoint, atomic quantity increment",
      },
      {
        title: "Intra-pack reorder + manual sort mode",
      },
      {
        title: "Cross-pack + unpack-to-pool drag",
        description: "Owned-by preserved so 'carrying for' badges appear automatically",
      },
      {
        title: "Drop highlights, / shortcut, deep-link hash scroll, mobile drag handles",
      },
      {
        title: "Cross-household security audit",
        description: "Eight reference holes closed — every write endpoint re-verifies foreign IDs",
      },
      {
        title: "Mutation error toasts everywhere",
        description: "Uniform red toast on failure across items, trips, packs, categories, members",
      },
    ],
  },

  // ── Planned ─────────────────────────────────────────────────────────────────
  {
    id: "phase-5",
    name: "Phase 8 · Trip Stats & Visualization",
    status: "next",
    summary:
      "Where the app stops feeling like a spreadsheet. Stats panel, shared-weight balance, smart trip tags, charts.",
    features: [
      {
        title: "Trip stats panel",
        description: "Collapsible; per-person weight, category bars, shared balance",
      },
      {
        title: "Shared weight balance indicator",
        description: "Who carries what share of shared gear",
      },
      {
        title: "Personal vs shared % per pack",
        description: "Inline badge — '72% personal, 28% shared'",
      },
      {
        title: "Smart trip tags",
        description: "Auto-derived: Cold Weather, Dog Friendly, Fishing, etc.",
      },
      {
        title: "Trip metadata expansion",
        description: "Planned distance, duration, elevation gain, high point",
      },
      { title: "Body-wt % on trip tile", description: "Under Carried as a child row, same ramp" },
      {
        title: "Category weight charts (bar + pie)",
        description: "Horizontal bars default; pie/donut toggle for LighterPack converts",
      },
      {
        title: "Base / Consumable / Carried breakdown chart",
        description: "Stacked bar per person showing base vs consumables vs worn-on-body split",
      },
      {
        title: "Base weight over time",
        description:
          "Multi-trip trend chart on the profile. Filters: date range, season, solo vs group, trip tag",
      },
      {
        title: "Distance + elevation trend charts",
        description: "Once trip metadata is captured, show trend graphs on the profile",
      },
    ],
  },
  {
    id: "phase-5-5",
    name: "Phase 8.5 · Dashboard Refresh",
    status: "planned",
    summary: "Answer 'what's next?' at a glance when you land on /app.",
    features: [
      { title: "Upcoming trip tile", description: "Next trip by startDate with countdown" },
      {
        title: "Most recent pack",
        description: "Snapshot with weight + pack class, quick-link into the workspace",
      },
      {
        title: "Quick stats row",
        description: "Active trip count, closet weight, lightest base weight",
      },
    ],
  },
  {
    id: "phase-6",
    name: "Phase 9 · Party View & Loadout",
    status: "planned",
    summary: "RPG-style silhouette cards per member, camp area for shared gear, dog variant.",
    features: [
      { title: "Silhouette cards per member with zones (head, torso, pack, legs, feet)" },
      { title: "Camp area for household gear (tent, stove, etc.)" },
      { title: "Group loadout view — all members + shared, side-by-side" },
      { title: "Dog saddle-pack variant" },
    ],
  },
  {
    id: "phase-8b",
    name: "Phase 10 · Mobile, Sharing, Profile",
    status: "planned",
    summary: "Remaining polish items after the core tech debt pass.",
    features: [
      { title: "Mobile responsive trip workspace (tabbed person switcher)" },
      { title: "Public read-only trip/pack share pages (/share/[tripId])" },
      { title: "Dedicated profile page with body stats form" },
    ],
  },
  {
    id: "phase-8-5",
    name: "Phase 10.5 · Location, Weather, Alerts",
    status: "planned",
    summary:
      "Tie trips to real places to layer in external data — forecasts, climate, and land-manager alerts.",
    features: [
      {
        title: "Geocoded trip location",
        description: "Typeahead with lat/lng/placeId, freeform fallback",
      },
      {
        title: "Weather forecast panel",
        description: "Open-Meteo / NOAA daily forecast for trips within 0–14 days",
      },
      {
        title: "Seasonal climate hint",
        description: "30-year normals for trips beyond the forecast window",
      },
      {
        title: "Weather-driven readiness",
        description: "Flag missing rain/insulation based on forecast vs gear",
      },
      {
        title: "Trip alerts & advisories",
        description:
          "Fire restrictions (USFS / InciWeb), NPS park alerts, flood warnings, trail closures, water availability",
      },
    ],
  },
  {
    id: "phase-9",
    name: "Phase 11 · Intelligence & Readiness",
    status: "planned",
    summary:
      "Ten Essentials checker, balance intelligence, trip reports, gear history insights, class ratings.",
    features: [
      { title: "Readiness system — per-person score with fuzzy Ten Essentials match" },
      { title: "Activity tags on items/categories with trip auto-suggest" },
      { title: "Balance intelligence — auto-suggest rebalance" },
      {
        title: "Post-trip report",
        description:
          "5-star rating for how the pack performed, free-text 'what worked / what I'd change', MVP item, LVP item, actual distance / vert / duration. Compared against the planned fields from Phase 8.",
      },
      { title: "Actual vs planned weight per pack" },
      {
        title: "Gear class ratings on items",
        description: "Tents: Ultralight / Lightweight / Standard / Heavy; pads + bags similar",
      },
      {
        title: "Product links on catalog",
        description: "Manufacturer + REI / Backcountry / Amazon / Garage Grown Gear",
      },
    ],
  },
  {
    id: "phase-10",
    name: "Phase 12 · Import/Export & Advanced",
    status: "planned",
    summary:
      "LighterPack import, CSV/PDF export, reusable kits, trip comparison, cut list, details modal, pack copy.",
    features: [
      { title: "LighterPack CSV import" },
      { title: "CSV + print-friendly PDF export" },
      { title: "Reusable kits (Cook Kit, First Aid, etc.)" },
      { title: "Side-by-side trip comparison with diff" },
      { title: "Household stats (trip count, lightest trip, gear investment)" },
      {
        title: "Copy pack to another trip",
        description: "Atomic server-side copy; target pack merges or replaces, user prompted",
      },
      {
        title: "Cut list",
        description: "Mark items as 'considering cutting'; running savings tally",
      },
      {
        title: "Item details modal",
        description:
          "Secondary affordance on Gear Pool chips — full item details with trip history",
      },
    ],
  },
  {
    id: "phase-10-5",
    name: "Phase 12.5 · Kid Accounts",
    status: "planned",
    summary:
      "Evolve the latent child role into a first-class account type — login, restricted permissions, and eventually a kids-mode UI.",
    features: [
      { title: "Child dialog (parity w/ PetDialog)", description: "Name, weight, birth date, sex" },
      {
        title: "Child login",
        description: "Username + parent-set PIN, or magic-link via parent email",
      },
      {
        title: "Restricted permissions",
        description:
          "Can view closet, edit own gear, check off items. Cannot delete trips or touch household settings.",
      },
      {
        title: "Age-aware defaults",
        description: "Default carry %, loadout routing, UI simplifications by age bucket",
      },
      {
        title: "Kids mode (far future)",
        description: "Opt-in simplified UI skin — bigger targets, RPG-flavored copy",
      },
    ],
  },
  {
    id: "phase-11",
    name: "Phase 13 · Community & Scale",
    status: "planned",
    summary: "Public gallery, forking, offline PWA, calorie planning, image uploads.",
    features: [
      { title: "Public trip gallery, browse by trail / conditions / base weight" },
      { title: "Fork / remix public lists into your closet" },
      { title: "Offline-capable PWA with checklist sync" },
      { title: "Calorie calculator (Pandolf equation) + water planning" },
      {
        title: "Food in the closet",
        description: "Resolve design Q — closet, trip-only, or separate pantry",
      },
      {
        title: "Water weight tracking",
        description: "Trip-specific water volume rolls into carried weight",
      },
      {
        title: "Food weight guessamator",
        description: "Duration × calories/day × packaging → estimated food weight",
      },
      { title: "Image uploads via Vercel Blob" },
    ],
  },
  {
    id: "phase-12",
    name: "Phase 14 · AI Copilot",
    status: "planned",
    summary:
      "Natural-language interface over your own household, trips, and closet — strongest fit once the readiness system is in.",
    features: [
      {
        title: "Chat drawer on every /app page",
        description: "Streaming via Vercel AI SDK v6 + AI Gateway",
      },
      {
        title: "Household context tools",
        description: "Scoped tools: get_trip, list_packs, get_closet, get_readiness, search_items",
      },
      {
        title: "Conversation history",
        description: "Persistent ai_thread + ai_message tables; resume past threads",
      },
      {
        title: "Trip-scoped shortcut prompts",
        description: "Buttons: 'Why is my readiness 72%?', 'Rebalance my pack', etc.",
      },
      {
        title: "Chat-to-action with confirmation",
        description: "Model can propose mutations; every action confirms before writing",
      },
      {
        title: "Citations back to source data",
        description: "Click to scroll to the relevant row",
      },
      {
        title: "Prompt caching + history compaction",
        description: "Keep long threads within the context window",
      },
    ],
  },
  {
    id: "deprioritized",
    name: "Parked · Deprioritized",
    status: "planned",
    summary: "Still in the spec, revisit when the need is real.",
    features: [
      {
        title: "What-if mode",
        description: "Cut list covers 80% of the use case for less complexity",
      },
      { title: "Trip templates", description: "Trip duplication already covers most of this" },
      { title: "Solo trip mode", description: "Household always hikes together currently" },
      { title: "Keyboard nav + undo/redo", description: "Power user nice-to-have" },
    ],
  },
];
