# Family Pack — AI Agent Prompts

> Reusable prompts for AI design tools, code generators, and assistants.
> Copy the relevant prompt block and paste it into the target tool.

**Last updated:** April 15, 2026

---

## Table of Contents

0. [Compact Prompt (token-limited tools)](#0-compact-prompt)
1. [Full App Design System (Moonchild AI / Galileo AI)](#1-full-app-design-system)
2. [Individual Screen Generation (v0.dev)](#2-individual-screen-generation-v0dev)
3. [Tool Comparison & Workflow](#3-tool-comparison--workflow)

---

## 0. Compact Prompt

**Best for:** Tools with short input limits, free tiers, or when you just need a quick generation without the full brief.

```
Design UI for "Family Pack" — a backpacking gear app for couples, families,
and pets. Built with Next.js, Tailwind CSS, shadcn/ui. Dark mode.

KEY CONCEPT: A household where each person (and dog) has their own account,
gear closet, and pack. Shared gear gets assigned between packs. The app tracks
who OWNS gear vs who CARRIES it — a parent can carry a child's sleeping bag.

AESTHETIC: Earthy outdoor palette (forest green, warm stone, burnt orange,
slate gray). Data-dense like Notion/Linear. RPG-flavored labels (gear
veterancy, pack class labels like "Ultralight"/"Traditional", party
composition view) — clean and modern, not cartoon. Monospace numbers for
weight columns. Color-coded category borders on item groups.

SCREENS NEEDED:
1. Gear Closet — tabs (Mine/Partner/Dog/Shared), items by category with
   colored left borders, inline editing, weight summary, veterancy badges
2. Trip Workspace — side-by-side pack columns per member (including dog),
   shared gear pool at bottom, weight balance between packs, checklist toggle
3. Dashboard — household members, active trip card, quick stats
4. Loadout View — pack x-ray with zones (brain/top/mid/bottom/pockets/worn)
5. Party View — RPG-style member cards with pack class, readiness, essentials

WEIGHT DISPLAY: Items in oz, totals in lb+oz, imperial/metric toggle.
Base weight + total carried + skin-out total + % body weight per person.
Pack class labels: Ultralight (<10lb) / Lightweight / Light / Traditional / Heavy.
Dog classes by carry %: Trail Runner / Trail Partner / Pack Dog / Overloaded.

SAMPLE DATA: Thomas (185 lb, 26.7 lb base, "Traditional"), Partner, Birch
(55 lb dog, 11.1 lb carry, "Pack Dog"). Gear: Nemo Dagger 2p tent 59oz,
ULA Catalyst pack 42oz, Jetboil 16.6oz, Ruffwear Palisades dog pack 26oz.
Trip: Olympic NP — July 2026.
```

### Even Shorter — Single Screen Quick Prompt

For tools with very tight limits, use this as a prefix and add one screen:

```
"Family Pack" — backpacking gear app for couples/families/pets.
Next.js + Tailwind + shadcn/ui. Dark mode.
Earthy palette (forest green, stone, burnt orange, slate).
Data-dense, RPG-flavored labels, color-coded category borders.
Household model: each person + dog has own closet and pack column.
Owner vs carrier tracking. Weight in oz/lb, imperial/metric toggle.
```

Then append the specific screen, e.g.:

```
Build a Gear Closet page: tabs [Mine/Partner/Dog/Shared], items grouped by
category with colored left borders, inline editing, weight summary at top
(26.7 lb base — "Traditional"), veterancy badges on items, search bar,
quick-add row per category. Use real gear: Nemo Dagger 2p 59oz, ULA Catalyst
42oz, Kelty Cosmic 43oz, Petzl Tikkina 3.25oz.
```

---

## 1. Full App Design System

**Best for:** Moonchild AI, Galileo AI, Figma AI, or any tool that generates multi-screen design systems.

**When to use:** When you need a cohesive visual identity across all screens — palette, component patterns, layout consistency. Feed the entire prompt at once.

```
Design a complete UI/UX design system and all key screens for "Family Pack" —
a web app for backpacking gear management and trip planning, focused on
couples, families, and pets.

═══════════════════════════════════════════════════════════════════════════════
PRODUCT CONTEXT
═══════════════════════════════════════════════════════════════════════════════

## What Makes This App Different

No other gear app models a household. Most assume a single user. Family Pack
lets each person (and pet) have their own account, their own gear closet, and
their own pack — while sharing a household gear pool. The key data concept:
"owner vs carrier" — a parent can carry a child's sleeping bag, a human can
carry overflow dog food, shared gear gets dragged between packs.

## Competitive Landscape

The top 5 competitors are Hikt, OutPack, PackStack, PackWizard, and
LighterPack. All are single-account models. We own the household niche
exclusively. Our unique features: shared gear drag assignment between packs,
owner vs carrier distinction, weight balancing across family members, pets as
first-class trip members, RPG-flavored gamification (pack class labels, gear
veterancy, party composition view).

## Tech Stack

- Next.js + Tailwind CSS + shadcn/ui component library
- Dark mode from day one (Tailwind dark: class strategy)
- Desktop-first for the trip workspace, mobile-first for checklist mode
- Auto-save everywhere (no save buttons)
- Recharts for charts/visualizations
- dnd-kit for drag-and-drop

═══════════════════════════════════════════════════════════════════════════════
DESIGN PERSONALITY & VISUAL DIRECTION
═══════════════════════════════════════════════════════════════════════════════

## Personality

- Clean and functional, not cluttered — a backpacker's tool, not a social app
- RPG-inspired vocabulary and accents (gear "veterancy," pack "class labels,"
  "party composition") but NOT gamey/cartoon. Think: a well-designed character
  sheet, not a mobile game. Labels describe style, not rank — "Traditional" is
  not worse than "Ultralight"
- Outdoor/trail aesthetic — earthy tones, natural palette, subtle texture
- Data-dense but scannable — weight numbers everywhere, color-coded categories,
  heatmaps on heavy items
- Playful icon accents, not emoji overload

## Visual References & Mood

- Color palette: think REI/Cotopaxi earth tones — forest green, warm stone,
  burnt orange accents, slate grays. Not neon, not corporate blue.
- Data density inspiration: Notion tables, Linear issue tracker — clean but
  information-rich
- RPG accents inspiration: Baldur's Gate 3 inventory screen — organized grid
  zones, subtle parchment/leather texture hints, but modern and clean
- NOT: mobile game UI, social media feed, or minimalist lifestyle app

## Color System

- Category color bars: each gear category (Shelter, Sleep, Kitchen, Clothing,
  Tools, Birch's Stuff, etc.) gets a distinct left-border color, consistent
  across closet and trip views
- Weight heatmap: green-to-red tint on weight cells (lightest to heaviest
  within a category)
- Carry weight warnings: green/yellow/orange/red based on % of body weight
- Weight balance indicator: green = balanced between packs, red = lopsided
- Veterancy badge colors for gear trip count (New → Breaking In → Trusted →
  Veteran → Legendary)
- Pack class label colors (Ultralight, Lightweight, Light, Traditional, Heavy)
- Dog class label colors (Trail Runner, Trail Partner, Pack Dog, Overloaded)

## Typography & Layout

- Monospace or tabular numbers for weight columns (alignment matters)
- Compact data density — this is a tool for people who weigh their toothbrush
  handles, not a casual lifestyle app
- Generous whitespace between category groups, tight spacing within
- Sticky headers on scroll (category names, column headers)

═══════════════════════════════════════════════════════════════════════════════
APP SHELL & NAVIGATION
═══════════════════════════════════════════════════════════════════════════════

- Top nav bar: Family Pack logo, active trip shortcut, imperial/metric toggle,
  user avatar dropdown
- Side nav or top tabs: Dashboard, Gear Closet, Trips, (future: Analytics)
- Breadcrumb on trip workspace: Trips > Olympic NP July 2026
- Mobile: bottom tab bar (Dashboard, Closet, Trips, Profile)

═══════════════════════════════════════════════════════════════════════════════
KEY SCREENS
═══════════════════════════════════════════════════════════════════════════════

### 1. Dashboard / Home

- Household overview: members with avatars (adults, children, pets)
- Active trip card with readiness status
- Quick stats: total gear count, household base weight
- Invite code for adding household members
- Body weight input (inline editable, respects imperial/metric toggle)

### 2. Gear Closet

- Full-page view with tabs: [Mine] [Partner's Name] [Pet's Name] [Shared]
- Items grouped by category with colored left border bars
- Inline editing on all cells (name, weight, quantity, type)
- Quick-add bar at bottom of each category group (persistent input row)
- Catalog typeahead dropdown when typing item names
- Weight summary at top (base weight, total, skin-out total, % body weight)
- Search/filter bar
- Veterancy labels on items (color-coded badges: "Breaking In", "Trusted",
  "Veteran", "Legendary" with trip count)
- Type toggle per item: Carried / Worn / Consumable
- Collapsible category groups

### 3. Trip Workspace — Couples/Group Mode

- Side-by-side pack columns (one per trip member, including pets)
- Each column shows items grouped by category with the same color bars
- Shared gear pool at bottom (unassigned shared items, draggable)
- Per-column weight summary: base weight, total carried, skin-out, % body wt
- Carry weight progress bars per person (fill toward user-defined limit)
- Weight balance indicator bar between columns (delta display)
- Visual indicators: * for shared gear, ~ for "carrying for someone else"
- Checklist toggle in header — adds checkboxes, progress bar ("5/22 packed"),
  strikethrough on checked items
- Bar chart by category per pack

### 4. Trip Workspace — Family Mode (with kids + dog)

- 4-5 columns: You, Partner, Child (age 12), Child (age 7), Dog (Birch)
- Dog gets own pack column with breed-appropriate carry weight limit
- Young child column shows lighter load, overflow items in parent columns
- Carry weight as % of body weight per column, color-coded warnings
- "Carrying for" indicators when someone carries another member's gear

### 5. Trip Workspace — Mobile

- Tab bar at top to switch between members (swipe between)
- Single column view per person
- Large touch targets for checklist checkboxes
- Bottom action bar: [+ Add gear] [Balance]
- Optimized for the trailhead packing experience

### 6. Loadout View (Full-Screen Modal)

- Pack "x-ray" view with CSS grid layout
- Pack zones: Brain, Main Top, Main Mid, Main Bottom, Side Pockets, External,
  Hip Belt, Worn
- Items placed in zones based on category mapping
- Per-zone weight subtotals
- Person silhouette showing worn gear above the pack diagram
- Dog variant: saddle pack diagram with left/right panniers
- Group view: all members side by side in compact zone layout

### 7. Trip List Page

- Cards for each trip (name, dates, location, member avatars, base weight)
- Readiness progress bar on each card
- Smart auto-derived tags: "Cold Weather", "Dog Friendly", "Ultralight", etc.
- Duplicate trip button
- Active trip highlighted

### 8. What-If Mode (Trip Workspace Overlay)

- Toggle that dims the workspace and enables ghost items
- Add/remove items temporarily to see weight impact in real-time
- Item swap simulation ("what if tarp instead of tent?")
- Running delta display: "+1.2 lb" or "-3.4 lb" from current
- Apply or discard buttons

### 9. Party Composition View

- RPG-style party display showing all trip members
- Each member shows: name, pack class label (e.g. "Lightweight"),
  base weight, carry weight, % body weight, readiness score
- Dog shows dog-specific class labels (Trail Runner / Trail Partner /
  Pack Dog / Overloaded)
- Visual readiness indicators per person
- Ten Essentials checklist status per member

### 10. Sharing / Public View

- Purpose-built read-only display page (not the app with editing disabled)
- Clean layout optimized for sharing on Reddit, trail journals, forums
- Trip summary, pack contents by person, weight breakdowns
- Shareable URL per trip or per individual pack

### 11. Cut List & Wishlist

- Trip-level: items flagged as "considering cutting" with weight savings tally
- Closet-level: long-term optimization candidates
- Wishlist: replacement items with weight comparison to current gear
- Running total of potential weight savings

═══════════════════════════════════════════════════════════════════════════════
COMPONENT PATTERNS
═══════════════════════════════════════════════════════════════════════════════

- Inline editing: click any cell to edit, blue outline, Tab between fields,
  Enter/blur to save
- Category groups: collapsible with colored left border, item count + weight
  subtotal in header
- Progress bars: carry weight fill bars, checklist completion bars
- Badges: veterancy labels, pack class labels, smart trip tags
- Drag handles: subtle grip dots for reorder and cross-column drag
- Toast notifications for delete confirmations with undo
- Dialogs: add item, add to pack, new trip, trip details

═══════════════════════════════════════════════════════════════════════════════
WEIGHT DISPLAY CONVENTIONS
═══════════════════════════════════════════════════════════════════════════════

- Items under 16 oz: display in oz (e.g., "9.2 oz")
- Totals: display in lb + oz (e.g., "26 lb 10.5 oz")
- Imperial/metric toggle in the nav bar
- Always show: base weight, total carried, skin-out total
- Show % of body weight when body weight is entered
- Pack class label next to base weight (e.g., "26.7 lb — Traditional")

═══════════════════════════════════════════════════════════════════════════════
EMPTY STATES & ONBOARDING
═══════════════════════════════════════════════════════════════════════════════

- Empty closet: illustration + "Add your first piece of gear" CTA, with an
  option to import from LighterPack or start from a starter template
- Empty trip workspace: prompt to add gear from closet
- New household: guided flow — create household → invite partner → add pet →
  add first gear
- First trip creation: contextual tips explaining shared gear pool, carrier
  assignment, and checklist mode

═══════════════════════════════════════════════════════════════════════════════
USAGE CONTEXT
═══════════════════════════════════════════════════════════════════════════════

This app is used in two very different contexts:

1. At home (desktop): planning trips, optimizing weight, comparing gear —
   data-dense, multi-column, keyboard-driven
2. At the trailhead (phone, bright sun): checking off items as you pack the
   car — high contrast, large touch targets, minimal cognitive load

Design for both. The checklist mode IS the trailhead experience.

═══════════════════════════════════════════════════════════════════════════════
REAL SAMPLE DATA (use instead of generic placeholders)
═══════════════════════════════════════════════════════════════════════════════

Items:
- Nemo Dagger 2p (59.2 oz, Shelter, shared)
- ULA Ultra Catalyst (42.2 oz, Big Four, personal)
- Kelty Cosmic Ultra 800 (43.5 oz, Sleep, personal)
- Ruffwear Palisades w/ harness (26.1 oz, Birch's Stuff, pet)
- Birch's Food — 2 Meals (18.65 oz, Birch's Stuff, pet)
- Jet Boil w/ Stand (16.6 oz, Kitchen, shared)
- Sawyer Squeeze + accessories (5.7 oz, Kitchen, shared)
- Blue Petzl Tikkina (3.25 oz, Tools, personal)
- Arcteryx Kyanite hoodie (15.8 oz, Clothing, worn)
- Prana Stretch Zion pants (13.9 oz, Clothing, worn)
- Orange Thermarest chair (10.3 oz, Tools, personal)
- Fishing rod + reel (9.2 oz, Fishing, personal)

Trip members:
- Thomas (adult, 185 lb) — "Traditional" class, 26.65 lb base weight
- [Partner] (adult) — separate account, own closet and pack
- Birch (55 lb dog, Ruffwear Palisades pack) — "Pack Dog" class,
  11.1 lb carry weight (20.17% body weight)

Summary stats:
- Thomas base weight: 26.65 lb (14.41% body weight)
- Thomas total carried: 35.17 lb (19.01% body weight)
- Thomas skin out: 36.78 lb (19.88% body weight)
- Birch carry: 11.10 lb (20.17% of 55 lb body weight)

Categories: Big Four, Birch's Stuff, Clothing, Fishing, Kitchen/Food/Water,
Sleep, Tools & Utility

Trip name: Olympic NP — July 2026
```

---

## 2. Individual Screen Generation (v0.dev)

**Best for:** v0.dev, Bolt, Lovable, or any tool that outputs React + Tailwind code.

**When to use:** After you have a design direction established. Feed one screen at a time. Prefix each prompt with the design context block, then add the specific screen details.

### Design Context Prefix

Paste this before every individual screen prompt to maintain consistency:

```
You are generating a React component using Tailwind CSS and shadcn/ui for
"Family Pack" — a backpacking gear management app for couples, families,
and pets.

Design rules:
- Earthy outdoor palette: forest green, warm stone, burnt orange accents,
  slate grays. Dark mode support.
- Data-dense like Notion/Linear — compact rows, tabular-aligned numbers
- Category color bars: colored left borders on item groups
- Monospace/tabular numbers for weight columns
- Inline editing (click to edit, Tab between fields, Enter to save)
- Auto-save, no save buttons
- RPG-flavored labels (gear veterancy, pack class) but clean, not gamey
- shadcn/ui components: Card, Table, Badge, Dialog, Tabs, Progress, Button
```

### Screen-Specific Prompts

#### Gear Closet

```
[paste design context prefix above]

Build a Gear Closet page with:
- Tabs: [Mine] [Partner] [Birch] [Shared]
- Items grouped by category (Shelter, Sleep, Kitchen, Clothing, Tools, etc.)
  with colored left border bars and collapsible headers showing item count +
  weight subtotal
- Each item row: drag handle, name (inline editable), brand, weight in oz
  (inline editable), quantity, type badge (Carried/Worn/Consumable),
  veterancy badge (Breaking In/Trusted/Veteran/Legendary with color)
- Quick-add input row at bottom of each category
- Weight summary bar at top: base weight, total carried, skin-out total,
  % body weight, pack class label ("26.7 lb — Traditional")
- Search bar with filter dropdown
- Use real data: ULA Ultra Catalyst 42.2oz, Nemo Dagger 2p 59.2oz,
  Kelty Cosmic Ultra 800 43.5oz, Petzl Tikkina 3.25oz, etc.
```

#### Trip Workspace (Couples)

```
[paste design context prefix above]

Build a Trip Workspace for a couples backpacking trip with:
- Header: "Olympic NP — July 2026" with [Checklist] toggle and [Loadout] button
- Two side-by-side pack columns: "Thomas's Pack" and "Partner's Pack"
- Each column: items grouped by category with colored left borders
- Shared gear marked with a badge (* shared)
- "Carrying for" items marked with ~ indicator
- Per-column footer: base weight, total carried, skin-out, % body weight,
  carry weight progress bar
- Weight balance indicator between columns (delta: "0.7 lb — balanced")
- Shared gear pool at bottom: unassigned shared items as draggable chips
- When checklist mode is on: checkboxes per item, progress bar ("5/22 packed"),
  strikethrough + dim on checked items
- Use real data from the sample items listed above
```

#### Trip Workspace (Family + Dog)

```
[paste design context prefix above]

Build a Trip Workspace for a family trip with a dog:
- Header: "Olympic NP — July 2026" with [Balance] and [Checklist] toggles
- Five pack columns: Thomas, Partner, Alex (12), Sam (7), Birch (dog)
- Each column has items grouped by category with colored left borders
- Sam (age 7) has a light load — some items show "carrying for" in parent cols
- Birch (55 lb dog) column: Ruffwear Palisades pack, food, pet first aid,
  sweater, socks, bowl
- Per-column carry weight with % body weight, color-coded:
  Thomas 18.6/40 lb (47%bw green), Partner 16.2/35 lb (46%bw green),
  Alex 10.1/15 lb (67%bw!! red warning), Sam 3.4/8 lb (43%bw yellow),
  Birch 11.1/14 lb (20%bw of 55 lb dog, yellow)
- Legend at bottom: * = shared, ~ = carrying for someone, %bw = % body weight
- Shared pool: [none remaining]. Unassigned: [Sam's rain pants]
```

#### Loadout View

```
[paste design context prefix above]

Build a full-screen Loadout View modal showing a pack "x-ray":
- CSS grid layout with labeled pack zones: Brain (top), Main Top, Main Mid,
  Main Bottom (largest), Side Pockets (left + right), External (back),
  Hip Belt, Worn (above pack as separate section on person silhouette)
- Items placed in zones: Sleep gear → Main Bottom, Shelter → External,
  Kitchen → Main Top, Tools → Brain, Clothing → Main Mid
- Per-zone weight subtotal in zone header
- Total weight summary at bottom
- Person silhouette above pack showing worn items (pants, hoodie, boots)
- Use Thomas's real gear data
- Include a tab/toggle for "Dog Loadout" showing Birch's saddle pack variant
  with left/right panniers
```

#### Party Composition

```
[paste design context prefix above]

Build an RPG-style Party Composition view for a trip:
- Card per member arranged horizontally: Thomas, Partner, Birch (dog)
- Each card shows: avatar/icon, name, pack class label badge
  (Thomas: "Traditional", Partner: "Lightweight", Birch: "Pack Dog"),
  base weight, carry weight, % body weight with color indicator,
  readiness score (circular progress or bar)
- Ten Essentials status per member: icons for shelter, sleep, food, water,
  insulation, rain gear, light, first aid, fire, navigation —
  filled = present, outline = missing
- Dog card shows dog-specific essentials (pack, food, water, first aid,
  paw protection, leash)
- Overall party readiness summary at top
- Clean, modern card layout — RPG vocabulary but not cartoon
```

#### Dashboard

```
[paste design context prefix above]

Build a Dashboard / Home page:
- Household section: member avatars in a row (Thomas, Partner, Birch the dog)
  with names and roles underneath. Invite code with copy button.
- Active trip card: "Olympic NP — July 2026", member avatars, readiness
  progress bar, quick stats (base weight, items packed), "Open" button
- Personal stats card: body weight (185 lb, inline editable), base weight
  (26.65 lb), pack class ("Traditional" badge), gear count (70 items),
  trips completed (count)
- Quick actions: [New Trip] [Add Gear] [View Closet]
- Recent activity: last few items added or trips modified
```

#### Mobile Checklist

```
[paste design context prefix above]

Build a mobile Trip Checklist view (375px width):
- Top tab bar to switch between members: [Thomas] [Partner] [Birch]
  (swipeable, active tab highlighted)
- Single column item list grouped by category with colored left borders
- Each item: large checkbox (44px touch target), item name, weight,
  shared badge if applicable
- Checked items: strikethrough + dimmed, sink to bottom of category
- Progress bar at top: "14/22 items packed" with fill animation
- Bottom bar: [+ Add gear] [Balance view]
- High contrast for outdoor/sunlight readability
- No inline editing in this mode — tap item for detail sheet
```

---

## 3. Tool Comparison & Workflow

> Last researched: April 15, 2026. Pricing and features change — verify before purchasing.

### Overview

| Tool              | What It Does                                      | Output                                            | Pricing                                                                          | Free Tier                                            |
| ----------------- | ------------------------------------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------- |
| **Moonchild AI**  | Design system-aware screen generation from PRDs   | Figma, exports to Cursor/Claude Code/Lovable/Bolt | From $12/mo                                                                      | Yes (limited)                                        |
| **Motiff**        | Figma alternative with AI UI generation           | Editable designs, React/HTML code, copy to Figma  | Free (100 credits/mo), Pro $16/mo (1,000 credits)                                | Yes                                                  |
| **Figma Make**    | AI screen generation inside Figma ecosystem       | Figma files, uses your team libraries             | Included in Figma plans; AI credit packs $120-240/mo for heavy use, $0.03/credit | Yes (limited AI credits)                             |
| **Google Stitch** | Multi-screen app flows from text prompts          | Interactive designs + React code                  | **Free** (Google Labs phase)                                                     | **Entirely free** — 350 gens/mo standard, 200/mo pro |
| **v0**            | React component generation from prompts           | Production React + Tailwind + shadcn/ui code      | Free ($5 credits/mo), Premium $20/mo, Team $30/user/mo                           | Yes ($5 credits)                                     |
| **Lovable**       | Full-stack app builder from prompts               | Complete React + Supabase apps, GitHub sync       | Free (5 daily / 30 mo), Starter $25/mo, Pro $50/mo                               | Yes (limited)                                        |
| **Flowstep**      | Multi-screen flow generation on infinite canvas   | Figma export, React/TS/Tailwind code              | Free, Pro $15/mo, Professional $29/mo                                            | Yes                                                  |
| **UXPilot**       | AI wireframes + visual attention simulation       | Figma export, HTML/CSS code, Figma plugin         | Free (90 credits), paid from $15/mo, Pro $29/mo                                  | Yes (90 credits)                                     |
| **Visily**        | Screenshot-to-design, sketch-to-design, AI themes | Figma export, code export                         | Free (300 AI credits/mo, 2 boards), Pro ~$14/user/mo                             | Yes (limited)                                        |

### Ranked by Fit for Family Pack

#### Tier 1 — Primary tools

| Tool              | Why It Fits                                                                                                                                    | Limitation                                                                                      |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| **v0**            | Outputs our exact stack (React + Tailwind + shadcn). Screen-by-screen generation you can pull directly into the codebase.                      | No design system awareness — each generation is independent. You maintain consistency manually. |
| **Google Stitch** | **Free**, generates React code, multi-screen flows (up to 5 connected screens), powered by Gemini. Great for exploring layouts.                | Still in Labs — may change. Less control over component library.                                |
| **Moonchild**     | Best at generating a cohesive design system across many screens. Attach design tokens and every screen stays on brand. Exports to Claude Code. | Opaque credit system. Takes more prompting for small details. Not code-first.                   |

#### Tier 2 — Good for specific use cases

| Tool           | Best For                                                                                                                                               |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Lovable**    | Rapid clickable prototype to show people. Builds full React + Supabase apps. Not for pulling components into an existing codebase — it builds its own. |
| **Motiff**     | Cheapest Figma alternative with AI. Built-in shadcn design system. React/HTML code export. 25% of Figma's price.                                       |
| **Flowstep**   | Mapping the full app flow visually (onboarding -> closet -> trip -> checklist) on an infinite canvas before designing individual screens.              |
| **Figma Make** | Best if you're already paying for Figma. Uses your team libraries. AI credit costs add up fast for heavy use.                                          |

#### Tier 3 — Niche value

| Tool        | Useful For                                                                                                                        |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **UXPilot** | Visual attention simulation — "will users see the weight balance indicator?" Figma plugin for AI inside existing files.           |
| **Visily**  | Screenshot-to-design for reverse-engineering competitor UIs. Upload Hikt/OutPack/PackStack screenshots and get editable versions. |

### Recommended Strategy

```
1. Google Stitch (free)     → Explore full app flows, 5-screen sequences
2. Moonchild ($12/mo)       → Establish the design system + brand identity
3. v0 ($0-20/mo)            → Generate production React/shadcn components
4. Visily (free)            → Screenshot competitor apps for reference
```

Total: **$12-32/mo** for a full design pipeline, with most exploration on free tiers.

### Recommended Order

1. **Google Stitch** — Free exploration. Feed the compact prompt (Section 0),
   generate 5-screen flows to nail the layout and navigation patterns.

2. **Moonchild AI** — Feed the full design system prompt (Section 1). Generate
   all 11 screens with a cohesive visual identity. Establish the palette,
   component patterns, and layout system.

3. **v0** — Take individual screens and use the screen-specific prompts
   (Section 2) to generate working React + shadcn/ui code. Reference the
   Moonchild/Stitch designs as the visual target.

4. **Integrate** — Pull v0 components into the Family Pack codebase, adapt to
   existing patterns (WeightUnitProvider, TanStack Query hooks, Drizzle types).

### Tips

- Always feed real sample data (Thomas's gear, Birch the dog) rather than
  generic placeholders — designs feel more authentic and edge cases surface
- Start with the Trip Workspace (couples mode) — it's the most complex and
  differentiating screen. Get that right, then the other screens follow
- For Moonchild: request both light and dark mode variants upfront
- For v0: specify "use shadcn/ui components" explicitly in every prompt
- Iterate one screen at a time in v0 rather than asking for the whole app
- For Stitch: use the compact prompt — it handles shorter inputs well and
  you get 350 generations/mo to iterate freely
