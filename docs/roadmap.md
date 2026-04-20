# Family Pack — Roadmap

> Condensed roadmap covering all spec features, organized into build phases.
> Cross-reference with `docs/spec.md` for full feature details and `docs/context.md` for project context.

**Last updated:** April 19, 2026

---

## Phase 1-3: Foundation + Closet + Trips — DONE

Auth, household, gear closet, trip workspace, weight display, pet support, dark mode, catalog, CI/CD, Vercel + Neon deploy. **~25 features built.**

---

## Phase 4: Core Completion — DONE

_Built April 14, 2026._

| Feature           | What                                                                                           | Status   |
| ----------------- | ---------------------------------------------------------------------------------------------- | -------- |
| Unit toggle       | Imperial/metric switch in nav, `WeightUnitProvider` context, `GET/PATCH /api/user/preferences` | **Done** |
| Checklist mode    | `isChecked` on trip_pack_items, toggle on workspace, checkboxes, progress bars                 | **Done** |
| Gear history      | `GET /api/items/history` (trip count query), veterancy labels in closet                        | **Done** |
| Loadout view MVP  | CSS grid pack zones, category-to-zone mapping, per-person modal from pack column               | **Done** |
| Vitest test suite | 38 tests: weight conversions, veterancy levels, zone mapping                                   | **Done** |

---

## Phase 4.5: Quick Wins & Fixes — DONE

_Built April 15, 2026. Bug fixes, UX improvements, and missing CRUD operations._

| Feature                              | What                                                                                                       | Status   |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------- | -------- |
| User name on closet tab              | Replaced hardcoded "Mine" with the actual user's name                                                      | **Done** |
| Editable item badges                 | Clickable worn/consumable/carried badges, cycle on click                                                   | **Done** |
| Trip edit dialog                     | Edit trip name, dates, location, season, terrain after creation via pencil icon                            | **Done** |
| Member/pet edit API                  | `PATCH/DELETE /api/household/members/[id]` with auth checks                                                | **Done** |
| Pet edit UI                          | Inline edit form on dashboard for pet name, weight, breed + remove                                         | **Done** |
| Category delete safety               | API returns 409 with item count; supports `?force=true&moveTo=<id>` to reassign items                      | **Done** |
| 4-way weight unit toggle             | Cycle oz → lb → g → kg, stored in localStorage, all displays + inputs respect unit                         | **Done** |
| Collapsible pack columns             | Click header to collapse/expand, shows weight + item count when collapsed                                  | **Done** |
| Trip delete button                   | Delete button on trip cards with confirmation toast                                                        | **Done** |
| Clear season option                  | "None" option in season select to unset season                                                             | **Done** |
| Pet weight clickable                 | Click pet weight display to edit inline (same as adult body weight)                                        | **Done** |
| Checklist persists via URL           | `?checklist=true` query param survives refresh and sharing                                                 | **Done** |
| Add-to-pack per column               | "+" button on each pack column header opens AddToPackDialog scoped to that pack                            | **Done** |
| Item delete warns if in trip         | API returns 409 with trip count; UI offers "Delete Anyway" force option                                    | **Done** |
| Empty pack "Add Gear" button         | Empty pack columns show actionable "Add Gear" button instead of just placeholder text                      | **Done** |
| Trip search + sort                   | Search by name/location, sort by newest/oldest/name/members on trip list page                              | **Done** |
| Trip completion                      | `completedAt` timestamp on trips schema, Complete/Reopen buttons, banner, "Done" badge on trip list        | **Done** |
| Full inline item editing             | Click item to edit name, brand, model, category (dropdown), notes — all inline with Save/Cancel            | **Done** |
| Category management UI               | Dialog with add/edit/delete, color picker, item counts, safe delete with move-items flow                   | **Done** |
| Trip member management               | `POST/DELETE /api/trips/[id]/members`, auto-creates/deletes packs, add/remove UI in workspace              | **Done** |
| Collapsible + reorderable categories | dnd-kit sortable on category groups with drag handle, collapse toggle, sort order persisted via PATCH      | **Done** |
| Structured API errors                | `ApiResponseError` class preserves full error body (status, tripCount, itemCount, etc.)                    | **Done** |
| Dead code cleanup                    | Removed unused `useUserPreferences`/`useUpdateWeightUnit` hooks, unused imports                            | **Done** |
| "- LOCAL" browser tab                | Tab title appends "- LOCAL" in development mode                                                            | **Done** |
| Tests expanded                       | 65 → 82 tests. Added 17 tests for weight unit system (all 4 display modes, input/output conversions, etc.) | **Done** |

---

## Phase 4.6: Beta-ready Polish — DONE

_Built April 16, 2026. A long iteration pass driven by beta-testing feedback._

| Feature                                  | What                                                                                                                                                                                                                                                                                            | Status   |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Confirm-dialog system                    | All destructive prompts (delete item, delete category, delete trip, remove pack item, remove trip member, delete member, leave household) now use a centered shadcn Dialog with backdrop + Cancel/Confirm                                                                                       | **Done** |
| Click-outside editor dismissal           | `useClickOutside` hook — every inline editor closes when clean; shows a red-ring "Save or Cancel" warning when dirty. Applied across closet, dashboard, category manager, shared-assign chip                                                                                                    | **Done** |
| Changelog drawer                         | `src/lib/changelog.ts` typed entries rendered via a bottom drawer on every `/app/*` page. Drawer header is fully clickable to toggle; Roadmap pill pinned to the far right                                                                                                                      | **Done** |
| Roadmap page                             | `/app/roadmap` renders `src/lib/roadmap.ts`. Completed phases collapsed in a group, active phases expanded. Status badges + colored bullets                                                                                                                                                     | **Done** |
| Roadmap suggestions                      | New `roadmap_suggestion` table, POST/GET/PATCH/DELETE API. Per-phase + general "Suggest" buttons. Inline edit (title / description / phase). Author-only content edits, household-wide delete + status                                                                                          | **Done** |
| `npm run suggestions` dev CLI            | Single script with an interactive triage flow: lists every open suggestion across households (with author/household/timestamp, grouped by phase), then prompts to mark them all as noted. Flags: `--list`, `--note <id>`, `--reopen <id>`, `--yes`. Points at local or Neon via `DATABASE_URL`. | **Done** |
| Unified trip add flow                    | Shared gear now appears in the per-pack Add Items dialog. Large shared-gear panel replaced by a thin `UnassignedSharedBar` that only shows when there's unassigned shared gear                                                                                                                  | **Done** |
| Trip tile per-person weights             | Each tile shows a name column plus Base + Carry columns per pack member, with pack-class color on base. Reads from household settings                                                                                                                                                           | **Done** |
| Trip category collapse + subheader       | Each category in a pack column has a chevron, bigger/bolder header in category color, item count + subtotal + sort menu on a subline                                                                                                                                                            | **Done** |
| Item weights pushed right + delete after | Weights right-aligned; delete ✕ appears on hover to the right of the weight. Item names no longer truncate (wrap + `title` tooltip)                                                                                                                                                             | **Done** |
| Trip workspace scaling                   | 1 pack centered, 2–3 in a grid, 4+ → horizontal snap-scroll with 320px min-width cards and a "← scroll to see all N packs →" hint                                                                                                                                                               | **Done** |
| Household settings page                  | `/app/settings/household` — configurable pack-class tiers, 4-tier human carry %, 4-tier pet carry %, category manager, Leave-Household Danger Zone. Gear icon in nav goes here                                                                                                                  | **Done** |
| Leave household (gear follows)           | `POST /api/household/leave` nulls `householdId` on self + managed pets/children without killing session. Personal items auto-import into the next household via member-scoped query                                                                                                             | **Done** |
| Change item owner                        | Closet inline editor has an Owner dropdown (every household member + Shared). Item hops tabs on save                                                                                                                                                                                            | **Done** |
| Sort menus (closet + trip)               | Shared `CategorySortMenu` with Type / Name A-Z / Name Z-A / Weight ↑ / Weight ↓. Type sort groups worn → carried → consumable. Sort trigger label: "Sort by: <icon>"                                                                                                                            | **Done** |
| Security + schema hygiene                | `/api/catalog/select` now authed. `/api/health` doesn't leak user count. Security headers in `next.config.ts`. All FKs have explicit `ON DELETE SET NULL`. `items.ownerId` polymorphic pattern documented                                                                                       | **Done** |
| Session-invalidation helper              | `invalidateUserSessions(userId)` used when a managed member is deleted; ready for future admin-driven adult removal                                                                                                                                                                             | **Done** |
| Cursor-pointer on all buttons            | Every shadcn Button variant gets `cursor-pointer` — no more ambiguous pointer on hover                                                                                                                                                                                                          | **Done** |

---

## Phase 4.7: Quick Wins & Polish — DONE

_Small, batchable fixes driven by beta-testing feedback. Most shipped in a single April-16 pass; theme tuning, pet revamp, and the top-vs-bottom totals decision landed April 17._

| Feature                               | What                                                                                                                                                                                                                                                               | Effort | Status   |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ | -------- |
| Theme persistence + no-flash          | `layout.tsx` reads `cookies().get("theme")` and renders `<html class="dark" style="color-scheme: dark">` (or light) in SSR. Toggle writes both cookie + localStorage; inline `<script>` migrates legacy localStorage-only sessions. No flash, single-click toggle. | XS     | **Done** |
| Pack-class ↔ pet-carry color parity   | `packClassColor` returns the same green → yellow → orange → red scale as `getCarryWarning`. Settings page tier labels use matching colors.                                                                                                                         | XS     | **Done** |
| Tier slider UI                        | New `TierSlider` (`src/components/app/tier-slider.tsx`) — multi-thumb horizontal slider with colored regions + keyboard support. Settings page Pack class / Human carry / Pet carry each render one slider; default values sit perfectly quartered on the track.   | M      | **Done** |
| Settings auto-save + per-section pill | Each section saves on change (500ms debounce). `SectionSavePill` renders next to the header you just edited (Saving… / Saved / error), auto-dismissing 2.5s after save. Reset-to-defaults also triggers the autosave.                                              | S      | **Done** |
| Pack class rename                     | Briefly introduced a 5th "Hyperlight" tier (sky accent) and then reverted — four tiers with defaults 10 / 20 / 30 lb. `resolveSettings` migrates both legacy v1 (`light` key) and v2 (`hyperlight` key) shapes transparently.                                      | XS     | **Done** |
| Hide collapsed category chrome        | Trip pack categories keep showing item count + subtotal when collapsed; only the `CategorySortMenu` hides until re-expanded.                                                                                                                                       | XS     | **Done** |
| Collapse-all button                   | Header control on the gear closet (top-right "Collapse all"/"Expand all") and an icon button in each trip pack column header that toggles every category at once.                                                                                                  | XS     | **Done** |
| % body-weight color scale             | `CarryScaleLegend` — 4-segment gradient next to the `% Body Wt` label; hover reveals a popover with tier thresholds from household settings.                                                                                                                       | XS     | **Done** |
| End date picker fix                   | Dates normalized to `YYYY-MM-DD` so the picker pre-fills. New-trip dialog mirrors start → end when end is empty; both dialogs set `min={startDate}` so end can't precede start.                                                                                    | XS     | **Done** |
| Season removed, terrain → notes       | Season field removed from the new/edit trip forms (DB column + validator kept for back-compat). Terrain relabeled Notes, rendered as a 3-row textarea.                                                                                                             | XS     | **Done** |
| Nav "New Trip" opens modal            | Nav button now links to `/app/trips?new=true`; trips page reads the param to auto-open the dialog and strips the param on close.                                                                                                                                   | XS     | **Done** |
| Inline category editor                | `CategoryEditor` extracted from `CategoryManager` so the household settings page edits categories inline instead of opening a popup. Closet still uses the Dialog wrapper.                                                                                         | XS     | **Done** |
| Changelog grouping                    | Drawer groups entries by date (no time) and caps the visible list at 10 items with a "Show N older changes" toggle.                                                                                                                                                | XS     | **Done** |
| Lighten dark / darken light           | Two passes on dark (brighter + sage-bias), one on light (subtle warm-brown undertone, slight darken). Both now pleasant across the session; theme Qs (light default, etc.) live in `docs/bugs.md`.                                                                 | S      | **Done** |
| Revamp pet creation                   | New `PetDialog` replaces the inline dashboard form (name, weight, age, breed). Age stored as birthDate so it drifts forward each year. Permission fan-out: any adult in the household can now manage pets and children (shared custody).                           | S      | **Done** |
| Trip pack totals position             | Settled on top of the pack card. Always-visible base/carry/skin-out/body-wt % without scrolling. Hover legend collapsed onto the percent itself. Body-wt-on-trip-tile tracked as a Phase 5 follow-up.                                                              | S      | **Done** |

---

## Phase 5: Trip Stats & Visualization — NEXT

_Make the trip workspace visually rich and data-driven. Pulled forward from Phases 6, 7, 9. This is where the app stops feeling like a spreadsheet. Pack-class labels landed ahead of time in Phase 4.6 via the household settings page and the trip tile color scale._

| Feature                         | What                                                                                                                                                                                                                                                                                                                                          | Effort | Status      |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ----------- |
| Trip insights **(NEW)**         | 3–5 actionable one-liners computed from pack contents: heaviest single item, who carries the most shared gear, distance-to-next-pack-class, over/under carry limits, missing-but-common items. **No competitor does this** — they show charts, not insights. Cheap to build, hard to copy, directly actionable. Lives inside the stats panel. | S-M    | Not started |
| Trip stats panel                | Collapsible bottom drawer on workspace (matches changelog-drawer pattern). Holds insights, per-person weight breakdown, category bar charts (recharts), pack class labels, shared gear balance, total household weight. Toggle via button in header.                                                                                          | M      | Not started |
| Shared weight balance           | Stacked bar showing shared vs personal vs activity gear per person. Smart summary: "Thomas carries 68% of shared gear." Delta indicator. Separates fairness from personal choice.                                                                                                                                                             | S-M    | Not started |
| Personal vs shared % (per pack) | Each pack card shows a small inline chip: "72% personal, 28% shared". Visible at-a-glance without opening the stats panel. Beats 4 of 5 competitors with zero extra UI real estate.                                                                                                                                                           | S      | Not started |
| Pack class labels (UI)          | Visible labels (Ultralight / Lightweight / Traditional / Heavy) on pack column headers for humans; Trail Runner / Trail Partner / Pack Dog / Overloaded for pets. Thresholds configurable per-household via `/app/settings/household`.                                                                                                        | S      | **Done**    |
| Smart trip tags                 | Auto-derived from pack contents: Warm Rated, Cold Weather, Fishing, Multi-Day, Ultralight, Lightweight, Bear Safe, Dog Friendly, Minimalist, Well-Equipped. Shown on trip cards + workspace header.                                                                                                                                           | S      | Not started |
| Trip metadata expansion         | Show/edit terrain, temp range, description in workspace. New schema fields: `distanceMiles`, `durationDays`, `elevationGainFt`, `elevationHighFt`. Display in header + stats panel + edit dialog.                                                                                                                                             | S-M    | Not started |
| Category weight charts          | Horizontal bar chart per category using recharts, per-person or stacked comparison view. Displayed in stats panel.                                                                                                                                                                                                                            | S      | Not started |
| Body weight % on trip tile      | Show `% body weight` as a child row under Carried weight on each per-person column of the trip tile (reusing the colored 4-tier scale from the pack card).                                                                                                                                                                                    | XS     | Not started |
| 💡 Pie/donut chart toggle       | Pie/donut variant of the category chart for LighterPack converts. **From a user suggestion (Bear Family).**                                                                                                                                                                                                                                   | S      | Not started |
| 💡 Base / Consumable / Carried  | Stacked bar per person showing base vs consumables vs worn-on-body split. **From a user suggestion (Bear Family).**                                                                                                                                                                                                                           | S      | Not started |
| 💡 Base weight over time        | Multi-trip trend chart on the profile with date range / season / solo-vs-group / tag filters. **From a user suggestion (Bear Family).**                                                                                                                                                                                                       | M      | Not started |
| 💡 Distance + elevation trends  | Once the Phase 8 metadata fields are captured, render trend graphs on the profile. **From a user suggestion (Bear Family).**                                                                                                                                                                                                                  | S      | Not started |

### Pack Class Labels

| Base Weight | Human Class | Dog Carry % | Dog Class     |
| ----------- | ----------- | ----------- | ------------- |
| Under 10 lb | Ultralight  | < 10%       | Trail Runner  |
| 10-15 lb    | Lightweight | 10-15%      | Trail Partner |
| 15-20 lb    | Light       | 15-20%      | Pack Dog      |
| 20-30 lb    | Traditional | > 20%       | Overloaded    |
| Over 30 lb  | Heavy       |             |               |

### Smart Trip Tags (auto-derived)

Warm Rated, Cold Weather, Fishing, Multi-Day, Ultralight, Lightweight, Bear Safe, Dog Friendly, Minimalist, Well-Equipped

---

## Phase 5.5: Dashboard Refresh

_The dashboard is currently mostly empty outside of the Household/Invite panel. Long-term it should answer "what's next?" at a glance. See bugs.md design Q for the broader "what should the dashboard show" conversation._

| Feature                      | What                                                                                                                                                                                                            | Effort | Status      |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ----------- |
| Upcoming trip tile           | Card showing the next upcoming trip (by startDate) with name, dates, countdown, quick-link to the workspace. Empty state links to "Plan a trip."                                                                | S      | Not started |
| Upcoming vs historical split | Trip list page divides into Upcoming (future or active) and Historical (completed or past). Each section independently searchable / sortable. See bugs.md design Q.                                             | S      | Not started |
| Most recent pack             | Snapshot of the most recently touched pack — trip name, owner, total weight, pack class. Quick-link into that pack on its trip workspace.                                                                       | S      | Not started |
| Quick stats row              | Household at-a-glance: active trip count, total closet weight, lightest base weight across trips, items packed this year. Compact row, no graphs.                                                               | S      | Not started |
| Editable household name      | Name is currently set once at create time. Make it editable on `/app/settings/household`, render it as the dashboard header ("Welcome back to <Household Name>"), and echo it in the trip workspace breadcrumb. | XS     | Not started |
| Trip tile report preview     | When a trip is completed and has a post-trip report (Phase 9), the trip tile shows a compact preview: star rating summary + MVP item + a one-liner from "what worked."                                          | S      | Not started |
| Dashboard Q (design)         | Open design question: what _else_ belongs on the dashboard long-term? Readiness summary, carry balance warnings, gear history highlights? See `docs/bugs.md`.                                                   | —      | —           |

---

## Phase 6: Party View & Loadout

_The RPG-flavored loadout visualization. Pulled forward from Phase 9. The feature that makes people go "whoa."_

| Feature             | What                                                                                                                                                                                                           | Effort | Status      |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ----------- |
| Party view panel    | Collapsible panel in trip workspace. All members as silhouette cards with item slots per zone (head, torso, pack-brain, pack-main, pack-external, legs, feet). Dog variant with saddle pack. CSS grid Phase A. | M-L    | Not started |
| Camp area           | Shared items displayed as campsite cluster: tent, stove, cook kit, water filter, bear canister. Grouped by category. Shown alongside the member silhouettes.                                                   | S      | Not started |
| Worn gear section   | "Worn" zone above pack on silhouette — equipped items visible on the body (jacket, hat, boots, etc.)                                                                                                           | S      | Not started |
| Group loadout view  | All members side by side in zone layout (upgrade from current single-person loadout modal to full party view)                                                                                                  | M      | Not started |
| Dog loadout variant | Saddle pack diagram for pets — simpler zones: pack left/right, body gear, carried-by-human overflow                                                                                                            | S-M    | Not started |

### Human Silhouette Zones

| Zone            | Items                          | Visual Position |
| --------------- | ------------------------------ | --------------- |
| Head            | Headlamp, hat, sunglasses      | Top             |
| Torso           | Jacket, base layer, rain shell | Upper body      |
| Pack (Brain)    | Tools, first aid, snacks       | Pack top        |
| Pack (Main)     | Sleep system, clothing, food   | Pack middle     |
| Pack (External) | Shelter, poles, crocs, chair   | Pack outside    |
| Legs            | Pants, rain pants, gaiters     | Lower body      |
| Feet            | Boots/shoes, socks, camp shoes | Bottom          |

### Dog Silhouette Zones

| Zone             | Items                            |
| ---------------- | -------------------------------- |
| Pack (saddle)    | Food, bowl, first aid            |
| Body             | Sweater, socks, harness, booties |
| Carried by human | Overflow items exceeding carry % |

### Camp Area

Shared household gear not on any person's body — tent, stove, cook kit, water filter, bear canister, etc. Displayed as a campsite cluster alongside the party.

### Design Approach

**Phase A (CSS grid):** Zone sections as styled cards, items placed by category-to-zone mapping (already exists in `pack-zones.ts`). No SVG needed. Ships the UX and data model.

**Phase B (SVG, later):** Illustrated silhouette outlines for person + dog. Item labels positioned at body locations. Requires design assets.

---

## Phase 7: Gear Pool + Drag-and-Drop — DONE

_Upgrading the trip workspace into a drag-and-drop loadout builder. Shipped as 6 milestones M1-M6 on April 16-17, plus a cross-household security audit and uniform error toasts across every mutation hook._

| Feature                   | What                                                                                                                                                                                                                                                                             | Effort | Status            |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ----------------- |
| M1 · Gear Pool shell      | Replaces the thin unassigned-shared bar with a full panel: search, owner/category filter, worn/consumable pills, sort menu, grouped-by-category chip layout. Click-to-assign preserved. Collapsed/expanded states. Shared-unassigned items pinned to top of each category group. | M      | **Done**          |
| M2 · `allowMultiple` flag | New boolean column on items (stackable items stay in the pool after being added to a pack). Closet exposes a Layers toggle. Pool filter + chip indicator updated.                                                                                                                | S      | **Done**          |
| M3 · Pool → pack drag     | One DndContext in the trip workspace. Pool chips draggable, pack columns droppable. New `/items/bump` upsert endpoint (create or increment quantity).                                                                                                                            | S-M    | **Done**          |
| M4 · Intra-pack reorder   | Items sortable within a category via drag handle. PATCH sortOrder. Manual sort mode added to sort menu.                                                                                                                                                                          | XS     | **Done**          |
| M5 · Cross-pack + unpack  | New `/move-item` endpoint (atomic transfer, preserves `ownedByUserId` so "carrying for" badge appears automatically). Pool is also a drop target — drop pack item onto pool to unassign.                                                                                         | M      | **Done**          |
| M6 · Drag polish          | Drop-zone highlights, auto-expand pool on drag start, mobile drag handles, `/` shortcut, show-already-packed toggle, error toasts on failed mutations, security-harden item-ownership on all pack-item endpoints, aria-pressed on filter pills, disable drag in checklist mode.  | XS     | **Done**          |
| "Not on This Trip"        | Subsumed by the Gear Pool's "show already packed" toggle (M6).                                                                                                                                                                                                                   | —      | **Done**          |
| Closet item drag-and-drop | Reorder items within categories, drag items between categories.                                                                                                                                                                                                                  | S      | dnd-kit installed |
| Item details modal        | Clicking a Gear Pool chip (or a pack row) opens a read-only item-details modal — name, brand/model, notes, weight in all units, category, owner, trip history, product link (Phase 9). Click still assigns via primary action; details is a secondary affordance (icon or hold). | S      | Moved to Phase 10 |

---

## Phase 8: Tech Debt + Polish — PARTIAL

_Pay down debt before scaling further. Core tech debt completed April 15, 2026._

| Feature             | What                                                                                                          | Effort | Status      |
| ------------------- | ------------------------------------------------------------------------------------------------------------- | ------ | ----------- |
| Zod validation      | 14 Zod schemas in `src/lib/validators.ts`, every POST/PATCH route validated. ZodError handling in api-helpers | M      | **Done**    |
| Type the hooks      | All 8 hooks return proper types from `src/types/index.ts`. Lint warnings 83 → 69.                             | M      | **Done**    |
| Error boundaries    | ErrorBoundary component wrapping pack columns + closet item table with retry button                           | S      | **Done**    |
| Custom favicon/logo | Backpack logo as favicon (16/32/48px), apple-touch-icon, PWA icons (192/512px), logo in nav bar               | S      | **Done**    |
| DB backups          | GitHub Actions pg_dump every 4 hours, 30-day retention, manual trigger via workflow_dispatch                  | S      | **Done**    |
| Mobile responsive   | Tabbed person-switcher on trip workspace, touch-friendly checklist, responsive closet grid, swipe gestures    | M-L    | Not started |
| Sharing pages       | Public read-only trip/pack links (`/share/[tripId]`), purpose-built clean display page                        | M      | Not started |
| User profile UI     | Dedicated profile page with body stats form, pet profile editing (currently scattered across dashboard)       | S      | Not started |

---

## Phase 8.5: Location & Weather

_Tie trips to real places so we can layer in external data (starting with weather)._

| Feature                  | What                                                                                                                                                                                                                                                            | Effort | Status      |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ----------- |
| Geocoded trip location   | Replace freeform location text with a typeahead backed by a geocoding API (Nominatim / Mapbox / Google). Store `lat`, `lng`, `placeId`, `displayName`. Keep freeform as fallback.                                                                               | M      | Not started |
| Weather forecast panel   | For trips within forecast window (0-14 days), show daily forecast (high/low/precip/wind) for the trip location on the workspace header and share page. Use NOAA / Open-Meteo (free, no key needed).                                                             | M      | Not started |
| Seasonal climate hint    | For trips beyond forecast window, show 30-year climate normals (typical high/low/precip for that place and month). Drives readiness warnings (e.g., "below freezing expected — no insulation layer").                                                           | S-M    | Not started |
| Weather-driven readiness | Feed forecast into the readiness system — missing rain gear when precip forecast, missing insulation below threshold temps, etc.                                                                                                                                | S      | Not started |
| Trip alerts & advisories | Pull land-manager alerts for the trip location: fire restrictions (USFS / InciWeb), NPS park alerts, flood warnings (NWS), trail closures, water availability (CalTopo / community). Surface in the trip header above the forecast, with links out for details. | M-L    | Not started |

---

## Phase 9: Intelligence & Readiness

_The features that make the app feel smart._

| Feature                  | What                                                                                                                                                                                                                                                                                                                                                          | Effort | Status      |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ----------- |
| Readiness system         | Ten Essentials fuzzy matching on item names/categories, per-person score (0-100%), dismissable warnings, dog-specific checks                                                                                                                                                                                                                                  | M-L    | Not started |
| Activity tags            | Tag picker UI on items/categories, closet filter, trip activity selection auto-suggests relevant categories                                                                                                                                                                                                                                                   | S      | Not started |
| Balance intelligence     | Capacity % view, highlight most overloaded member, one-click auto-suggest rebalance ("move tent to Partner to equalize")                                                                                                                                                                                                                                      | M      | Not started |
| Gear history insights    | Core vs occasional gear identification, actual vs planned weight, per-trip notes ("bring longer stakes next time")                                                                                                                                                                                                                                            | S-M    | Not started |
| 💡 Post-trip report      | Multi-axis star ratings _per person_: Pack Weight, Food (right amount, right type), Weather, plus an overall. Free-text "what worked / what I'd change", MVP item, LVP item, actual distance / vert / duration. Compared against planned fields from Phase 8. Report preview surfaces on the trip tile (Phase 5.5). **From a user suggestion (Bear Family).** | M      | Not started |
| Gear class ratings       | Category-specific weight classes on items (e.g. tents: Ultralight < 2 lb / Lightweight 2-3 lb / Standard 3-5 lb / Heavy > 5 lb; sleeping pads, bags, backpacks get their own scales). Rated inline on the item row ("Your tent is Standard-class"). Data seeded from community consensus on catalog items.                                                    | M      | Not started |
| Product links on catalog | Smart brand/model match links out to the manufacturer's product page plus REI / Backcountry / Amazon / Garage Grown Gear search. One-click "shop" from any item; shows review count + spec snippet when available. No affiliate relationship for MVP.                                                                                                         | M      | Not started |

---

## Phase 10: Import/Export & Advanced

| Feature                   | What                                                                                                                                                                                                                                                                                                                                             | Effort | Status      |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ | ----------- |
| LighterPack import        | Parse CSV, map columns to schema, preview/confirm, generic CSV import                                                                                                                                                                                                                                                                            | M      | Not started |
| CSV/PDF export            | Per-pack and whole-trip CSV, print-friendly PDF view                                                                                                                                                                                                                                                                                             | M      | Not started |
| Reusable kits             | Kit CRUD, add kit to pack, shared vs personal kits, kit weight summary                                                                                                                                                                                                                                                                           | M      | Not started |
| Comparison view           | Side-by-side trip comparison, diff highlighting, weight delta summary                                                                                                                                                                                                                                                                            | M      | Not started |
| Household stats           | Trip count, lightest trip, total gear investment, fun summaries                                                                                                                                                                                                                                                                                  | S      | Not started |
| Copy pack to another trip | From any pack on any trip, "Copy to…" dropdown lists the user's other trips (and "New trip from this pack"). Atomic server-side copy — replicates the `TripPack` and every `TripPackItem` (preserving `ownedByUserId`, quantity, worn/consumable overrides). Target pack merges or replaces, user prompted.                                      | S-M    | Not started |
| Cut list                  | Mark trip items as "considering cutting." Dimmed display in the pack, running savings tally, "new base weight if cuts applied" preview. Moved out of Phase 7 — not needed to ship the drag-and-drop loadout builder.                                                                                                                             | S-M    | Not started |
| Item details modal        | Clicking a Gear Pool chip (or a pack row) opens a read-only details modal — name, brand/model, notes, weight in all units, category, owner, trip history, product link (Phase 9). Click still assigns via primary action; details is a secondary affordance. Moved out of Phase 7.                                                               | S      | Not started |
| Item attic (retired gear) | New `retiredAt` column on `items`. Retired items are hidden from the closet + Gear Pool by default, don't contribute to totals, can't be added to trips. Surface in a dedicated "Attic" view filtered off the closet page. Un-retire restores the item with all relationships intact. Useful for backfilling old trips that used long-gone gear. | M      | Not started |
| Parent/child items        | A tent is body + poles + stakes + footprint — sometimes packed in full, sometimes just the body. Model via `parentItemId` on items, with the parent carrying a derived weight when children are selected. Open design Q: do we also treat "kits" as syntactic sugar over parent/child? See bugs.md.                                              | M-L    | Not started |
| Auto-balance goals        | Set a household goal ("within 5% of each other" or explicit caps per person) and let drag-and-drop suggest redistribution of shared gear on the fly. Builds on Phase 9's Balance Intelligence by actually executing, not just recommending.                                                                                                      | M      | Not started |
| Price/weight comparison   | Per-item `priceCents` + optional candidate link. Comparison tool renders side-by-side: current vs. candidate → weight delta, $ delta, $ per oz saved. Works from the wishlist or an ad-hoc comparison view. Jennifer's Excel pattern.                                                                                                            | M      | Not started |
| Cross-owner closet search | Search in the closet surfaces matches across every household member + Shared, flagged "in Partner's closet / Shared". Off by default (toggleable), so the default view is still "mine." Feeds the "someone else already owns this" insight.                                                                                                      | S      | Not started |
| Closet filter by flags    | Quick filter pills in the closet: Worn / Carried / Consumable / Stackable. Also extend search to match those words in the item corpus. Makes "find all my worn items" one click.                                                                                                                                                                 | XS     | Not started |
| Owned-since metadata      | Surface `createdAt` in the closet as an "Owned since <month>" line (shown on hover or inline). Feeds the Item Attic flow — old items become retirement candidates.                                                                                                                                                                               | XS     | Not started |

---

## Phase 10.5: Kid Accounts

_Evolve the latent `child` role into a real first-class account type. Today a child is just a User row with `role: "child"` that any adult can manage — there's no way for a kid to log in or see their own gear._

| Feature                      | What                                                                                                                                                                                                                                                                                                            | Effort | Status      |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ----------- |
| Child dialog (parity w/ pet) | Counterpart to `PetDialog` — name, body weight, birth date (known precisely for kids), sex (optional). Any adult can add/edit/remove. No email, no login yet.                                                                                                                                                   | S      | Not started |
| Child login                  | Kids can sign in on their own — simple credentials (short username + parent-set PIN, or magic-link via parent email). Account is linked to the same household, but gates are on `role`.                                                                                                                         | M-L    | Not started |
| Restricted permissions       | Logged-in children can view the household closet, their own pack on trips, check items off in checklist mode, and edit their own gear. They **cannot** delete trips, remove members, change household settings, edit other people's packs, or touch shared gear assignments. Adult-only endpoints return 403.   | M      | Not started |
| Age-aware defaults           | Default carry %, default loadout routing, UI simplifications tied to the child's birth date (see spec §4 — 0-4 / 5-7 / 8-11 / 12-15 / 16+ buckets).                                                                                                                                                             | S-M    | Not started |
| Kids mode (far future)       | Opt-in simplified UI skin for logged-in kid accounts. Bigger touch targets, fewer columns, playful icons, RPG-flavored copy ("You're a Trail Scout"). Hides advanced features (what-if, stats panels, household settings). Parents toggle it on per-child. Also usable as a guest/"younger kid" mode on mobile. | L      | Not started |

---

## Phase 11: Community & Scale

_Tier 4. Only when the core is rock solid._

| Feature                   | What                                                                                                                                                                                                                                                              | Effort | Status      |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ----------- |
| Public trip gallery       | Browse by trail/conditions/base weight                                                                                                                                                                                                                            | L      | Not started |
| Fork/remix public lists   | Copy community lists into your closet                                                                                                                                                                                                                             | M      | Not started |
| Offline PWA               | Service worker, offline checklist, installable                                                                                                                                                                                                                    | L      | Not started |
| Trip planning             | Calorie calc (Pandolf equation), water planning, macros                                                                                                                                                                                                           | M      | Not started |
| Food in the closet        | Resolve design Q in `docs/bugs.md` — decide whether food lives in closet, trip-only, or a separate pantry. Build the model.                                                                                                                                       | M      | Not started |
| Water weight tracking     | Trip-specific water volume entries (separate from closet containers). Filled-container total rolls into carried weight.                                                                                                                                           | S-M    | Not started |
| Food weight guessamator   | Quick estimator: duration + calories/day + packaging → estimated food weight. Adds a single "Estimated food" line item to trip without needing a full meal library.                                                                                               | S      | Not started |
| Gear intelligence         | Lighter alternatives, weight optimization tips, community weights                                                                                                                                                                                                 | M-L    | Not started |
| Image upload              | Gear photos via Vercel Blob                                                                                                                                                                                                                                       | S-M    | Not started |
| Gear condition tracking   | Lifespan, wear tracking                                                                                                                                                                                                                                           | S      | Not started |
| Cost tracking             | Gear investment per category, over time                                                                                                                                                                                                                           | S      | Not started |
| Split unit prefs          | Two-axis preference: `itemsUnit` (per-item display) + `totalsUnit` (per-pack + summary display). Totals default to lb, items default to oz. Toggle cycles `itemsUnit`; totals unit set in household/user settings. Deferred here from Phase 5 after scope review. | S-M    | Not started |
| Google Photos integration | On a completed trip's page, pull a grid of the user's Google Photos taken between `startDate` and `endDate` (from geotagged photos in the trip location, if available). Read-only, no upload. Requires OAuth scope. Ties nicely with the post-trip report.        | M      | Not started |

---

## Phase 12: AI Copilot

_Natural-language interface over the user's own household, trips, and closet. Not a general gear chatbot — it's the readiness system and stats panel talking. Strongest fit once Phase 9 (Readiness) is built, since that's what gives the model something real to say._

| Feature                  | What                                                                                                                                                                                                                             | Effort | Status      |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ----------- |
| Chat drawer              | Collapsible right-hand drawer on `/app/*`. "Ask about your household, trips, or gear." Streaming responses via Vercel AI SDK v6 + AI Gateway. Default Anthropic model; fall back through the gateway.                            | M      | Not started |
| Household context tools  | LLM tools that query the current user's data: `get_trip(id)`, `list_packs(trip_id)`, `get_closet(user_id)`, `get_readiness(trip_id)`, `search_items(query)`, `get_settings()`. Scoped by session; never sees other households.   | M      | Not started |
| Conversation history     | Persist threads server-side per user: `ai_thread` + `ai_message` tables. List past conversations in the drawer, click to resume. Messages store role + content + tool calls + tool results. Auto-title from the first user turn. | M      | Not started |
| Trip-scoped shortcuts    | Buttons like "Why is my readiness 72%?", "What's the heaviest item?", "Rebalance my pack" on the trip workspace fire pre-canned prompts with the current trip as context. Keeps new users from staring at a blank text box.      | S      | Not started |
| Chat-to-action           | Model can propose mutations (`move_item(trip, from, to)`, `toggle_cut(item)`, `add_to_pack(item, pack)`) as tool calls, but every action is surfaced as a confirm dialog before hitting the DB. Never silently mutates.          | M-L    | Not started |
| Streaming + citations    | Responses stream token-by-token; each claim links back to the source (the specific pack row, the readiness check that fired, the catalog entry). Click a citation to scroll to it.                                               | S-M    | Not started |
| Context budget + caching | Every response uses prompt caching on the large household-context section. Conversation history uses the "last N turns + summarized older" compaction pattern so long threads don't blow the context window.                     | S      | Not started |

---

## Deprioritized

_Features pushed out of the near-term plan. Still in spec, revisit when the need arises._

| Feature                  | Original Phase | Why Deprioritized                                                                                 |
| ------------------------ | -------------- | ------------------------------------------------------------------------------------------------- |
| What-if mode             | 5              | Cut list covers 80% of the use case. What-if adds complex client-side staging for marginal gain.  |
| Templates                | 5              | Trip duplication already covers this. Templates need new schema + complex mapping for edge cases. |
| Solo trip mode           | 5              | Household always hikes together. Low urgency for single-column layout.                            |
| Keyboard nav + undo/redo | 7              | Nice-to-have power user feature. Not blocking anything.                                           |
| Solo alternative linking | 7              | Niche scenario (personal solo gear linked to shared group gear). Revisit with solo mode.          |
| Age-aware defaults       | 7              | No children in household currently. Build when needed.                                            |
| Pie chart toggle         | 8              | Low value — bar charts are better for comparison. LighterPack converts will adapt.                |

---

## Gear Veterancy (built in Phase 4)

| Trip Count | Label       |
| ---------- | ----------- |
| 0          | New         |
| 1-2        | Breaking In |
| 3-5        | Trusted     |
| 6-10       | Veteran     |
| 10+        | Legendary   |

---

## Summary

| Phase    | Theme                                                | Features | Cumulative               |
| -------- | ---------------------------------------------------- | -------- | ------------------------ |
| **1-4**  | Foundation through core                              | ~30      | ~30/140 (21%) — **DONE** |
| **4.5**  | Quick wins + fixes                                   | ~20      | ~50 (36%) — **DONE**     |
| **8**    | Tech debt (core)                                     | 5        | ~55 (39%) — **DONE**     |
| **4.6**  | Beta-ready polish                                    | ~18      | ~73 (52%) — **DONE**     |
| **4.7**  | Quick wins & polish                                  | ~15      | ~88 (63%) — **DONE**     |
| **7**    | Gear Pool + Drag-and-drop (M1–M6) + security audit   | ~10      | ~98 (70%) — **DONE**     |
| **5**    | Trip stats & visualization                           | 7        | ~105 (75%)               |
| **5.5**  | Dashboard refresh                                    | 3        | ~108 (77%)               |
| **6**    | Party view & loadout                                 | 5        | ~113 (81%)               |
| **8b**   | Polish (mobile, sharing)                             | 3        | ~116 (83%)               |
| **8.5**  | Location, weather, alerts                            | 5        | ~121 (86%)               |
| **9**    | Intelligence & readiness                             | 6        | ~127 (91%)               |
| **10**   | Import/export + advanced (+ cut list, details modal) | 8        | ~135 (96%)               |
| **10.5** | Kid accounts (login, restricted perms, kids mode)    | 5        | ~140 (100%)              |
| **11**   | Community & scale                                    | 8        | ~148 (106%)              |
| **12**   | AI copilot                                           | 7        | ~155 (111%)              |

Phase 7 (Gear Pool + drag-and-drop) shipped April 16-17 — six milestones M1-M6 plus eight cross-household security holes closed plus uniform mutation error toasts across every hook in the app. Cut list and item details modal moved out to Phase 10 (not load-bearing for the drag-and-drop loadout builder).

Phase 4.6 (beta-ready polish) shipped April 16 — household settings, roadmap page + suggestions, unified trip flow, collapsible categories, click-outside editors, confirm dialogs, trip workspace scroll, security headers + schema hygiene, and more.

Phases 5-6 are where the app becomes visually distinctive — stats panels, weight balance, party view, pack class labels. Some pack-class UI landed in 4.6 already via household settings.

---

## Key Design Decisions

| Decision                | Choice                                        | Rationale                                                      |
| ----------------------- | --------------------------------------------- | -------------------------------------------------------------- |
| Readiness warnings      | On by default, dismissable per-trip           | Helpful > annoying when dismissable                            |
| Cut list scope          | Trip-level + closet-level                     | Trip for immediate planning, closet for long-term optimization |
| Templates deprioritized | Trip duplication covers 80%                   | Build templates when patterns emerge from 10+ trips            |
| Gamification aesthetic  | Clean layout, RPG vocabulary, playful accents | Fun without being gimmicky. Upgrade path to more RPG later     |
| Loadout approach        | Phase A: CSS grid zones, Phase B: SVG later   | Ship the data model and layout first, add illustration later   |
| What-if deprioritized   | Cut list first                                | Cut list is simpler and more immediately useful                |
| Smart trip tags         | Auto-derived from pack contents               | No manual tagging — app figures it out from what's packed      |
| Stats panel             | Collapsible panel, not separate page          | Keep context — you're planning a trip, stats should be in-view |
| Party view              | Collapsible panel in workspace                | Same principle — don't navigate away to see the party          |
| Weight unit             | 4-way cycle (oz/lb/g/kg) in localStorage      | More flexible than binary imperial/metric. No DB migration.    |
