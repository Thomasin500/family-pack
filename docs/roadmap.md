# Family Pack — Roadmap

> Condensed roadmap covering all spec features, organized into build phases.
> Cross-reference with `docs/spec.md` for full feature details and `docs/context.md` for project context.

**Last updated:** April 14, 2026

---

## Phase 1-3: Foundation + Closet + Trips — DONE

Auth, household, gear closet, trip workspace, weight display, pet support, dark mode, catalog, CI/CD, Vercel + Neon deploy. **~25 features built.**

---

## Phase 4: Core Completion — DONE

*Built April 14, 2026. Not yet committed.*

| # | Feature | What | Status |
|---|---|---|---|
| 2 | Unit toggle | Imperial/metric switch in nav, `WeightUnitProvider` context, `GET/PATCH /api/user/preferences` | **Done** |
| 3 | Checklist mode | `isChecked` on trip_pack_items, toggle on workspace, checkboxes, progress bars | **Done** |
| 4 | Gear history | `GET /api/items/history` (trip count query), veterancy labels in closet | **Done** |
| 8 | Loadout view MVP | CSS grid pack zones, category-to-zone mapping, per-person modal from pack column | **Done** |
| — | Vitest test suite | 38 tests: weight conversions, veterancy levels, zone mapping | **Done** |

---

## Phase 5: Trip Experience

*Make the trip workspace powerful.*

| # | Feature | What | Effort | Status |
|---|---|---|---|---|
| 14 | Drag-and-drop | dnd-kit, cross-column drag, reorder, pool ↔ column | M | Pending |
| 6 | Cut list + wishlist | Trip-level + closet-level cut candidates, wishlist with replacement linking | S-M | Pending |
| 15 | What-if mode | Ghost items, swap simulation, apply/discard staging (extends cut list) | M | Pending |
| 7 | Templates | New schema, save trip as template, create from template, default loadouts | M | Pending |
| — | Trip duplication | Copy previous trip as starting point | S | Not started |
| — | "Not on This Trip" | Collapsible view of closet items not in trip, quick-add back | S | Not started |
| — | Solo trip mode | Single column layout, merged personal + shared gear view | S | Not started |

---

## Phase 6: Intelligence & Gamification

*The features that make Family Pack feel smart and fun.*

Design direction: clean layout, RPG vocabulary, playful icon accents. Labels describe style, not rank. No streaks, XP, or leaderboards.

| # | Feature | What | Effort | Status |
|---|---|---|---|---|
| 11 | Activity tags | Tag picker UI, closet filter, trip activity selection | S | Pending |
| 9 | Gamification A | Pack class labels, dog class labels, smart auto-derived trip tags | M | Pending |
| 5 | Readiness system | Ten Essentials fuzzy matching, per-person score, dismissable warnings (on by default), dog checks | M-L | Pending |
| 10 | Gamification B | Weight trend charts (base/worn/consumable × season), party composition modal, carrier history | M | Pending |
| — | Balance intelligence | Capacity % view, highlight overloaded member, auto-suggest rebalance | M | Not started |

### Smart Trip Tags (auto-derived, part of Gamification A)

Warm Rated, Cold Weather, Fishing, Multi-Day, Ultralight, Lightweight, Bear Safe, Dog Friendly, Minimalist, Well-Equipped

### Pack Class Labels

| Base Weight | Human Class | Dog Carry % | Dog Class |
|---|---|---|---|
| Under 10 lb | Ultralight | < 10% | Trail Runner |
| 10-15 lb | Lightweight | 10-15% | Trail Partner |
| 15-20 lb | Light | 15-20% | Pack Dog |
| 20-30 lb | Traditional | > 20% | Overloaded |
| Over 30 lb | Heavy | | |

### Gear Veterancy

| Trip Count | Label |
|---|---|
| 0 | New |
| 1-2 | Breaking In |
| 3-5 | Trusted |
| 6-10 | Veteran |
| 10+ | Legendary |

---

## Phase 7: Polish & Completeness

*Round out the rough edges from Tier 1 and Tier 2.*

| Feature | What | Effort | Status |
|---|---|---|---|
| Mobile responsiveness | Responsive closet, tabbed trip workspace, swipe gestures, touch-friendly checklist | M-L | Not started |
| Closet search & filter | Search by name/category/tag, filter personal/shared | S | Not started |
| Weight display gaps | Heatmap on item rows, bar chart by category, budget progress bar, balance indicator, carry limits | M | Not started |
| Editing power | Keyboard nav (Tab/arrow/n/d), bulk actions, undo/redo | M-L | Not started |
| Sharing pages | Public read-only trip/pack links, purpose-built display page | M | Not started |
| User profile UI | Body stats form (weight, height, birth date), pet profile editing | S | Not started |
| Age-aware defaults | Pack assignment rules by age bracket, pet carry limit auto-routing | S-M | Not started |
| Notes & details | Item notes field UI, full detail modal, per-item trip notes | S | Not started |
| Solo alternative linking UI | Link personal ↔ shared items, auto-suggest swaps on solo trips | S | Not started |
| Closet drag-and-drop reorder | Within and between categories | S | Not started |

---

## Phase 8: Import/Export & Kits

*Onboarding from other apps + power-user organization.*

| # | Feature | What | Effort | Status |
|---|---|---|---|---|
| 13 | LighterPack import | Parse CSV, map columns, preview/confirm, generic CSV import | M | Pending |
| 13 | CSV/PDF export | Per-pack and whole-trip CSV, print-friendly PDF view | M | Pending |
| 12 | Reusable kits | Kit CRUD, add kit to pack, shared vs personal, kit weight summary (schema exists) | M | Pending |
| — | Pie chart toggle | Secondary viz for LighterPack converts | S | Not started |

---

## Phase 9: Advanced Loadout & Analytics

*Upgrade the skeleton loadout view, add deeper insights.*

| Feature | What | Effort | Status |
|---|---|---|---|
| Loadout: worn gear section | "Worn" zone above pack, list equipped items | S | Not started |
| Loadout: pack SVG overlay | Simple illustrated pack outline behind zone grid | M | Not started |
| Loadout: person silhouette | Worn gear on body diagram | M | Not started |
| Loadout: dog variant | Saddle pack diagram for pets | M | Not started |
| Loadout: group view | All members side by side in zone layout | M | Not started |
| Loadout: essentials highlighting | Missing items flagged in zones (ties to readiness system) | S | Not started |
| Comparison view | Side-by-side trips, diff highlighting, weight delta | M | Not started |
| Solo vs group analytics | Separate tracking, "solo tax" indicator | S | Not started |
| Gear hand-me-downs | Move item between closets, age-appropriate suggestions | S | Not started |
| Household stats | Trip count, lightest trip, total gear, fun summaries | S | Not started |

---

## Phase 10: Community & Scale

*Tier 4. Only when the core is rock solid.*

| Feature | What | Effort | Status |
|---|---|---|---|
| Public trip gallery | Browse by trail/conditions/base weight | L | Not started |
| Fork/remix public lists | Copy community lists into your closet | M | Not started |
| Comments & upvotes | Social features on public lists | M | Not started |
| Offline PWA | Service worker, offline checklist, installable | L | Not started |
| Trip planning | Calorie calc (Pandolf equation), water planning, macros | M | Not started |
| Gear intelligence | Lighter alternatives, weight optimization tips, community weights | M-L | Not started |
| Image upload | Gear photos via Vercel Blob | S-M | Not started |
| Gear condition tracking | Lifespan, wear tracking | S | Not started |
| Cost tracking | Gear investment per category, over time | S | Not started |

---

## Summary

| Phase | Theme | Features | Cumulative |
|---|---|---|---|
| **1-3** | Foundation | ~25 | ~25/140 (18%) — **DONE** |
| **4** | Core completion | 5 | ~30 (21%) — **DONE** |
| **5** | Trip experience | 7 | ~47 (34%) |
| **6** | Intelligence & gamification | 5 | ~68 (49%) |
| **7** | Polish & completeness | 10 | ~95 (68%) |
| **8** | Import/export & kits | 4 | ~107 (76%) |
| **9** | Advanced loadout & analytics | 10 | ~127 (91%) |
| **10** | Community & scale | 9 | ~140 (100%) |

Phases 4-6 are where the app goes from "working MVP" to "something people would switch to." Phase 7 fills the Tier 1/2 gaps. Phases 8-10 are the long tail.

Phase 4 completed April 14, 2026. ~30 features built total (~21% of spec).

---

## Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Readiness warnings | On by default, dismissable per-trip | Helpful > annoying when dismissable |
| Cut list scope | Trip-level + closet-level | Trip for immediate planning, closet for long-term optimization |
| Templates | User-based with best-effort mapping | Simple to create (save trip), graceful when members change |
| Gamification aesthetic | Clean layout, RPG vocabulary, playful accents | Fun without being gimmicky. Upgrade path to more RPG later |
| Loadout MVP | CSS grid zones, no SVG | Ship the data model and layout first, add illustration later |
| What-if mode | Client-side staging, extends cut list | Cut list first (simple), what-if adds swaps on top |
| Smart trip tags | Auto-derived from pack contents | No manual tagging — app figures it out from what's packed |
