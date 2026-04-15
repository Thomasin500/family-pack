# Family Pack — Product Specification

> A family and couples-focused backpacking gear management and trip planning web app.

**Last updated:** April 14, 2026 (post-MVP build)

---

## Table of Contents

1. [Product Vision](#1-product-vision)
2. [Competitive Landscape](#2-competitive-landscape)
3. [UI Design Principles](#3-ui-design-principles)
4. [Complete Feature List](#4-complete-feature-list)
5. [Tech Stack](#5-tech-stack)
6. [Data Model](#6-data-model)
7. [Page Structure & Routes](#7-page-structure--routes)
8. [Project Folder Structure](#8-project-folder-structure)
9. [Catalog Seed Strategy](#9-catalog-seed-strategy)
10. [Database & Hosting Setup](#10-database--hosting-setup)
11. [Development Environments](#11-development-environments)
12. [Scaling Roadmap](#12-scaling-roadmap)
13. [Implementation Phases](#13-implementation-phases)
14. [Gamification & Loadout System](#14-gamification--loadout-system)

---

## 1. Product Vision

### Core Concept

A gear management and trip planning app for backpackers that tracks weights, organizes by category, and helps optimize pack loadouts. The core differentiator: **gear ownership (personal vs shared), multi-person trip planning with carrier assignment, and weight balancing across packs.**

No other app models a household. They all assume a single user or a single account managing participants.

### The Pitch

> OutPack does group trips. We do **household** trips — where both people have their own account, their own gear closet, shared household gear, and parents decide who carries what.

> PackStack lets one person plan gear for a couple. We let the whole family participate — each person manages their own kit, parents decide who carries what, and everyone can see the plan.

### Core Architecture Insight

The fundamental data model difference: **we model a couple as two people who share a household, not as one person with two labels.** That distinction cascades through every feature.

Key concepts no competitor handles:

| Concept | What it means |
|---|---|
| **Shared gear ownership** | An item can belong to a household, not just one person |
| **Owner vs carrier** | A kid owns their sleeping bag, but a parent might carry it |
| **Weight balancing** | See all packs side-by-side and balance shared gear to equalize weight |
| **Solo vs group mode** | Same closet feeds both solo lists and group trips seamlessly |
| **Two accounts, one household** | Both partners log in independently but share a gear pool |
| **Pets as trip members** | Dogs get their own closet, pack column, and carry weight limits based on body weight |

---

## 2. Competitive Landscape

### App Rankings

#### 1. Hikt — Best Overall

The newest serious contender and the most polished app in this space today.

- Web + native iOS + Android with seamless sync
- Robust offline support (view, check off, add gear offline — syncs when reconnected)
- Pantry feature for consumables (food, fuel, batteries, first-aid) with resupply planning
- LighterPack import via share URL (automatic transfer of everything)
- Collaborative list editing (premium)
- Smart list analyzer (premium)
- Free tier: up to 3 lists. Premium unlocks unlimited.

**Why it's #1:** Best balance of features, UX, and cross-platform support.

#### 2. OutPack — Most Feature-Rich for Trip Lifecycle

Built by Andrew Carmichael, a Scottish hiker and software engineer. Featured in Backpacker Magazine as "Best New Trip Planner." Free, web-based, works on mobile.

- Full gear closet with categories, weights, notes
- Curated gear database with manufacturer specs
- Gear kits (bundle related items, build packs from kits)
- **Group trips: add members, assign gear to each person, weight per person, distribute shared gear**
- Full food library with drag-and-drop meal planner, calorie/macro tracking per participant
- Wishlist for future gear upgrades
- Gear history (how many times you've packed each item)
- Trip journaling: waypoints, GPX routes, photos, summit tracking
- Actual vs planned weight logging, notes on what worked
- Social features: follow other backpackers, activity feed, privacy controls
- Packing checklist with item checkoff

**OutPack's group model:** One person creates a trip and adds "participants." Gear is assigned from the account owner's inventory to each participant. Participants likely cannot log in independently or manage their own gear closet. More capable than PackStack's multi-pack approach but still falls short of a true household model.

**Why it's #2:** Most complete single app for the full backpacking workflow. Best existing group trip features. The food/meal planner alone puts it ahead of most competitors. Limited by single-account model and no household concept.

#### 3. PackStack — Best for Trip Planning

- Strongest trip metadata (location, dates, elevation, terrain, temperature)
- Calorie calculator (Pandolf equation) tied to trip conditions
- Multi-pack per trip (group trips)
- Gear catalog search (auto-fill brand/model/weight)
- Hiker profiles with body stats
- Native iOS app
- Open source on GitHub

**PackStack's couples model:** Single account with "hiker profiles" — named body-stat cards. One person owns the account and manages everything. Partner can view via shared link (read-only) but cannot edit.

**Why it's strong:** Holistic trip planning beyond just gear weight. But the single-account model is a fundamental limitation for couples who both want to participate.

#### 4. PackWizard — Best for Gear Research/Shopping

- Deep gear database with live retail pricing
- "Find lighter alternatives" suggestions
- Pack Browser with community tags (trail, season, activity)
- Checklist view + PDF export

**Why it's strong:** If you're actively shopping for lighter gear and want data-driven recommendations, PackWizard is unmatched. But the affiliate-driven UX can feel pushy.

#### 5. LighterPack — The Legacy Standard (Community Default)

- Still the most widely used (especially on r/ultralight)
- Simple, fast, free, no account required
- Best inline editing UX of any competitor
- But: dated UI, no gear closet, poor mobile, no collaboration, minimal development

### Competitive Comparison Matrix

| Feature | LighterPack | PackWizard | PackStack | Hikt | OutPack | **Ours** |
|---|---|---|---|---|---|---|
| Gear closet | No | Yes (bins) | Yes | Yes | Yes | **Yes** |
| Weight breakdown (base/worn/consumable) | Yes | Yes | Yes | Yes | Yes | **Yes** |
| Gear database (auto-fill) | No | Yes (pricing) | Yes (catalog) | Yes | Yes (mfr specs) | **Tier 1 (names), Tier 3 (full)** |
| Multi-pack per trip | No | No | Yes | No | Yes | **Yes** |
| Group trip (assign gear to people) | No | No | Partial (profiles) | No | **Yes** | **Yes** |
| Shared gear distribution | No | No | No | No | **Yes** | **Yes** |
| Trip metadata (dates, terrain, temp) | No | No | Yes | No | Yes | **Tier 1 (basic), Tier 3 (full)** |
| Food / meal planning | No | No | Calorie calc | No | **Full (library, macros, per-person)** | **Tier 3** |
| Gear kits | No | No | Yes | No | Yes | **Tier 2** |
| Checklist mode | No | Yes | No | No | Yes | **Tier 2** |
| Trip journaling (waypoints, GPX, photos) | No | No | No | No | **Yes** | No |
| Gear history (times packed) | No | No | No | No | **Yes** | **Tier 3** |
| Wishlist | No | No | No | No | **Yes** | **Tier 2** |
| Actual vs planned weight | No | No | No | No | **Yes** | **Tier 3** |
| Social (follow, activity feed) | No | No | No | No | **Yes** | **Tier 4** |
| Public gallery / pack browser | No | Yes (tags) | Links only | Basic | Basic | **Tier 4 (+ forking)** |
| List comparison (side-by-side) | No | No | No | No | No | **Tier 3** |
| Mobile experience | Poor | Improved | Native iOS | Good | Responsive web | **Responsive + PWA** |
| Import (LighterPack/CSV) | N/A | Yes | Yes | Yes | Unknown | **Tier 2** |
| Export (PDF/CSV) | No | PDF | No | No | Unknown | **Tier 2** |
| Drag and drop | Basic | No | Yes | No | Meal planner | **Yes** |
| Dark mode | No | No | Yes | Yes | Unknown | **Yes** |
| Inline editing | Yes | No | No | No | No | **Yes** |
| Household/shared gear model | No | No | No | No | No | **Yes** |
| Separate accounts per person | N/A | N/A | No | No (premium collab) | No | **Yes** |
| Side-by-side pack balancing | No | No | No | No | Percentages | **Yes (drag + delta + auto-suggest)** |
| Owner vs carrier tracking | No | No | No | No | No | **Yes** |
| What-if mode | No | No | No | No | No | **Tier 3** |
| Fork/remix community lists | No | No | No | No | No | **Tier 4** |
| Solo alternative linking | No | No | No | No | No | **Yes** |
| Weight heatmap | No | No | No | No | No | **Yes** |
| Kids/age-aware defaults | No | No | No | No | No | **Yes** |
| Pet/dog as trip member | No | No | No | No | No | **Yes** |

### Gaps We Own Exclusively

- **Household model** — separate accounts linked into a household with shared gear pool
- **Owner vs carrier distinction** — parent carries kid's gear, tracked separately
- **Shared gear pool with drag assignment** — visual drag-and-drop between packs
- **Solo alternative item linking** — personal solo gear linked to shared group gear
- **What-if mode** — ghost items to simulate weight changes
- **Weight heatmap** — green-to-red tint on item rows by relative weight
- **Carry weight limits with capacity % balancing** — visual balance + auto-suggest
- **Age-aware defaults** — kid's gear auto-routes based on age
- **Fork/remix community lists** — GitHub model for gear lists
- **Inline editing + quick-add bar** — LighterPack-speed editing in a modern app
- **Pets as first-class trip members** — own closet, own pack column, carry weight limits based on body weight %

### What OutPack Does That We Don't (and whether to add it)

| OutPack Feature | Add to Family Pack? | Where | Notes |
|---|---|---|---|
| **Food library + meal planner** | Partial | Tier 3 | Our calorie calc is simpler. Full meal planner is a large feature. Consider pantry for consumables |
| **Trip journaling** (waypoints, GPX, photos, summits) | No | — | Different product focus. We're a gear planning tool, not a trip journal. Users can pair us with AllTrails/Gaia |
| **Gear history** (times packed) | Yes | Tier 3 | Simple counter. Helps identify core vs rarely-used gear |
| **Wishlist** | Yes | Tier 2 | Boolean flag on Item or lightweight table. Low effort, nice to have |
| **Actual vs planned weight** | Yes | Tier 3 | `actual_weight_grams` on TripPack. Post-trip logging |
| **Social** (follow users, activity feed) | Partial | Tier 4 | Public gallery with forking covers the useful part without building a social network |
| **Barcode scanner for food** | No | — | Niche feature, unreliable (per OutPack reviews). Not worth the effort |

---

## 3. UI Design Principles

### Core Principles

| Principle | Implementation |
|---|---|
| **Inline editing first** | Click any cell to edit. No modals for name, weight, quantity. Tab between fields, Enter to save |
| **Quick-add bar** | Persistent input row at bottom of each category. Type + Enter. Never open a form to add an item |
| **Catalog typeahead** | As you type in the name field, fuzzy-match against catalog. Pick a suggestion or keep typing |
| **Keyboard-driven** | Tab/arrow keys between fields and rows. `n` for new item, `d` for delete, Enter to confirm |
| **Auto-save** | No save button anywhere. Every change persists immediately via debounced mutations |
| **Mobile-first for checklist** | Checklist mode is the #1 mobile use case. Design it phone-first |
| **Desktop-first for workspace** | The multi-column trip editor is a desktop experience. On mobile, tabs switch between packs |
| **Color-coded categories** | Left border color bar on item groups. Consistent across closet and trip views |
| **Weight heatmap** | Tint weight cells green-to-red relative to category. Heaviest items pop visually |
| **Contextual weight units** | Items < 16oz display in oz. Totals display in lb + oz. Metric users get g/kg. Storage always grams |
| **Dark mode** | Ship from day one via Tailwind dark mode |

### What to Keep from Competitors

| Pattern | Source | Verdict |
|---|---|---|
| Inline cell editing | LighterPack | **Keep** — core UX advantage |
| Category color bars | Everyone | **Keep** |
| Pie chart | Everyone | **Keep as secondary**, add bar chart + budget bar as primary |
| Drag-and-drop reorder | LighterPack, PackStack | **Keep** |
| Base/worn/consumable toggle | Everyone | **Keep**, improve icon affordance with clear labels |
| Shareable read-only view | PackStack | **Keep** — purpose-built display page |
| Gear catalog search | PackStack, PackWizard | **Keep** for names in Tier 1, full data in Tier 3 |
| Reusable kits | PackStack | **Keep** for Tier 2 |

### What to Change from Competitors

| Pattern | Source | Change |
|---|---|---|
| Gear closet as popup | PackWizard | **Full page** — not a popup or sidebar |
| Pie chart as primary viz | Everyone | **Bar chart primary** — easier to compare, pie chart as toggle |
| Modal item editing | PackStack, Hikt | **Inline-first** — modal only for full detail (notes, image, links) |
| Desktop-only design | LighterPack, PackWizard | **Mobile-first for key views** (closet, checklist) |
| Fixed unit display | Most apps | **Contextual units** — items in oz, totals in lb+oz, metric toggle |
| Flat category lists | Everyone | **Sub-categories** — collapsible groups within categories |

### What to Add (new patterns)

| Pattern | Notes |
|---|---|
| **Weight balance indicator** | Visual bar comparing packs with delta. Green = balanced, red = lopsided |
| **What-if mode** | Ghost/remove items to see weight impact without committing |
| **Weight heatmap on rows** | Green-to-red tint on weight cells relative to category |
| **Quick-add bar** | Persistent input at bottom of each category for rapid entry |
| **Pack timeline** | Calendar showing shared gear commitments (Tier 3+) |
| **Carry weight vs base weight** | Two metrics per person — what they own vs what they physically carry |

### Key Screen Wireframes

#### Gear Closet

```
+---------------------------------------------------+
|  Gear Closet             [Mine] [Partner] [Shared] |
+---------------------------------------------------+
|  Search / filter...              [+ Add from catalog]|
+---------------------------------------------------+
|  # SHELTER                                 12.4 oz |
|  |- Big Agnes Copper Spur UL2    42 oz    1   B   |
|  |- Groundsheet                   5 oz    1   B   |
|  '- [name        ] [   oz] [qty:1] [+Add]         |
|                                                    |
|  # SLEEP                                           |
|  |- EE Enigma 20                 22 oz    1   B   |
|  |- Therm-a-Rest XTherm NXT     15 oz    1   B   |
|  '- [name        ] [   oz] [qty:1] [+Add]         |
|  ...                                               |
+---------------------------------------------------+
```

#### Trip Workspace — Couples Mode

```
+------------------------------------------------------+
|  Olympic NP -- July 2026                  [Checklist] |
+---------------------------+--------------------------+
|  Your Pack                |  Partner's Pack          |
|  SHELTER                  |  COOK                    |
|  |- Tent (shared)         |  |- Stove (shared)       |
|  |- Groundsheet (shared)  |  |- Pot (shared)         |
|  SLEEP                    |  SLEEP                   |
|  |- Quilt                 |  |- Sleeping bag         |
|  |- Pad                   |  |- Pad                  |
+---------------------------+--------------------------+
|  Base: 10.8 lb            |  Base: 11.2 lb           |
|  Carry: 12.4 lb           |  Carry: 13.1 lb          |
|  ########..               |  #########.              |
|              D 0.7 lb -- balanced                    |
+------------------------------------------------------+
|  Shared gear pool: [Bear canister] [First aid]       |
+------------------------------------------------------+
```

#### Trip Workspace — Family Mode (with kids and pet)

```
+--------------------------------------------------------------------+
|  Olympic NP -- July 2026               [Balance] [Checklist]        |
+----------+----------+----------+----------+-----------------------+
|  You     |  Partner |  Alex(12)|  Sam (7) |  Birch (dog)          |
|  SHELTER |  COOK    |  SLEEP   |  CLOTHING|  BIRCH'S GEAR         |
|  Tent *  |  Stove * |  Bag     |  Rain jkt|  Pack+harness         |
|  Gndsht *|  Pot *   |  Pad     |          |  Socks                |
|  SLEEP   |  WATER   |  CLOTHING|  FOOD    |  Sweater              |
|  Bag     |  Filter *|  Layers  |  Snacks  |  Bowl                 |
|  Pad     |  SAFETY  |  Rain jkt|          |  Food (2 meals)       |
|  Sam's ~ |  First * |  SHARED  |  FUN     |  Pet first aid        |
|   bag    |   aid    |  Bear  * |  Toy     |                       |
|  Sam's ~ |  Sam's ~ |   can    |          |                       |
|   layers |   pad    |  Snacks  |          |                       |
+----------+----------+----------+----------+-----------------------+
|  Carry:  |  Carry:  |  Carry:  |  Carry:  |  Carry:               |
| 18.6/40  | 16.2/35  | 10.1/15  |  3.4/8   |  11.1/14 lb           |
|  47%bw   |  46%bw   |  67%bw!! |  43%bw   |  20%bw (55lb dog)     |
+--------------------------------------------------------------------+
|  * = shared    ~ = carrying for someone    %bw = % of body weight  |
|  Shared pool: [none]   Unassigned: [Sam's rain pants]              |
+--------------------------------------------------------------------+
```

#### Visual Indicators

| Icon | Meaning |
|---|---|
| `*` (shared) | Shared family/household gear |
| `~` (carrying for) | Carrying someone else's gear (owner != carrier) |
| No icon | Your own personal gear in your own pack |

#### Weight Lines Per Person

| Metric | Meaning |
|---|---|
| **Base weight** | Gear in pack, excluding consumables and worn items (for gear optimization) |
| **Total carried** | Base + consumables (what the pack actually weighs on your back) |
| **Skin out total** | Total carried + worn items (everything on your body leaving the trailhead) |
| **% of body weight** | Total carried / body weight. Shown for all members with body weight entered. Critical for dogs (10-25% max), kids, and comfort planning |

#### Mobile — Trip Workspace

```
+--------------------------------------+
| [You] [Partner] [Alex] [Sam] [Birch] |  <- tab bar, swipe between
+--------------------------------------+
|  Your Pack                            |
|  SHELTER                              |
|  |- Tent *                            |
|  |- Groundsheet *                     |
|  SLEEP                                |
|  |- Bag                               |
|  |- Pad                               |
|  |- Sam's bag ~                       |
|  |- Sam's layers ~                    |
|  FOOD                                 |
|  |- Food (day 1-2) *                  |
+--------------------------------------+
|  Carry: 18.6 / 40 lb (47% bw)        |
|  Skin out: 19.8 lb                    |
|  ########....  47%                    |
+--------------------------------------+
|  [+ Add gear] [Balance]               |
+--------------------------------------+
```

---

## 4. Complete Feature List

### Tier 1 — Core MVP

#### Accounts & Household

- [ ] Individual accounts with Google OAuth
- [ ] Household creation with invite code/link
- [ ] Household member management
- [ ] User profile: name, body stats (weight, height, birth date, sex), unit preference
- [ ] Role: adult vs child vs pet (drives age-aware defaults and carry limits)
- [ ] Pet profiles: name, body weight, breed/size (managed by an adult in the household)
- [ ] Pet closet section (managed by the pet's owner, works like a young child's closet)

#### Gear Closet

- [ ] Personal closet per user
- [ ] Shared household gear pool
- [ ] Full-page closet with tabs: Mine / [Partner's name] / [Pet's name] / Shared
- [ ] Partner's closet is read-only, pet's closet is editable by managing adult
- [ ] Inline editing on all fields (click to edit, Tab between, Enter to save)
- [ ] Quick-add bar at bottom of each category
- [ ] Catalog typeahead on name field (fuzzy search)
- [ ] Custom categories with color and sort order
- [ ] Optional sub-categories (collapsible)
- [ ] Base / Worn / Consumable toggle (clear labels, not ambiguous icons)
- [ ] Drag-and-drop reorder within and between categories
- [ ] Search and filter (name, category, tags, personal/shared)
- [ ] Freeform tags per item
- [ ] Notes field (expandable)
- [ ] Weight stored in grams, displayed contextually (oz / lb+oz / g / kg)
- [ ] Solo alternative linking (link personal item to shared item counterpart)
- [ ] Auto-save (debounced mutations, no save button)

#### Catalog (Names Only)

- [ ] `CatalogProduct` table seeded with OpenWeightDatabase + Featherweight data
- [ ] Fuzzy search via PostgreSQL `pg_trgm` index
- [ ] Typeahead in quick-add bar and closet add flow
- [ ] "Not in catalog? Add manually" always available
- [ ] Community growth: manual entries become catalog candidates with user consent
- [ ] All fields editable after auto-fill (catalog is a suggestion, never a lock)

#### Trip Management

- [ ] Trip list page (past trips with basic info)
- [ ] New trip flow: "Who's going?" (checkboxes for household members including pets) -> trip metadata -> workspace
- [ ] Trip metadata: name, dates, location, season, terrain, temp range
- [ ] One active trip at a time (simplified — no gear scheduling)
- [ ] Duplicate a previous trip as starting point
- [ ] Auto-suggest solo swaps when creating solo trip from group template
- [ ] Partner can view your solo trips (read-only)

#### Trip Workspace — Group Mode

- [ ] Side-by-side pack columns (one per trip member)
- [ ] Shared gear pool at bottom (unassigned shared items)
- [ ] Drag shared gear from pool into any person's column
- [ ] Drag shared gear between columns to reassign
- [ ] Add items from closet (personal + shared)
- [ ] Owner vs carrier distinction on every TripPackItem
- [ ] "Carrying for" indicator when carrier != owner
- [ ] Unassigned kid gear pool (young kids' gear defaults here)
- [ ] Per-item worn/consumable override for this trip
- [ ] Inline editing within packs
- [ ] Auto-save

#### Trip Workspace — Solo Mode

- [ ] Single column layout (full width)
- [ ] Merged gear view: personal + shared gear together when adding items
- [ ] Shared gear badge (small indicator on shared items)
- [ ] No balance indicator (just weight budget bar)
- [ ] Partner can view (read-only)

#### Weight Display

- [ ] Base weight per person (gear in pack, excluding consumables and worn)
- [ ] Total carried weight per person (base + consumables — what the pack weighs)
- [ ] Skin out total per person (total carried + worn — everything on your body)
- [ ] Weight as % of body weight (shown when body weight is entered; critical for dogs, kids, adults)
- [ ] Carry weight limit per person (user-defined max, or % of body weight for pets/kids)
- [ ] Carry weight progress bars (fill based on total carried / max)
- [ ] Weight balance indicator for group trips (delta between packs)
- [ ] Combined household total
- [ ] Horizontal bar chart by category (primary viz, one per pack)
- [ ] Weight budget progress bar (target base weight vs actual)
- [ ] Weight heatmap on item rows (green-to-red tint)
- [ ] Per-pet carry weight safety indicator (warn when exceeding breed-appropriate % of body weight)

#### Age-Aware & Pet-Aware Defaults

- [ ] 0-4: no pack, all gear to unassigned pool for parents
- [ ] 5-7: tiny pack, only light personal items default to their pack
- [ ] 8-11: small pack, personal clothing/sleep defaults to their pack
- [ ] 12-15: full pack, can receive shared gear assignments
- [ ] 16+: adult pack
- [ ] All defaults overridable by parents
- [ ] Pets: own pack column, default carry limit 10-25% of body weight (adjustable)
- [ ] Pet gear that exceeds carry limit auto-routes to unassigned pool for humans to claim

#### Dark Mode

- [ ] Ship from day one (Tailwind dark mode class strategy)

### Tier 2 — Quality of Life

#### Sharing & Export

- [ ] Shareable read-only link per trip (purpose-built display page)
- [ ] Individual pack share link (for Reddit, trail journals)
- [ ] CSV export (per pack or whole trip)
- [ ] PDF export / print view
- [ ] LighterPack CSV import
- [ ] Generic CSV import

#### Checklist Mode

- [ ] Toggle any trip into checklist mode
- [ ] Per-person checklists (each person checks off their own pack)
- [ ] Progress indicator ("14/22 items packed")
- [ ] Mobile-first checklist design

#### Mobile

- [ ] Responsive closet (full functionality, not scaled-down desktop)
- [ ] Responsive checklist (priority mobile screen)
- [ ] Trip workspace on mobile: tabbed person-switcher, stacked packs
- [ ] Swipe to delete, long-press to reassign

#### Editing Power

- [ ] Keyboard navigation (Tab/arrow between fields and rows, `n` new, `d` delete)
- [ ] Bulk actions (multi-select for delete, move category, assign to pack)
- [ ] Undo/redo (Ctrl+Z)
- [ ] Full detail modal (optional expand for notes, image, links)
- [ ] Borrow partner's personal gear (marked as borrowed in your pack)

#### Reusable Kits

- [ ] Named item groups ("Cook Kit", "First Aid", "Shelter Setup")
- [ ] One-click add kit to pack
- [ ] Shared vs personal kits
- [ ] Kit weight summary in closet

#### Wishlist

- [ ] Mark items as wishlist/future upgrade in closet
- [ ] Filter closet to show wishlist items
- [ ] Optional: link wishlist item to the item it would replace (for weight comparison)

#### Cut List (Simplified What-If)

- [ ] Mark items in a trip as "considering cutting"
- [ ] Flagged items stay in the list but are visually dimmed
- [ ] Running total of potential weight savings
- [ ] "New base weight if cuts applied" preview
- [ ] One-click "apply cuts" (removes flagged items) or "clear" (unflags all)

#### "Not on This Trip" Visibility

- [ ] Collapsible section at bottom of trip workspace showing closet items not included
- [ ] Quick-add back to pack from this section
- [ ] Useful for post-trip review: "should I have brought the crocs?"

#### Activity Tags

- [ ] Tag categories or items with activity types (fishing, winter, ultralight, etc.)
- [ ] When creating a trip, select activities to auto-suggest relevant categories
- [ ] Filter closet by activity tag

#### Trip Templates

- [ ] Save any trip as a reusable template
- [ ] "Create from template" option in new trip flow (alongside "from scratch" and "copy previous")
- [ ] Default loadout per person — personal template that auto-populates their pack on any new trip
- [ ] Template stores: item assignments per role, shared gear assignments, quantities, worn/consumable overrides
- [ ] When creating from template, all packs pre-populated — user just tweaks for this specific trip

#### Trip Readiness System

- [ ] Readiness score (0-100%) calculated from: essentials coverage, shared gear assigned, pack balance, food adequacy
- [ ] Status bar on trip workspace header showing per-person readiness
- [ ] Essentials checker — fuzzy-matches item names/categories against Ten Essentials template
- [ ] Group-level checks (at least one fire source, first aid accessible, water treatment methods)
- [ ] Dog-specific essentials check (pack, food, first aid, waste bags, booties for terrain)
- [ ] Dismissable warnings — "That's fine for this trip" (persists per trip, not permanent)
- [ ] Contextual tips — smart suggestions based on pack contents and trip conditions

#### Trip-Type Templates

- [ ] Trip-type templates (auto-include categories by activity: "fishing trip" adds fishing gear)

#### Balance Intelligence

- [ ] Capacity % view (carry weight as % of max per person)
- [ ] Highlight most loaded person
- [ ] Auto-suggest rebalance (move one item to equalize percentages, one-click apply)
- [ ] "Assign carrier" dropdown when adding kid's gear

#### Pie Chart (Toggle)

- [ ] Secondary viz option for users who expect it from LighterPack

### Tier 3 — Differentiators

#### What-If Mode

- [ ] Ghost/remove items temporarily to see weight impact
- [ ] Item swap simulation ("what if I take the tarp instead of the tent?")
- [ ] Apply or discard (staging area for optimization)

#### Comparison View

- [ ] Side-by-side trip comparison (compare two past trips)
- [ ] Diff highlighting (added, removed, swapped items)
- [ ] Weight delta summary ("+2.4 lb vs last trip")

#### Trip Planning

- [ ] Calorie calculator per person (Pandolf equation, body stats + trip conditions)
- [ ] Water planning (estimated needs based on conditions)
- [ ] Distance and duration fields
- [ ] Macro breakdown (protein, fat, carbs)

#### Gear Intelligence

- [ ] Lighter alternative suggestions (community-driven)
- [ ] Weight optimization tips (flag heaviest item per category)
- [ ] Community-contributed weights on catalog items
- [ ] "N users report this weight" confidence indicator

#### Gear History & Trip Insights

- [ ] Track times each item has been packed across trips
- [ ] Identify core gear (packed every trip) vs occasional gear
- [ ] Actual vs planned weight per pack (post-trip logging)
- [ ] Per-trip notes: "what worked, what didn't"
- [ ] Per-item notes for next time ("bring the longer stakes")

#### Solo vs Group Analytics

- [ ] Separate base weight tracking for solo vs group trips
- [ ] Solo tax indicator ("solo loadout is 2.4 lb heavier than your group share")
- [ ] Separate weight goals for solo vs group

#### Gear Hand-Me-Downs

- [ ] Move item from one person's closet to another's
- [ ] Age-appropriate carry weight suggestions based on body weight

#### Loadout View

- [ ] Full-screen modal showing pack x-ray view — items organized by pack zone (brain, top, middle, bottom, external, side pockets, hip belt)
- [ ] Zone mapping derived from categories automatically (Sleep → bottom, Shelter → external, etc.)
- [ ] Person silhouette showing worn gear (equipped items)
- [ ] Dog loadout variant (saddle pack diagram)
- [ ] Group loadout view — all members side by side with shared gear distribution summary
- [ ] Missing essentials highlighted in the visual

#### Gamification Elements

- [ ] Pack class labels based on base weight (Ultralight/Lightweight/Light/Traditional/Heavy)
- [ ] Dog class labels based on carry % (Trail Runner/Trail Partner/Pack Dog/Overloaded)
- [ ] Gear veterancy — trip count per item (New/Breaking In/Trusted/Veteran/Legendary)
- [ ] Weight trend chart on hiker profile (base weight over time across trips)
- [ ] Party composition view — RPG-style party display with class labels and readiness
- [ ] Trip card readiness state — progress bar on trip list cards
- [ ] Cut challenges — track weight reduction goals with progress (items to replace/drop)
- [ ] Drop challenges — flag items to test leaving behind, post-trip "did you use it?" prompt
- [ ] Seasonal readiness — show which seasons you're equipped for and what's missing
- [ ] Shared gear carrier history — track who carries shared items most often across trips
- [ ] Household weight comparison — friendly per-household stats

### Tier 4 — Community & Polish

#### Community

- [ ] Public trip gallery (browse by trail, conditions, base weight)
- [ ] Fork / remix public lists into your closet
- [ ] Trail-specific browsing
- [ ] Comments and upvotes on public lists

#### Offline / PWA

- [ ] Service worker caching (view closet and trips offline)
- [ ] Offline checklist (check off items, sync on reconnect)
- [ ] Installable PWA (add to home screen)

#### Analytics Over Time

- [ ] Base weight trend across trips (line chart)
- [ ] Category weight trends
- [ ] Cost tracking (total gear investment, per category)
- [ ] Family weight comparison over time

#### Extras

- [ ] Image upload for gear items (Cloudflare R2 / Vercel Blob)
- [ ] Gear condition/lifespan tracking
- [ ] Kids' growth tracking (gear that fits now vs outgrown)

### Feature Count

| Tier | Features | Purpose |
|---|---|---|
| Tier 1 — Core | ~48 | Usable couples/family/pet gear app (added pet support, skin out total, % body weight) |
| Tier 2 — Quality of Life | ~42 | Feels complete and polished (added templates, readiness system, trip-type templates, cut list, not-on-trip view, activity tags, wishlist) |
| Tier 3 — Differentiators | ~37 | Reasons to switch from competitors (added loadout view, gamification elements, gear history, actual vs planned weight, trip notes) |
| Tier 4 — Polish | ~13 | Growth and community (trip-type templates moved to Tier 2) |
| **Total** | **~140** | |

---

## 5. Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| **Framework** | Next.js 14+ (App Router) | React-based, SSR for public share pages, API routes eliminate separate backend |
| **Language** | TypeScript | Type safety across frontend and API |
| **Database** | PostgreSQL on Neon | Free tier, relational data fits perfectly, `pg_trgm` for fuzzy catalog search |
| **ORM** | Drizzle | Lightweight, great TS inference, SQL-like syntax, better DX than Prisma at this scale |
| **Auth** | Auth.js (NextAuth v5) | Google OAuth to start, add email/password later |
| **Styling** | Tailwind CSS + shadcn/ui | Fast iteration, accessible components, dark mode built in |
| **Drag & Drop** | dnd-kit | Best React DnD library, handles reorder + cross-column drag |
| **Charts** | Recharts | React-native, simple API, handles bar + pie + progress |
| **Search** | PostgreSQL `pg_trgm` | Fuzzy typeahead for catalog, no Elasticsearch needed |
| **Image Storage** | Cloudflare R2 (Tier 4) | For gear photos, when/if added |
| **Hosting** | Vercel (start) -> Railway or self-host (scale) | Free tier to start, easy migration path |
| **State** | TanStack Query (React Query) | Server state caching, optimistic updates, refetching. React context for UI state only |

### Key Technical Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Weight storage | Integer grams | No floating point errors. 1g precision is more than enough. Display layer handles conversion |
| Real-time sync | Polling (5s interval) or SWR revalidation | WebSockets overkill for 2-6 users. Polling is simple and sufficient |
| Drag and drop library | dnd-kit | Handles reorder + cross-container drag. Active maintenance. Better than react-beautiful-dnd (deprecated) |
| Auto-save strategy | Debounced mutations (300ms) via TanStack Query + optimistic updates | Feels instant. Batches rapid edits. Rolls back on error |
| Catalog search | Server-side pg_trgm, debounced client requests (200ms) | Fuzzy matching in Postgres is fast for < 10k entries |
| Image storage | Defer to Tier 4 | Adds complexity. Not needed for MVP. URL field is enough for now |
| Mobile approach | Responsive web (PWA later in Tier 4) | Native app is months of extra work. Responsive covers 90% of use cases |
| Primary keys | UUID | Merge-safe if you ever need to combine databases, shard, or sync offline |

---

## 6. Data Model

### Full Drizzle Schema

```typescript
// src/db/schema.ts
import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  date,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

// ── Enums ──

export const weightUnitEnum = pgEnum("weight_unit", ["imperial", "metric"]);
export const ownerTypeEnum = pgEnum("owner_type", ["personal", "shared"]);
export const roleEnum = pgEnum("role", ["adult", "child", "pet"]);
export const sexEnum = pgEnum("sex", ["male", "female", "other"]);
export const seasonEnum = pgEnum("season", ["spring", "summer", "fall", "winter"]);
export const catalogSourceEnum = pgEnum("catalog_source", ["seed", "community"]);

// ── Household ──

export const households = pgTable("household", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  inviteCode: text("invite_code").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── User ──

export const users = pgTable("user", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email"),                              // nullable for pets/young kids
  imageUrl: text("image_url"),
  weightUnitPref: weightUnitEnum("weight_unit_pref").default("imperial"),
  bodyWeightKg: integer("body_weight_kg"),            // used for % body weight calc
  heightCm: integer("height_cm"),
  birthDate: date("birth_date"),
  sex: sexEnum("sex"),
  role: roleEnum("role").default("adult"),            // "adult" | "child" | "pet"
  breed: text("breed"),                               // pet breed/size (for carry guidelines)
  managedByUserId: uuid("managed_by_user_id").references(
    (): any => users.id
  ),                                                  // who manages this pet/child's closet
  householdId: uuid("household_id").references(() => households.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ── Category ──

export const categories = pgTable("category", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull().default("#6b7280"),
  icon: text("icon"),
  sortOrder: integer("sort_order").notNull().default(0),
  parentCategoryId: uuid("parent_category_id").references(
    (): any => categories.id
  ),
  householdId: uuid("household_id")
    .references(() => households.id)
    .notNull(),
});

// ── Item ──

export const items = pgTable("item", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  brand: text("brand"),
  model: text("model"),
  weightGrams: integer("weight_grams").notNull().default(0),
  categoryId: uuid("category_id").references(() => categories.id),
  ownerType: ownerTypeEnum("owner_type").notNull(),
  ownerId: uuid("owner_id").notNull(),
  isConsumable: boolean("is_consumable").default(false),
  isWorn: boolean("is_worn").default(false),
  soloAltId: uuid("solo_alt_id").references((): any => items.id),
  tags: text("tags").array(),
  notes: text("notes"),
  imageUrl: text("image_url"),
  catalogProductId: uuid("catalog_product_id").references(
    () => catalogProducts.id
  ),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ── Kit ──

export const kits = pgTable("kit", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  ownerType: ownerTypeEnum("owner_type").notNull(),
  ownerId: uuid("owner_id").notNull(),
  householdId: uuid("household_id")
    .references(() => households.id)
    .notNull(),
});

export const kitItems = pgTable("kit_item", {
  id: uuid("id").defaultRandom().primaryKey(),
  kitId: uuid("kit_id")
    .references(() => kits.id, { onDelete: "cascade" })
    .notNull(),
  itemId: uuid("item_id")
    .references(() => items.id, { onDelete: "cascade" })
    .notNull(),
  quantity: integer("quantity").default(1).notNull(),
});

// ── Trip ──

export const trips = pgTable("trip", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  location: text("location"),
  season: seasonEnum("season"),
  terrain: text("terrain"),
  tempRangeLowF: integer("temp_range_low_f"),
  tempRangeHighF: integer("temp_range_high_f"),
  isActive: boolean("is_active").default(true),
  dismissedWarnings: text("dismissed_warnings").array(),
  householdId: uuid("household_id")
    .references(() => households.id)
    .notNull(),
  createdByUserId: uuid("created_by_user_id")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tripMembers = pgTable("trip_member", {
  id: uuid("id").defaultRandom().primaryKey(),
  tripId: uuid("trip_id")
    .references(() => trips.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  maxCarryWeightGrams: integer("max_carry_weight_grams"),
  targetBaseWeightGrams: integer("target_base_weight_grams"),
});

export const tripPacks = pgTable("trip_pack", {
  id: uuid("id").defaultRandom().primaryKey(),
  tripId: uuid("trip_id")
    .references(() => trips.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  actualTotalWeightGrams: integer("actual_total_weight_grams"), // post-trip weigh-in
  tripNotes: text("trip_notes"),                                // "what worked, what didn't"
});

export const tripPackItems = pgTable("trip_pack_item", {
  id: uuid("id").defaultRandom().primaryKey(),
  tripPackId: uuid("trip_pack_id")
    .references(() => tripPacks.id, { onDelete: "cascade" })
    .notNull(),
  itemId: uuid("item_id")
    .references(() => items.id)
    .notNull(),
  ownedByUserId: uuid("owned_by_user_id").references(() => users.id),
  quantity: integer("quantity").default(1).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  isWornOverride: boolean("is_worn_override"),
  isConsumableOverride: boolean("is_consumable_override"),
  isBorrowed: boolean("is_borrowed").default(false),
});

// ── Catalog ──

export const catalogProducts = pgTable("catalog_product", {
  id: uuid("id").defaultRandom().primaryKey(),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  categorySuggestion: text("category_suggestion"),
  searchText: text("search_text").notNull(),
  source: catalogSourceEnum("source").default("seed"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Templates ──

export const templates = pgTable("template", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  householdId: uuid("household_id").references(() => households.id).notNull(),
  sourceTripId: uuid("source_trip_id").references(() => trips.id),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const templateItems = pgTable("template_item", {
  id: uuid("id").defaultRandom().primaryKey(),
  templateId: uuid("template_id").references(() => templates.id, { onDelete: "cascade" }).notNull(),
  itemId: uuid("item_id").references(() => items.id).notNull(),
  assignToRole: text("assign_to_role"),
  quantity: integer("quantity").default(1).notNull(),
  isWornOverride: boolean("is_worn_override"),
  isConsumableOverride: boolean("is_consumable_override"),
});
```

### Key Relationships

```
Household --< User (adults, children, AND pets)
Household --< Category
Household --< Trip
Household --< Kit

User --< User (managed_by_user_id — adult manages child/pet)
User --< Item (personal gear, via owner_type + owner_id)
Household --< Item (shared gear, via owner_type + owner_id)

Item >-- Category
Item >-- CatalogProduct (nullable)
Item >-- Item (solo_alt_id, self-referencing)

Kit --< KitItem >-- Item

Trip --< TripMember >-- User (including pets)
Trip --< TripPack >-- User (including pets — they get their own pack)
TripPack --< TripPackItem >-- Item
TripPackItem >-- User (owned_by_user_id — whose gear it IS)
TripPackItem's trip_pack_id determines whose pack it's IN (the carrier)
```

### The Key Design Insights

**Owner vs Carrier:** `TripPackItem` has two user references:
- **`trip_pack_id`** -> `TripPack.user_id` = who is **carrying** the item (carrier)
- **`owned_by_user_id`** = who **owns** the item (nullable = shared household gear)

This enables: parent carries kid's sleeping bag, human carries overflow dog food, partner carries shared tent.

**Pets as Users:** A pet is a User with `role: "pet"`, `managedByUserId` pointing to an adult, and `bodyWeightKg` for carry-limit calculations. No email, no login. Their closet is managed by the adult. In the trip workspace, they get their own pack column just like a kid. This reuses the entire existing architecture — no special "pet" tables needed.

This single distinction enables the entire parent-carries-kid's-gear workflow.

---

## 7. Page Structure & Routes

```
/                              Landing page (marketing)
/login                         Auth (Google OAuth)
/app                           Dashboard / redirect to active trip or closet
/app/closet                    Gear closet (tabs: Mine / Partner's / Shared)
/app/closet/[userId]           View a household member's closet (read-only if not yours)
/app/trips                     Trip list (past trips, create new)
/app/trips/new                 New trip flow ("Who's going?" -> metadata -> workspace)
/app/trips/[tripId]            Trip workspace (the main screen)
/app/trips/[tripId]/checklist  Checklist mode
/app/settings                  Profile, body stats, unit preference
/app/settings/household        Manage household, invite members
/share/[tripId]                Public read-only trip view (no auth required)
/share/[tripId]/[userId]       Public read-only single pack view
```

---

## 8. Project Folder Structure

```
/
├── src/
│   ├── app/
│   │   ├── (marketing)/
│   │   │   └── page.tsx                         Landing page
│   │   ├── (auth)/
│   │   │   └── login/page.tsx
│   │   ├── app/
│   │   │   ├── layout.tsx                       App shell (nav, auth guard)
│   │   │   ├── closet/
│   │   │   │   ├── page.tsx                     Gear closet
│   │   │   │   └── [userId]/page.tsx            View member's closet
│   │   │   ├── trips/
│   │   │   │   ├── page.tsx                     Trip list
│   │   │   │   ├── new/page.tsx                 New trip flow
│   │   │   │   └── [tripId]/
│   │   │   │       ├── page.tsx                 Trip workspace
│   │   │   │       └── checklist/page.tsx
│   │   │   └── settings/
│   │   │       ├── page.tsx                     Profile settings
│   │   │       └── household/page.tsx
│   │   ├── share/
│   │   │   └── [tripId]/
│   │   │       ├── page.tsx                     Public trip view
│   │   │       └── [userId]/page.tsx            Public single pack
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── catalog/search/route.ts
│   │       ├── items/route.ts
│   │       ├── items/[id]/route.ts
│   │       ├── trips/route.ts
│   │       ├── trips/[id]/route.ts
│   │       ├── trips/[id]/packs/route.ts
│   │       └── household/route.ts
│   ├── components/
│   │   ├── closet/
│   │   │   ├── item-row.tsx                     Inline-editable item row
│   │   │   ├── quick-add-bar.tsx                Category quick-add input
│   │   │   ├── catalog-typeahead.tsx            Fuzzy search dropdown
│   │   │   ├── category-group.tsx               Collapsible category with color bar
│   │   │   └── closet-tabs.tsx                  Mine / Partner / Shared
│   │   ├── trip/
│   │   │   ├── pack-column.tsx                  Single person's pack
│   │   │   ├── shared-gear-pool.tsx             Unassigned shared items
│   │   │   ├── weight-summary.tsx               Base/carry/budget display
│   │   │   ├── balance-indicator.tsx            Delta bar between packs
│   │   │   ├── trip-workspace.tsx               Main workspace layout
│   │   │   └── who-is-going.tsx                 Member selection for new trip
│   │   ├── charts/
│   │   │   ├── category-bar-chart.tsx
│   │   │   ├── weight-budget-bar.tsx
│   │   │   └── pie-chart-toggle.tsx
│   │   └── ui/                                  shadcn/ui components
│   ├── db/
│   │   ├── schema.ts                            Drizzle schema (all tables)
│   │   ├── index.ts                             DB connection
│   │   └── seed/
│   │       ├── categories.ts                    Default category seed
│   │       └── catalog.ts                       Import script for OWD + Featherweight
│   ├── lib/
│   │   ├── weight.ts                            Conversion utils (grams <-> oz/lb)
│   │   ├── auth.ts                              Auth config
│   │   └── utils.ts
│   └── hooks/
│       ├── use-items.ts                         TanStack Query hooks for items CRUD
│       ├── use-trips.ts
│       └── use-catalog-search.ts                Debounced catalog search hook
├── drizzle/
│   └── migrations/                              Generated migrations
├── scripts/
│   ├── seed-catalog.ts                          Catalog seed (OWD + Featherweight)
│   └── seed-dev-data.ts                         Dev seed (test household + gear)
├── docker-compose.yml                           Local Postgres for development
├── drizzle.config.ts
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 9. Catalog Seed Strategy

### Approach: Names Only

The catalog auto-populates product **names** (brand + model) only. Users enter their own measured weights. Manufacturer weights are notoriously off by 10-20%, and backpackers weigh their own gear anyway.

### Data Sources

| Source | Raw Entries | Format | After Cleanup | Usable Names |
|---|---|---|---|---|
| OpenWeightDatabase (GitHub) | ~30-60 | CSV: Brand, Model, Weight (g) | ~30-60 (already clean) | ~30-60 |
| Featherweight ul_items.txt (GitHub) | ~1,190 | CSV: weight, name (no brand/model split) | ~900 (after dedup) | ~300-500 |
| Your own gear | ~50-100 | Manual entry | All usable | ~50-100 |
| **Total seed** | | | | **~400-650** |

### OpenWeightDatabase Format

Located at `github.com/OpenWeightDatabase/OpenWeightDatabase/tree/main/db`. Organized by category folders (bags, climbing, clothes, electronics, hiking, hygiene, kitchen, running, skiing, sleeping, tools_and_accessories). Clean CSV with `Brand,Model,Weight (g)` columns. Very small — most files have 1-5 entries.

### Featherweight Format

Located at `github.com/MooseV2/featherweight/blob/master/docs/assets/ul_items.txt`. Simple CSV: `weight,item_name`. No header. ~1,190 entries but messy: no brand/model separation, duplicates, generic items ("Cup", "Fuel"), consumables mixed with gear, multi-language entries.

### Cleanup Pipeline

```
1. Fetch OpenWeightDatabase CSVs
   -> Parse brand + model from each CSV
   -> Tag with category from folder name
   -> Insert into CatalogProduct

2. Fetch Featherweight ul_items.txt
   -> Parse name column (ignore weight — unreliable)
   -> Deduplicate (case-insensitive)
   -> Remove generics ("Cup", "Fuel", "Camera")
   -> Remove consumables ("Benadryl", "Alcohol Pad")
   -> Match against known brand list (~100 brands) to split brand/model
   -> Insert matched entries into CatalogProduct
   -> Skip unmatched

3. Manual entry of your family's actual gear
   -> Becomes catalog entries with user consent
```

### Brand Matching Strategy

Maintain a list of ~100 known outdoor brands. Scan each Featherweight item name — if it starts with a known brand, split there. If not, skip.

```
Known brands: ["MSR", "Gossamer Gear", "Gossamergear", "Big Agnes",
"Therm-a-Rest", "Thermarest", "Black Diamond", "Sawyer", "Nemo",
"Zpacks", "Enlightened Equipment", "Columbia", "Patagonia", ...]

"Gossamergear Mariposa 2015" -> Brand: "Gossamer Gear", Model: "Mariposa 2015"
"3M Earplugs"                -> Brand: "3M", Model: "Earplugs"
"Cup"                        -> no brand match -> skip
```

### Deduplication (Future, as catalog grows)

Fuzzy matching + user-driven merge at entry time using PostgreSQL `pg_trgm`:

```
User types: "neoair xtherm"

  Did you mean one of these?
  * Therm-a-Rest NeoAir XTherm NXT
  * Therm-a-Rest NeoAir XTherm MAX
  * None of these -- create new entry
```

### Database Schema for Catalog

```sql
CREATE TABLE catalog_product (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  category_suggestion TEXT,
  search_text TEXT NOT NULL,  -- lowercase(brand + ' ' + model)
  source TEXT DEFAULT 'seed', -- 'seed' | 'community'
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_catalog_search_trgm
  ON catalog_product USING gin (search_text gin_trgm_ops);
```

### Catalog Search API

```typescript
// src/app/api/catalog/search/route.ts
import { db } from "@/db";
import { catalogProducts } from "@/db/schema";
import { sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q || q.length < 2) return NextResponse.json([]);

  const results = await db
    .select()
    .from(catalogProducts)
    .where(
      sql`similarity(${catalogProducts.searchText}, ${q.toLowerCase()}) > 0.15`
    )
    .orderBy(
      sql`similarity(${catalogProducts.searchText}, ${q.toLowerCase()}) DESC`
    )
    .limit(8);

  return NextResponse.json(results);
}
```

### Catalog UX Flow

```
Quick-add bar:

+---------------------------------------------------+
| [copper spur          ] [    oz] [qty: 1] [+]     |
|  +---------------------------------------+         |
|  | Big Agnes Copper Spur HV UL1         |         |
|  | Big Agnes Copper Spur HV UL2         | <- just |
|  | Big Agnes Copper Spur HV UL3         |  names  |
|  +---------------------------------------+         |
|                                                    |
|  User picks one -> name auto-fills                 |
|  Weight field is still empty -> user types it      |
+---------------------------------------------------+
```

---

## 10. Database & Hosting Setup

### Recommended Starting Stack

**Vercel (free) + Neon (free) = $0/month**

### Neon Free Tier Limits

| Resource | Limit | Our Usage |
|---|---|---|
| Storage | 0.5 GB per project | A few MB of gear data |
| Compute | 100 CU-hours/month | Near zero (scales to zero when idle) |
| Projects | Up to 20 | Only need 1 |
| Point-in-time restore | 6 hours of history | Fine for dev |

### Vercel Free (Hobby) Tier Limits

| Resource | Limit | Our Usage |
|---|---|---|
| Bandwidth | 100 GB/month | < 1 GB |
| Function invocations | 100,000/month | < 1,000 |
| Function duration | 10 seconds max | Queries take < 200ms |
| Build minutes | 6,000/month | ~5 min per deploy |
| Commercial use | **Prohibited** | Fine for personal tool |

### Setup Steps

#### 1. Create Neon Database

- Sign up at neon.com (Google/GitHub login)
- Create a project -> creates a default database
- Copy the connection string

#### 2. Install Dependencies

```bash
npx create-next-app@latest family-pack --typescript --tailwind --app --src-dir
cd family-pack

# Database (both drivers: Neon for prod, pg for local Docker)
npm install drizzle-orm @neondatabase/serverless pg
npm install -D drizzle-kit dotenv @types/pg

# Auth
npm install next-auth@beta @auth/drizzle-adapter

# UI
npx shadcn@latest init
npx shadcn@latest add button input table command dialog dropdown-menu tabs

# Charts + DnD
npm install recharts @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

#### 3. Environment Variables

```bash
# .env.local (never committed)
DATABASE_URL=postgresql://user:pass@ep-something.us-east-2.aws.neon.tech/neondb?sslmode=require
AUTH_SECRET=<generate with `npx auth secret`>
AUTH_GOOGLE_ID=<from Google Cloud Console>
AUTH_GOOGLE_SECRET=<from Google Cloud Console>
```

#### 4. Database Connection (dual driver: local pg + production Neon)

```typescript
// src/db/index.ts
import * as schema from "./schema";

function getDb() {
  if (process.env.NODE_ENV === "production" || process.env.USE_NEON === "true") {
    // Production / Staging: Neon serverless HTTP driver
    const { neon } = require("@neondatabase/serverless");
    const { drizzle } = require("drizzle-orm/neon-http");
    const sql = neon(process.env.DATABASE_URL!);
    return drizzle({ client: sql, schema });
  } else {
    // Local development: standard pg driver (works with Docker Postgres)
    const { drizzle } = require("drizzle-orm/node-postgres");
    const { Pool } = require("pg");
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    return drizzle({ client: pool, schema });
  }
}

export const db = getDb();
```

See [Section 11: Development Environments](#11-development-environments) for the full local/staging/production setup.

#### 5. Drizzle Config

```typescript
// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

#### 6. Run Migrations

```bash
# During active development (fast iteration):
npx drizzle-kit push

# For production (versioned migrations):
npx drizzle-kit generate
npx drizzle-kit migrate
```

#### 7. Seed Catalog

```bash
npx tsx scripts/seed-catalog.ts
```

#### 8. Deploy

```bash
npx vercel link
npx vercel env add DATABASE_URL
npx vercel env add AUTH_SECRET
npx vercel env add AUTH_GOOGLE_ID
npx vercel env add AUTH_GOOGLE_SECRET
npx vercel --prod
# Or just push to GitHub -- Vercel auto-deploys
```

### Architecture Diagram

```
+--------------+     HTTPS      +------------------+
|  Browser     | <------------> |  Vercel Edge +   |
|  (React)     |                |  Serverless Fns  |
+--------------+                |  (Next.js API)   |
                                +--------+---------+
                                         |
                                   neon-http driver
                                   (HTTP, not TCP)
                                         |
                                         v
                                +------------------+
                                |  Neon Postgres   |
                                |  (serverless)    |
                                |                  |
                                |  Scales to zero  |
                                |  when idle       |
                                +------------------+
```

### Hosting Comparison (for when you outgrow free tier)

| Platform | Cost | Database | Best For |
|---|---|---|---|
| **Vercel + Neon** (start here) | $0 free / $25/mo paid | Separate (Neon) | Best DX, fastest to start |
| **Railway** | $8-15/mo | Built-in Postgres | One platform for everything, no commercial restriction |
| **Render** | $7-15/mo | Built-in Postgres (90-day free) | Heroku-style simplicity |
| **Fly.io** | $3-10/mo | Fly Postgres | Global edge, WebSocket support |
| **Coolify + Hetzner** | $4-6/mo | Self-managed Postgres | Cheapest long-term, most control |

### Migration Path (Vercel+Neon -> Railway)

One file change:

```typescript
// Before (Neon HTTP)
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle({ client: sql, schema });

// After (standard Postgres)
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
```

---

## 11. Development Environments

### Overview

```
LOCAL (your machine)          STAGING (per PR)              PRODUCTION
+------------------+         +-------------------+         +-------------------+
| next dev         |         | Vercel Preview    |         | Vercel Prod       |
| localhost:3000   |         | pr-42.vercel.app  |         | familypack.vercel.app |
+--------+---------+         +--------+----------+         +--------+----------+
         |                            |                             |
         v                            v                             v
+------------------+         +-------------------+         +-------------------+
| Local Postgres   |         | Neon Branch       |         | Neon Main Branch  |
| (Docker)         |         | preview/feat-42   |         | main              |
| Port 5432        |         | (auto-created)    |         | (production data) |
+------------------+         +-------------------+         +-------------------+
```

### Environment Comparison

| | Local | Staging (per PR) | Production |
|---|---|---|---|
| **App** | `localhost:3000` | `feat-xyz.vercel.app` | `familypack.vercel.app` |
| **Database** | Docker Postgres | Neon branch (auto-created) | Neon main branch |
| **DB driver** | `pg` (node-postgres) | `@neondatabase/serverless` | `@neondatabase/serverless` |
| **Schema changes** | `drizzle-kit push` (direct) | `drizzle-kit migrate` (in build) | `drizzle-kit migrate` (in build) |
| **Data** | Seed scripts (fake/test) | Copy-on-write from production | Real user data |
| **Auth** | Google OAuth (localhost callback) | Google OAuth (Vercel preview URL) | Google OAuth (production URL) |
| **Cost** | $0 (Docker) | $0 (Neon free tier branches) | $0 (Neon free tier) |
| **Lifecycle** | Always running | Created on push, deleted on merge | Permanent |

### Local Development

Local dev uses Docker Postgres so you don't hit Neon over the internet. Faster, free, works offline, and you can blow it away and recreate without consequences.

#### Docker Compose

```yaml
# docker-compose.yml
services:
  db:
    image: postgres:16
    restart: unless-stopped
    environment:
      POSTGRES_USER: familypack
      POSTGRES_PASSWORD: familypack
      POSTGRES_DB: familypack
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

#### Environment Files

```bash
# .env.local (local dev — never committed)
DATABASE_URL=postgresql://familypack:familypack@localhost:5432/familypack
AUTH_SECRET=local-dev-secret
AUTH_GOOGLE_ID=<your-google-client-id>
AUTH_GOOGLE_SECRET=<your-google-client-secret>
```

#### Dual Driver Setup

Use Neon's HTTP driver in production and standard `pg` driver locally:

```typescript
// src/db/index.ts
import * as schema from "./schema";

function getDb() {
  if (process.env.NODE_ENV === "production" || process.env.USE_NEON === "true") {
    // Production / Staging: Neon serverless HTTP driver
    const { neon } = require("@neondatabase/serverless");
    const { drizzle } = require("drizzle-orm/neon-http");
    const sql = neon(process.env.DATABASE_URL!);
    return drizzle({ client: sql, schema });
  } else {
    // Local development: standard pg driver
    const { drizzle } = require("drizzle-orm/node-postgres");
    const { Pool } = require("pg");
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    return drizzle({ client: pool, schema });
  }
}

export const db = getDb();
```

Additional dependencies for local dev:

```bash
npm install pg
npm install -D @types/pg
```

#### Local Dev Workflow

```bash
docker compose up -d                      # Start local database
npx drizzle-kit push                      # Push schema directly (fast)
npx tsx scripts/seed-catalog.ts           # Seed catalog
npx tsx scripts/seed-dev-data.ts          # Seed test household + items
npm run dev                               # Start app at localhost:3000
npx drizzle-kit studio                    # Browse DB at localhost:4983

# Nuclear reset (blow away everything and rebuild)
docker compose down -v && docker compose up -d && npx drizzle-kit push && npm run db:seed:catalog && npm run db:seed:dev
```

### Staging (Vercel Preview + Neon Branches)

Every pull request gets its own Vercel preview deployment AND its own Neon database branch. Fully isolated.

#### How It Works

1. Push a branch: `git push origin feat/checklist-mode`
2. Vercel detects the push, starts a preview deployment
3. Neon integration creates a new branch: `preview/feat/checklist-mode`
4. Branch is an instant copy-on-write snapshot of main (production data + schema)
5. Vercel build runs `drizzle-kit migrate` against the preview branch
6. Preview is live at `feat-checklist-mode-abc123.vercel.app`
7. PR merged or closed -> Neon branch auto-deleted, preview archived

#### One-Time Setup

1. Vercel Dashboard -> Storage -> Browse Marketplace -> Neon
2. Connect your Neon project
3. Enable "Create a branch for every preview deployment"
4. Enable "Automatically delete obsolete Neon branches"

The integration auto-injects `DATABASE_URL` per environment:
- Production deploys -> Neon `main` branch
- Preview deploys -> auto-created `preview/*` branch
- Local dev -> you set it in `.env.local`

### Production

Production is the `main` branch on both Vercel and Neon.

```
git push origin main (or merge a PR)
  -> Vercel builds from main
  -> Runs drizzle-kit migrate against Neon main branch
  -> Deploys to production URL
```

### Schema Migration Strategy

| Environment | Tool | When |
|---|---|---|
| **Local** | `drizzle-kit push` | Fast iteration, no migration files. Diffs schema and applies directly |
| **Staging + Production** | `drizzle-kit generate` + `drizzle-kit migrate` | Versioned migration files committed with PRs. Runs during Vercel build |

Migration safety for production:

| Change | Safe? | Notes |
|---|---|---|
| Add a new table | Yes | Nothing depends on it yet |
| Add a nullable column | Yes | Existing rows get NULL |
| Add a column with a default | Yes | Existing rows get the default |
| Add a NOT NULL column without default | **No** | Fails if table has rows |
| Rename a column | **Risky** | Old code breaks during deploy window |
| Drop a column | **Risky** | Old code breaks during deploy window |

### Google OAuth Across Environments

Add all three redirect URIs in Google Cloud Console:

```
Authorized redirect URIs:
  http://localhost:3000/api/auth/callback/google          (local)
  https://*.vercel.app/api/auth/callback/google           (staging)
  https://familypack.vercel.app/api/auth/callback/google   (production)
```

### Dev Seed Data

```typescript
// scripts/seed-dev-data.ts
// Creates a test household with real gear data for development

const household = { name: "Test Household" };

const users = [
  { name: "Thomas", email: "thomas@test.com", role: "adult", bodyWeightKg: 82 },
  { name: "Partner", email: "partner@test.com", role: "adult", bodyWeightKg: 61 },
  { name: "Birch", role: "pet", bodyWeightKg: 25, breed: "Mixed" },
];

const items = [
  { name: "Tent", brand: "Nemo", model: "Dagger 2p", weightGrams: 1679, category: "Big Four", ownerType: "shared" },
  { name: "Backpack", brand: "ULA", model: "Ultra Catalyst", weightGrams: 1196, category: "Big Four", ownerType: "personal" },
  { name: "Sleeping Bag", brand: "Kelty", model: "Cosmic Ultra 800", weightGrams: 1232, category: "Big Four", ownerType: "personal" },
  { name: "Pack", brand: "Ruffwear", model: "Palisades with harness", weightGrams: 740, category: "Birch's Stuff", ownerType: "personal" },
  // ... rest of spreadsheet items
];
```

Staging (Neon branches) gets a copy-on-write of production data automatically — no manual seeding needed.

### Package Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "npm run db:migrate && next build",
    "start": "next start",
    "db:push": "drizzle-kit push",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio",
    "db:seed:catalog": "tsx scripts/seed-catalog.ts",
    "db:seed:dev": "tsx scripts/seed-dev-data.ts",
    "db:reset": "docker compose down -v && docker compose up -d && npm run db:push && npm run db:seed:catalog && npm run db:seed:dev"
  }
}
```

### Git + Deploy Flow

```
Feature Development:

  local                staging                  production
  ─────                ───────                  ──────────

  1. docker compose up -d
  2. npx drizzle-kit push
  3. npm run dev
  4. Write code, test locally

  5. npx drizzle-kit generate    (create migration file)
  6. git add + commit + push

                       7. Vercel preview deploy
                       8. Neon branch auto-created
                       9. drizzle-kit migrate runs
                      10. Preview live, test + review

  11. Merge PR to main
                                                12. Vercel prod deploy
                                                13. drizzle-kit migrate
                                                14. Live at familypack.vercel.app
```

---

## 12. Scaling Roadmap

### Cost by Scale

| Users | Cost | Stack | Effort |
|---|---|---|---|
| 2 (you + partner) | $0/mo | Vercel Free + Neon Free | Zero ops |
| 10-100 | $0/mo | Same | Zero ops |
| 100-1,000 | $25-40/mo | Vercel Pro + Neon Launch | Add billing |
| 1,000-10,000 | $70-300/mo | Vercel Pro + Neon Scale (or migrate) | Consider alternatives |
| 10,000+ | $200-1000+/mo | Likely self-hosted or Railway | Real ops decisions |

### Known Scaling Concerns

| Concern | When | Solution |
|---|---|---|
| Neon cold start (500ms-1s) | First request after idle | Set suspend timeout to 5 min. Add loading skeleton |
| Vercel 10-sec function limit (Hobby) | Large CSV imports | Break into chunks, or upgrade to Pro (300 sec limit) |
| Vercel commercial use restriction | Any monetization | Upgrade to Pro ($20/mo) |
| Vercel billing surprises | Viral traffic spike | Set spending alerts. Use Cloudflare CDN in front |
| Database connections | High concurrency | Not an issue with neon-http (stateless). If TCP, use PgBouncer |
| Catalog search performance | 50k+ entries | pg_trgm stays fast. Add tsvector full-text search if needed |
| Bundle size | Feature growth | Code-split. Dynamic imports for charts and DnD |

### Not Real Risks (at this scale)

| "Risk" | Why it's not a problem |
|---|---|
| "Postgres can't handle the load" | Postgres handles millions of rows trivially. Our data is tiny |
| "Serverless won't scale" | It auto-scales. That's the point |
| "We need microservices" | One database and one app. Microservices solve problems we'll never have |
| "We need Kubernetes" | No |

### Future-Proofing Decisions Already Made

| Decision | Why it's future-proof |
|---|---|
| Postgres | Industry standard. Every provider supports it. Migrate anywhere |
| Drizzle ORM with explicit schema | Schema in code. Switch providers by changing connection file |
| Next.js App Router | Deploy to Vercel, Netlify, Railway, Docker, bare Node |
| Neon HTTP driver | Only Vercel-specific piece. One file change to swap for `pg` pool |
| Integer grams for weight | No floating point errors at any scale |
| UUID primary keys | Merge-safe, shard-safe, offline-sync-safe |
| Closet items separate from trip pack items | Can add features without touching core schema |

---

## 13. Implementation Phases

### Phase 1: Foundation (Week 1-2)

```
Step 1: Project scaffold
  - npx create-next-app with TypeScript, Tailwind, App Router
  - Install dependencies (drizzle, next-auth, shadcn, recharts, dnd-kit)
  - Set up Neon database, Vercel project

Step 2: Database schema + migrations
  - All tables from data model
  - Seed migration with default categories
  - Catalog seed script (OpenWeightDatabase + Featherweight import)

Step 3: Auth
  - Google OAuth via Auth.js
  - User creation on first login
  - Session management

Step 4: Household
  - Create household
  - Generate invite code
  - Join household via code
  - Household settings page
```

### Phase 2: Gear Closet (Week 2-3)

```
Step 5: Closet -- read
  - Closet page with three tabs (Mine / Partner / Shared)
  - Items grouped by category with color bars
  - Weight display with contextual units
  - Search and filter

Step 6: Closet -- write
  - Inline editing (click to edit any field)
  - Quick-add bar with catalog typeahead
  - Drag-and-drop reorder (dnd-kit)
  - Category CRUD
  - Base/worn/consumable toggles
  - Auto-save via debounced API calls

Step 7: Catalog typeahead
  - pg_trgm fuzzy search endpoint
  - Debounced typeahead component on name field
  - "Add to catalog" prompt on manual entry
```

### Phase 3: Trip Workspace (Week 3-5)

```
Step 8: Trip management
  - Trip list page
  - New trip flow ("Who's going?" -> metadata)
  - Trip CRUD

Step 9: Trip workspace -- solo mode
  - Single pack column
  - Add items from personal + shared closet
  - Weight summary (base + carry + budget bar)
  - Bar chart by category

Step 10: Trip workspace -- group mode
  - Multi-column layout (side-by-side packs)
  - Shared gear pool at bottom
  - Drag shared gear between columns (dnd-kit cross-container)
  - Owner vs carrier tracking
  - "Carrying for" indicators
  - Unassigned kid gear pool
  - Weight balance indicator with delta
  - Carry weight limits + progress bars

Step 11: Weight visualization
  - Horizontal bar charts per pack (Recharts)
  - Weight budget progress bar
  - Weight heatmap on item rows
  - Balance percentage view
```

### Phase 4: Polish (Week 5-6)

```
Step 12: Mobile responsiveness
  - Closet: responsive grid/list
  - Trip workspace: tabbed person-switcher on mobile
  - Touch interactions: swipe, long-press

Step 13: Sharing
  - Public read-only trip page (/share/[tripId])
  - Individual pack share links
  - Clean, purpose-built display layout

Step 14: Dark mode
  - Tailwind dark mode class strategy
  - Toggle in settings + system preference detection

Step 15: Duplicate + solo swaps
  - Duplicate a trip
  - Solo alternative linking in closet
  - Auto-suggest swaps when creating solo trip from group template
```

### Phase 5: Tier 2 Features (Week 6-8+)

```
Step 16: Checklist mode
Step 17: Keyboard navigation + bulk actions + undo
Step 18: CSV/PDF export
Step 19: LighterPack import
Step 20: Reusable kits
Step 21: Auto-suggest rebalance
```

### Beyond

Tier 3 and 4 features based on actual usage and feedback. Don't build what you haven't needed yet.

### First Session Checklist

The very first coding session should produce:

1. Working Next.js app deployed to Vercel
2. Neon database connected with all tables created
3. Google OAuth login working
4. Household create + join flow
5. Catalog seeded with OpenWeightDatabase + Featherweight data
6. Basic closet page that displays items (even if editing isn't wired up yet)

That's a working skeleton you can iterate on. Everything after is incremental feature work on a running app.

---

## 14. Gamification & Loadout System

### Design Philosophy

Gamification should make existing tasks more satisfying, not add new tasks. The guiding principle: you're already planning a trip — the readiness score makes that feel more complete. You're already tracking weight — the class label makes that more meaningful. You're already building packs — the party view makes that more fun.

### Progressive Disclosure (Three Levels)

**Level 1: Status bar (always visible on trip workspace)**
A single row showing readiness per person. Most users never need more than this.

**Level 2: Essentials checklist (expandable panel)**
Click a person's status to see what's missing. One-click to fix.

**Level 3: Full loadout view (modal)**
Visual pack x-ray + person silhouette + group view. The RPG character sheet.

### Pack Class Labels

| Base Weight | Class | 
|---|---|
| Under 10 lb | Ultralight |
| 10-15 lb | Lightweight |
| 15-20 lb | Light |
| 20-30 lb | Traditional |
| Over 30 lb | Heavy |

Dog carry % labels: Trail Runner (<10%), Trail Partner (10-15%), Pack Dog (15-20%), Overloaded (>20%)

### Essentials Detection

Fuzzy matching on item names, brands, and categories — no manual tagging required. Matches against the Ten Essentials (shelter, sleep, food, water, insulation, rain gear, illumination, first aid, fire, navigation) plus dog-specific essentials.

### Gear Veterancy

| Trips | Label |
|---|---|
| 0 | New |
| 1-2 | Breaking In |
| 3-5 | Trusted |
| 6-10 | Veteran |
| 10+ | Legendary |

### Trip Templates

Save any trip as a template. Create new trips from templates with all gear pre-populated. Each person can have a default loadout that auto-populates when added to any trip.

### Anti-Patterns to Avoid

- No daily streaks or login rewards
- No XP or arbitrary points
- No public leaderboards that shame heavier hikers
- No mandatory gamification — all elements are informational, not blocking
- Labels describe style, not rank (Traditional is not "worse" than Ultralight)
- Warnings are dismissable, not gates

---

## Appendix: Sources & References

### Competitor Websites
- [Hikt](https://hikt.app/) — Smart Backpacking Gear Manager (best overall polish)
- [OutPack](https://outpack.app/) — Most feature-rich for trip lifecycle (group trips, food planner, journaling)
- [OutPack About](https://outpack.app/about) — Built by Andrew Carmichael
- [OutPack Review - Backpacker Magazine](https://www.backpacker.com/gear/outpack-app-review/) — "Best New Trip Planner"
- [PackStack](https://www.packstack.io/) — Best trip metadata and calorie calculator
- [PackStack Calorie Calculator](https://www.packstack.io/tools/backpacking-calorie-calculator)
- [PackStack vs PackWizard](https://www.packstack.io/learn/packstack-vs-packwizard)
- [PackWizard](https://www.packwizard.com/) — Best gear research and shopping
- [LighterPack](https://lighterpack.com/) — The legacy standard, best inline editing UX

### Data Sources for Catalog Seeding
- [OpenWeightDatabase (GitHub)](https://github.com/OpenWeightDatabase/OpenWeightDatabase) — Open source outdoor gear weights
- [Featherweight ul_items.txt (GitHub)](https://github.com/MooseV2/featherweight/blob/master/docs/assets/ul_items.txt) — ~1,190 ultralight gear entries
- [PackStack (GitHub)](https://github.com/Packstack-Tech/packstack) — Open source, reference for architecture

### Technical Documentation
- [Neon Docs](https://neon.com/docs/) — Serverless Postgres
- [Drizzle ORM Docs](https://orm.drizzle.team/) — TypeScript ORM
- [Drizzle + Neon Setup](https://orm.drizzle.team/docs/get-started/neon-new)
- [Auth.js (NextAuth)](https://authjs.dev/) — Authentication
- [shadcn/ui](https://ui.shadcn.com/) — Component library
- [dnd-kit](https://dndkit.com/) — Drag and drop
- [Recharts](https://recharts.org/) — React charts

### Hosting & Infrastructure
- [Vercel](https://vercel.com/) — Hosting
- [Neon Pricing](https://neon.com/pricing)
- [Railway](https://railway.app/) — Alternative hosting
- [Coolify](https://coolify.io/) — Self-hosted alternative
