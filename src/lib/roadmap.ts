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

export const ROADMAP: RoadmapPhase[] = [
  {
    id: "phase-1-3",
    name: "Phase 1–3 · Foundation + Closet + Trips",
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
    name: "Phase 4 · Core Completion",
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
    name: "Phase 4.5 · Quick Wins & Fixes",
    status: "done",
    summary: "Inline editing, category mgmt, trip edit/delete/complete/search, member mgmt.",
    features: [
      { title: "Full inline item editing (name, brand, model, category, owner, notes)" },
      { title: "Trip search, sort, completion, delete, member management" },
      { title: "Category manager with add/edit/delete + safe reassignment" },
      { title: "Changelog footer with timestamps" },
      { title: "Leave Household flow (gear follows you)" },
    ],
  },
  {
    id: "phase-8-debt",
    name: "Phase 8 · Tech Debt (core)",
    status: "done",
    summary:
      "Zod validation, typed hooks, error boundaries, security headers, schema hygiene, 4-hour db backups.",
    features: [
      { title: "Every POST/PATCH validated with Zod schemas" },
      { title: "Security headers (X-Frame, HSTS, Permissions-Policy, etc.)" },
      { title: "FK cleanup directives (ON DELETE SET NULL) across users/trips/items" },
      { title: "/api/catalog/select now requires auth" },
    ],
  },
  {
    id: "phase-4-6",
    name: "Phase 4.6 · Beta-ready Polish",
    status: "done",
    summary:
      "Confirm dialogs, click-outside editors, changelog drawer, roadmap + suggestions, household settings, unified trip add flow.",
    features: [
      { title: "Confirm-dialog system for all destructive actions" },
      { title: "Click-outside inline editors with dirty-state warning" },
      { title: "Changelog drawer + /app/roadmap page" },
      { title: "Roadmap suggestions (per-phase + general)" },
      { title: "Household settings page (pack-class tiers, carry %, categories, leave household)" },
      { title: "Unified trip add flow with UnassignedSharedBar" },
      { title: "Trip tile per-person Base + Carry weights" },
      { title: "Trip workspace scaling (1 / grid / snap-scroll)" },
    ],
  },
  {
    id: "phase-4-7",
    name: "Phase 4.7 · Quick Wins & Polish",
    status: "next",
    summary:
      "Batchable small fixes from beta feedback — unit split, theme polish, color parity, pet flow revamp.",
    features: [
      {
        title: "Split unit prefs",
        description: "Separate itemsUnit + totalsUnit so totals stay in lb while items flex",
      },
      {
        title: "Theme toggle first-click fix",
        description: "Initialize from localStorage inside useEffect to match SSR class",
      },
      {
        title: "Lighten dark / darken light",
        description: "Step the bg/surface tokens on each side to reduce glare",
      },
      {
        title: "Pack-class color parity",
        description: "Human tiers + pet carry tiers share one green→red scale",
      },
      {
        title: "Hide collapsed category chrome",
        description: "No 'Sort by' or subtotal subline when a trip category is collapsed",
      },
      { title: "Collapse-all button on closet + trip packs" },
      {
        title: "% body weight color scale legend",
        description: "Subtle inline legend/tooltip on %bw badges",
      },
      { title: "End date picker pre-fills end date, not start" },
      {
        title: "Revamp pet creation",
        description: "Proper guided dialog replacing the dashboard inline form",
      },
      {
        title: "Closet sort/reorder polish",
        description: "Stop items jumping out of view, remember per-category sort",
      },
    ],
  },
  {
    id: "phase-5",
    name: "Phase 5 · Trip Stats & Visualization",
    status: "planned",
    summary:
      "Stats panel, shared-weight balance, pack class labels, smart trip tags, category charts.",
    features: [
      {
        title: "Trip stats panel",
        description: "Per-person weight, category bars, shared balance",
      },
      {
        title: "Shared weight balance indicator",
        description: "Who's carrying what share of shared gear",
      },
      {
        title: "Personal vs shared % per pack",
        description: "Inline badge on each pack card — '72% personal, 28% shared'",
      },
      {
        title: "Pack class labels",
        description: "Ultralight / Lightweight / Light / Traditional / Heavy",
      },
      {
        title: "Smart trip tags",
        description: "Auto-derived: Cold Weather, Dog Friendly, Fishing, etc.",
      },
      { title: "Trip metadata expansion", description: "Distance, duration, elevation fields" },
      { title: "Category weight charts (recharts)" },
    ],
  },
  {
    id: "phase-6",
    name: "Phase 6 · Party View & Loadout",
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
    id: "phase-7",
    name: "Phase 7 · Drag-and-Drop + Cut List",
    status: "planned",
    summary: "Cross-column drag, cut list, and a 'not on this trip' view.",
    features: [
      { title: "Drag-and-drop gear between packs (dnd-kit cross-container)" },
      { title: "Cut list — mark items as 'considering cutting' with savings preview" },
      { title: "'Not on This Trip' section showing closet items excluded from the trip" },
    ],
  },
  {
    id: "phase-8b",
    name: "Phase 8b · Mobile, Sharing, Profile",
    status: "planned",
    summary: "Remaining Phase 8 polish items after the core tech debt pass.",
    features: [
      { title: "Mobile responsive trip workspace (tabbed person switcher)" },
      { title: "Public read-only trip/pack share pages (/share/[tripId])" },
      { title: "Dedicated profile page with body stats form" },
    ],
  },
  {
    id: "phase-8-5",
    name: "Phase 8.5 · Location & Weather",
    status: "planned",
    summary: "Geocoded trip locations + forecast and climate data to drive readiness warnings.",
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
    ],
  },
  {
    id: "phase-9",
    name: "Phase 9 · Intelligence & Readiness",
    status: "planned",
    summary: "Ten Essentials checker, balance intelligence, gear history insights.",
    features: [
      { title: "Readiness system — per-person score with fuzzy Ten Essentials match" },
      { title: "Activity tags on items/categories with trip auto-suggest" },
      { title: "Balance intelligence — auto-suggest rebalance" },
      { title: "Actual vs planned weight per pack + per-trip notes" },
    ],
  },
  {
    id: "phase-10",
    name: "Phase 10 · Import/Export & Advanced",
    status: "planned",
    summary: "LighterPack import, CSV/PDF export, reusable kits, trip comparison.",
    features: [
      { title: "LighterPack CSV import" },
      { title: "CSV + print-friendly PDF export" },
      { title: "Reusable kits (Cook Kit, First Aid, etc.)" },
      { title: "Side-by-side trip comparison with diff" },
    ],
  },
  {
    id: "phase-11",
    name: "Phase 11 · Community & Scale",
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
      { title: "Age-aware kid defaults", description: "No kids in household yet" },
    ],
  },
];
