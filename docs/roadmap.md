# Family Pack — Roadmap

> Condensed roadmap covering all spec features, organized into build phases.
> Cross-reference with `docs/spec.md` for full feature details and `docs/context.md` for project context.

**Last updated:** April 15, 2026

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

## Phase 5: Trip Stats & Visualization — NEXT

_Make the trip workspace visually rich and data-driven. Pulled forward from Phases 6, 7, 9. This is where the app stops feeling like a spreadsheet._

| Feature                 | What                                                                                                                                                                                                  | Effort | Status      |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ----------- |
| Trip stats panel        | Collapsible bottom/side panel on workspace. Per-person weight breakdown, category bar charts (recharts), pack class labels, shared gear balance, total household weight. Toggle via button in header. | M      | Not started |
| Shared weight balance   | Stacked bar showing shared vs personal vs activity gear per person. Smart summary: "Thomas carries 68% of shared gear." Delta indicator. Separates fairness from personal choice.                     | S-M    | Not started |
| Pack class labels       | Ultralight/Lightweight/Light/Traditional/Heavy based on base weight. Dog: Trail Runner/Partner/Pack Dog/Overloaded. Displayed in stats panel + pack column headers.                                   | S      | Not started |
| Smart trip tags         | Auto-derived from pack contents: Warm Rated, Cold Weather, Fishing, Multi-Day, Ultralight, Lightweight, Bear Safe, Dog Friendly, Minimalist, Well-Equipped. Shown on trip cards + workspace header.   | S      | Not started |
| Trip metadata expansion | Show/edit terrain, temp range, description in workspace. New schema fields: `distanceMiles`, `durationDays`, `elevationGainFt`, `elevationHighFt`. Display in header + stats panel + edit dialog.     | S-M    | Not started |
| Category weight charts  | Horizontal bar chart per category using recharts, per-person or stacked comparison view. Displayed in stats panel.                                                                                    | S      | Not started |

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

## Phase 7: Drag-and-Drop + Cut List

_The remaining trip workspace power features._

| Feature                     | What                                                                                                                       | Effort | Status            |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------ | ----------------- |
| Drag-and-drop between packs | dnd-kit cross-container drag. Shared pool ↔ pack columns. Reorder within columns.                                          | M      | dnd-kit installed |
| Cut list                    | Mark trip items as "considering cutting." Dimmed display, running savings tally, "new base weight if cuts applied" preview | S-M    | Not started       |
| "Not on This Trip"          | Collapsible section at bottom of trip workspace showing closet items excluded from trip, quick-add back                    | S      | Not started       |
| Closet item drag-and-drop   | Reorder items within categories, drag items between categories                                                             | S      | dnd-kit installed |

---

## Phase 8: Tech Debt + Polish

_Pay down debt before scaling further._

| Feature           | What                                                                                                       | Effort | Status      |
| ----------------- | ---------------------------------------------------------------------------------------------------------- | ------ | ----------- |
| Zod validation    | Validate all PATCH/POST request bodies with Zod schemas. Stop spreading raw `...body` into DB updates.     | M      | Not started |
| Type the hooks    | Replace `any[]` returns in all hooks with proper types matching Drizzle schema. Kills ~60 lint warnings.   | M      | Not started |
| Error boundaries  | React error boundary per pack column + per closet section. Graceful failure without page crash.            | S      | Not started |
| Mobile responsive | Tabbed person-switcher on trip workspace, touch-friendly checklist, responsive closet grid, swipe gestures | M-L    | Not started |
| Sharing pages     | Public read-only trip/pack links (`/share/[tripId]`), purpose-built clean display page                     | M      | Not started |
| User profile UI   | Dedicated profile page with body stats form, pet profile editing (currently scattered across dashboard)    | S      | Not started |

---

## Phase 9: Intelligence & Readiness

_The features that make the app feel smart._

| Feature               | What                                                                                                                         | Effort | Status      |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------ | ----------- |
| Readiness system      | Ten Essentials fuzzy matching on item names/categories, per-person score (0-100%), dismissable warnings, dog-specific checks | M-L    | Not started |
| Activity tags         | Tag picker UI on items/categories, closet filter, trip activity selection auto-suggests relevant categories                  | S      | Not started |
| Balance intelligence  | Capacity % view, highlight most overloaded member, one-click auto-suggest rebalance ("move tent to Partner to equalize")     | M      | Not started |
| Gear history insights | Core vs occasional gear identification, actual vs planned weight, per-trip notes ("bring longer stakes next time")           | S-M    | Not started |

---

## Phase 10: Import/Export & Advanced

| Feature            | What                                                                   | Effort | Status      |
| ------------------ | ---------------------------------------------------------------------- | ------ | ----------- |
| LighterPack import | Parse CSV, map columns to schema, preview/confirm, generic CSV import  | M      | Not started |
| CSV/PDF export     | Per-pack and whole-trip CSV, print-friendly PDF view                   | M      | Not started |
| Reusable kits      | Kit CRUD, add kit to pack, shared vs personal kits, kit weight summary | M      | Not started |
| Comparison view    | Side-by-side trip comparison, diff highlighting, weight delta summary  | M      | Not started |
| Household stats    | Trip count, lightest trip, total gear investment, fun summaries        | S      | Not started |

---

## Phase 11: Community & Scale

_Tier 4. Only when the core is rock solid._

| Feature                 | What                                                              | Effort | Status      |
| ----------------------- | ----------------------------------------------------------------- | ------ | ----------- |
| Public trip gallery     | Browse by trail/conditions/base weight                            | L      | Not started |
| Fork/remix public lists | Copy community lists into your closet                             | M      | Not started |
| Offline PWA             | Service worker, offline checklist, installable                    | L      | Not started |
| Trip planning           | Calorie calc (Pandolf equation), water planning, macros           | M      | Not started |
| Gear intelligence       | Lighter alternatives, weight optimization tips, community weights | M-L    | Not started |
| Image upload            | Gear photos via Vercel Blob                                       | S-M    | Not started |
| Gear condition tracking | Lifespan, wear tracking                                           | S      | Not started |
| Cost tracking           | Gear investment per category, over time                           | S      | Not started |

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

| Phase   | Theme                      | Features | Cumulative               |
| ------- | -------------------------- | -------- | ------------------------ |
| **1-4** | Foundation through core    | ~30      | ~30/140 (21%) — **DONE** |
| **4.5** | Quick wins + fixes         | ~20      | ~50 (36%) — **DONE**     |
| **5**   | Trip stats & visualization | 6        | ~56 (40%)                |
| **6**   | Party view & loadout       | 5        | ~61 (44%)                |
| **7**   | Drag-and-drop + cut list   | 4        | ~65 (46%)                |
| **8**   | Tech debt + polish         | 6        | ~71 (51%)                |
| **9**   | Intelligence & readiness   | 4        | ~75 (54%)                |
| **10**  | Import/export + advanced   | 5        | ~80 (57%)                |
| **11**  | Community & scale          | 8        | ~88 (63%)                |

Phases 5-6 are where the app becomes visually distinctive — stats panels, weight balance, party view, pack class labels. These are the features no competitor has. Phase 7 adds the drag-and-drop polish. Phase 8 pays down tech debt before the intelligence features in Phase 9.

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
